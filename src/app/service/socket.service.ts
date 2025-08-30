

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private messageSubject = new Subject<any>();
  private callSubject = new Subject<any>();
  private onlineUsersSubject = new Subject<string[]>();

  connect(token: string): void {
    if (this.socket) return;
    this.socket = io(environment.apiBaseUrl, { auth: { token } });
    this.registerEvents();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined!;
    }
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }
    // Listen for arbitrary socket events
  onEvent(event: string): Observable<any> {
    return new Observable(observer => {
      // Wait until socket is defined
      const waitForSocket = () => {
        if (this.socket) {
          this.socket.on(event, (data: any) => observer.next(data));
        } else {
          setTimeout(waitForSocket, 50);
        }
      };
      waitForSocket();
    });
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onCall(): Observable<any> {
    return this.callSubject.asObservable();
  }

  onOnlineUsers(): Observable<string[]> {
    return this.onlineUsersSubject.asObservable();
  }

  private registerEvents() {
    this.socket.on('chatMessage', (msg: any) => this.messageSubject.next(msg));
    this.socket.on('incoming_call', (data: any) => this.callSubject.next(data));
    this.socket.on('onlineUsers', (users: string[]) => this.onlineUsersSubject.next(users));
    // Add more event handlers as needed
  }
}
