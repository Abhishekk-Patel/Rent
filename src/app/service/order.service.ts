import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { MyCartServiceService } from './my-cart-service.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private socket!: Socket;

  constructor(private http: HttpClient, private userService: UserService,private myCartService : MyCartServiceService) {}

  connectToSocket(productOwnerEmail: string): void {
    // Prevent multiple socket connections
    if (this.socket && this.socket.connected) {
      return;
    }
    // Use the correct socket URL
    // Use localhost by default, switch to apiBaseUrl for production or as needed
    this.socket = io(environment.socketUrl, {
      query: { email: productOwnerEmail },
    });
  }

  // Send order data to the server
  sendOrder(orderData: any): void {
    console.log(orderData,'order Data')
    this.socket.emit('placeOrder', orderData);
  }

  // Fetch received notifications for a user by email
  getReceivedOrder(email: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/notifications/${email}`);
  }
  // Listen for the 'orderReceived' event
  receiveOrder(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('orderReceived', (data: any) => {
        // Log and handle different messages for product owner and customer
        if (data && data.message === 'Order placed successfully') {
          this.myCartService.showMessage(data.message);
          console.log('Order placed successfully (customer):', data);
        } else if (data && data.message === 'New order received') {
          this.myCartService.showMessage(data.message);
          console.log('New order received (product owner):', data);
        } else if (data && data.message) {
          this.myCartService.showMessage(data.message);
          console.log('orderReceived:', data);
        }
        observer.next(data); // Push data to the observer
      });
      // Cleanup on completion
      return () => {
        this.socket.off('orderReceived');
      };
    });
  }
orderError(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('orderError', (data: any) => {
      observer.next(data);
    });
    return () => {
      this.socket.off('orderError');
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
      .get(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`)
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
    return this.http.get(`${environment.apiBaseUrl}/orders/fetchOrders/${userEmail}`).pipe(
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
