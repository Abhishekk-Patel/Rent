import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MyCartServiceService } from './my-cart-service.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private socket?: Socket;

  constructor(
    private http: HttpClient,
    private myCartService: MyCartServiceService
  ) {}

  /* ---------------- Socket ---------------- */

  /** Connect to Orders namespace (/orders) */
  connectToSocket(userEmail: string, userId?: string): void {
    // Already connected (or connecting)
    if (this.socket && (this.socket.connected || (this.socket as any).active)) {
      return;
    }

    this.socket = io(`${environment.socketUrl}/orders`, {
      transports: ['websocket', 'polling'],
      query: { email: userEmail, userId: userId || '' }, // ✅ include userId (safe)
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });

    // Logs (optional)
    this.socket.on('connect', () => {
      console.log('✅ Orders socket connected:', this.socket?.id);

      // ✅ join room automatically after connect (requires BE handler joinOrdersRoom)
      this.joinOrdersRoom(userEmail, userId);
    });

    this.socket.on('connect_error', (err) =>
      console.error('❌ Orders socket connect_error:', err?.message || err)
    );
    this.socket.on('disconnect', (reason) =>
      console.warn('⚠️ Orders socket disconnected:', reason)
    );
  }

  /** Ensure socket exists before using */
  private ensureSocket(): Socket {
    if (!this.socket) {
      throw new Error('Orders socket not connected. Call connectToSocket() first.');
    }
    return this.socket;
  }

  /** Join private room for realtime updates (buyer/owner) */
  joinOrdersRoom(email: string, userId?: string): void {
    try {
      const s = this.ensureSocket();
      s.emit('joinOrdersRoom', { email, userId }); // ✅ requires BE: socket.on("joinOrdersRoom"...)
    } catch (e) {
      console.warn('joinOrdersRoom skipped (socket not ready)');
    }
  }

  /** Send order data to server */
  sendOrder(orderData: any): void {
    const s = this.ensureSocket();
    s.emit('placeOrder', orderData);
  }

  /** Listen for order success event */
  receiveOrder(): Observable<any> {
    return new Observable((observer) => {
      const s = this.ensureSocket();

      const handler = (data: any) => {
        if (data?.message) {
          this.myCartService.showMessage(data.message);
        }
        observer.next(data);
      };

      s.on('orderReceived', handler);

      return () => {
        s.off('orderReceived', handler);
      };
    });
  }

  /** Listen for order error event */
  orderError(): Observable<any> {
    return new Observable((observer) => {
      const s = this.ensureSocket();
      const handler = (data: any) => observer.next(data);

      s.on('orderError', handler);

      return () => {
        s.off('orderError', handler);
      };
    });
  }

  /* ✅ Realtime status updates (requires BE emit "orderStatusUpdated") */
  listenOrderStatusUpdated(): Observable<{
    orderId: string;
    status: string;
    statusHistory?: any[];
    updatedAt?: any;
    rejectionReason?: string;
  }> {
    return new Observable((observer) => {
      const s = this.ensureSocket();

      const handler = (payload: any) => observer.next(payload);

      s.on('orderStatusUpdated', handler);

      return () => {
        s.off('orderStatusUpdated', handler);
      };
    });
  }

  /* Optional: Request current status via socket (requires BE "getOrderStatus" + "orderStatus") */
  requestOrderStatus(orderId: string): void {
    const s = this.ensureSocket();
    s.emit('getOrderStatus', { orderId });
  }

  listenOrderStatus(): Observable<any> {
    return new Observable((observer) => {
      const s = this.ensureSocket();
      const handler = (payload: any) => observer.next(payload);

      s.on('orderStatus', handler);

      return () => {
        s.off('orderStatus', handler);
      };
    });
  }

  /**
   * NOTE: your backend does NOT implement getReceivedOrders.
   * Keep only if you implement it server-side.
   */
  getReceivedOrders(): Observable<any[]> {
    return new Observable((observer) => {
      const s = this.ensureSocket();

      const handler = (orders: any[]) => observer.next(orders);

      s.emit('getReceivedOrders');
      s.on('receivedOrders', handler);

      return () => {
        s.off('receivedOrders', handler);
      };
    });
  }

  /* ------------------------------------------------------------------ */
  /* ✅ OWNER SOCKET ACTIONS: Seen / Accept / Reject                      */
  /* ------------------------------------------------------------------ */

  /** Owner marks order as seen */
  markOrderSeen(orderId: string): void {
    const s = this.ensureSocket();
    s.emit('markOrderSeen', { orderId });
  }

  /** Owner accepts order */
  acceptOrder(orderId: string): void {
    const s = this.ensureSocket();
    s.emit('acceptOrder', { orderId });
  }

  /** Owner rejects order (optional reason) */
  rejectOrder(orderId: string, reason?: string): void {
    const s = this.ensureSocket();
    s.emit('rejectOrder', { orderId, reason });
  }

  /** Disconnect socket */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /* ---------------- REST ---------------- */

  /** Fetch received notifications for a user by email (REST) */
  getReceivedOrder(email: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/notifications/${email}`);
  }

  /** Fetch your orders (REST) */
  getYourOrders(userEmail: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`)
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          console.error('Error fetching orders:', error);
          throw error;
        })
      );
  }

  /** Same as getYourOrders (kept for compatibility) */
  fetchOrders(userEmail: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        throw error;
      })
    );
  }

  /** ✅ NEW: get a single order by id (Track modal) */
  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/orders/order/${orderId}`).pipe(
      catchError((error) => {
        console.error('Error fetching order by id:', error);
        throw error;
      })
    );
  }

  /** ✅ NEW: update status safely (Owner action) */
  updateOrderStatus(orderId: string, status: string, reason?: string): Observable<any> {
    return this.http
      .patch(`${environment.apiBaseUrl}/orders/orderStatus/${orderId}`, { status, reason })
      .pipe(
        catchError((error) => {
          console.error('Error updating order status:', error);
          throw error;
        })
      );
  }
}
