import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  socket = io('http://localhost:4000');

  constructor() { }

  sendOrder(orderData: any) {
    this.socket.emit('placeOrder', orderData);
  }

  receiveOrder(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orderReceived', (data) => {
        console.log('FE data:', data);
        observer.next(data);
      });
    });
  }
}
