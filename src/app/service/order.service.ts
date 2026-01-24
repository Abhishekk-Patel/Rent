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

  /** Connect to Orders namespace (/orders) */
  connectToSocket(productOwnerEmail: string): void {
    // Already connected (or connecting)
    if (this.socket && (this.socket.connected || this.socket.active)) {
      return;
    }

    this.socket = io(`${environment.socketUrl}/orders`, {
      transports: ['websocket', 'polling'],
      query: { email: productOwnerEmail }, // optional (your BE doesn't use it now)
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });

    // Helpful logs (remove later if you want)
    this.socket.on('connect', () => console.log('✅ Orders socket connected:', this.socket?.id));
    this.socket.on('connect_error', (err) => console.error('❌ Orders socket connect_error:', err?.message || err));
    this.socket.on('disconnect', (reason) => console.warn('⚠️ Orders socket disconnected:', reason));
  }

  /** Ensure socket exists before using */
  private ensureSocket(): Socket {
    if (!this.socket) {
      throw new Error('Orders socket not connected. Call connectToSocket() first.');
    }
    return this.socket;
  }

  /** Send order data to server */
  sendOrder(orderData: any): void {
    const s = this.ensureSocket();
    s.emit('placeOrder', orderData);
  }

  /** Fetch received notifications for a user by email (REST) */
  getReceivedOrder(email: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/notifications/${email}`);
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

  /**
   * NOTE: your backend does NOT implement getReceivedOrders.
   * Keep this only if you add that event on server.
   */
  getReceivedOrders(): Observable<any[]> {
    return new Observable((observer) => {
      const s = this.ensureSocket();

      const handler = (orders: any[]) => observer.next(orders);

      s.emit('getReceivedOrders');
      s.on('receivedOrders', handler); // ✅ FIXED event name (no spaces, proper name)

      return () => {
        s.off('receivedOrders', handler);
      };
    });
  }

  /** Fetch your orders (REST) */
  getYourOrders(userEmail: string): Observable<any[]> {
    return this.http
      .get(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`)
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

  /** Disconnect socket */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
}
