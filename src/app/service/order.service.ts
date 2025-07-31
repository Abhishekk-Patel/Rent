import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private socket!: Socket;

  constructor(private http: HttpClient, private userService: UserService) {}

  connectToSocket(productOwnerEmail: string): void {
    // Ensure the socket connects with the product owner's email as a query parameter
    this.socket = io('https://rent-be.onrender.com:4000', {
      query: { email: productOwnerEmail }, // Send the product owner's email to the server
    });
  }

  // Send order data to the server
  sendOrder(orderData: any): void {
    this.socket.emit('placeOrder', orderData);
  }

  // Listen for the 'orderReceived' event
  receiveOrder(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('orderReceived', (data: any) => {
        console.log(' receiveOrder() service:', data);
        observer.next(data); // Push data to the observer
      });

      // Cleanup on completion
      return () => {
        this.socket.off('orderReceived');
      };
    });
  }

  // Fetch received orders
  getReceivedOrders(): Observable<any[]> {
    return new Observable((observer) => {
      this.socket.emit('getReceivedOrders');
      this.socket.on(' getReceivedOrders()', (orders: any[]) => {
        observer.next(orders);
      });

      // Cleanup on completion
      return () => {
        this.socket.off('receivedOrders service');
      };
    });
  }

  // Fetch your orders with error handling
  getYourOrders(userEmail: string): Observable<any[]> {
    return this.http
      .get(`https://rent-be.onrender.com/orders/fetchOrders/${userEmail}`)
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          console.error('Error fetching orders:', error);
          throw error; // Rethrow error or handle it as needed
        })
      );
  }

  // Fetch orders using a different method (just for consistency)
  fetchOrders(userEmail: string): Observable<any> {
    return this.http.get(`https://rent-be.onrender.com/orders/fetchOrders/${userEmail}`).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        throw error; // Rethrow error or handle it as needed
      })
    );
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }
}
