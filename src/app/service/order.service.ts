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
    if (this.socket && (this.socket.connected || (this.socket as any).active)) {
      return;
    }

    this.socket = io(`${environment.socketUrl}/orders`, {
      transports: ['websocket', 'polling'],
      query: { email: userEmail },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Orders socket connected:', this.socket?.id);
      this.joinOrdersRoom(userEmail, userId);
    });

    this.socket.on('connect_error', (err) =>
      console.error('❌ Orders socket connect_error:', err?.message || err)
    );

    this.socket.on('disconnect', (reason) =>
      console.warn('⚠️ Orders socket disconnected:', reason)
    );
  }

  private ensureSocket(): Socket {
    if (!this.socket) {
      throw new Error('Orders socket not connected. Call connectToSocket() first.');
    }
    return this.socket;
  }

  joinOrdersRoom(email: string, userId?: string): void {
    try {
      const s = this.ensureSocket();
      s.emit('joinOrdersRoom', { email, userId });
    } catch (e) {
      console.warn('joinOrdersRoom skipped (socket not ready)');
    }
  }

  sendOrder(orderData: any): void {
    const s = this.ensureSocket();
    s.emit('placeOrder', orderData);
  }

  receiveOrder(): Observable<any> {
    return new Observable((observer) => {
      const s = this.ensureSocket();

      const handler = (data: any) => {
        if (data?.message) this.myCartService.showMessage(data.message);
        observer.next(data);
      };

      s.on('orderReceived', handler);

      return () => {
        s.off('orderReceived', handler);
      };
    });
  }

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

  listenOrderStatusUpdated(): Observable<any> {
    return new Observable((observer) => {
      const s = this.ensureSocket();
      const handler = (payload: any) => observer.next(payload);

      s.on('orderStatusUpdated', handler);

      return () => {
        s.off('orderStatusUpdated', handler);
      };
    });
  }

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

  /** ✅ OWNER ACTION SOCKET EMITS */
  markOrderSeen(orderId: string): void {
    const s = this.ensureSocket();
    s.emit('markOrderSeen', { orderId });
  }

  acceptOrder(orderId: string): void {
    const s = this.ensureSocket();
    s.emit('acceptOrder', { orderId });
  }

  rejectOrder(orderId: string, reason?: string): void {
    const s = this.ensureSocket();
    s.emit('rejectOrder', { orderId, reason: reason || '' });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /* ---------------- REST ---------------- */

  getReceivedOrder(email: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/notifications/${email}`);
  }

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

  fetchOrders(userEmail: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        throw error;
      })
    );
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/orders/order/${orderId}`).pipe(
      catchError((error) => {
        console.error('Error fetching order by id:', error);
        throw error;
      })
    );
  }

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
