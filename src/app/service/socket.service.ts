
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
    // Chat message pipeline
    this.socket.on('chatMessage', (msg: any) => this.messageSubject.next(msg));

    // Incoming call (signaling)
    this.socket.on('incoming_call', (data: any) => this.callSubject.next(data));

    // Presence
    this.socket.on('onlineUsers', (users: string[]) => this.onlineUsersSubject.next(users || []));

    // WebRTC signaling passthrough
    this.socket.on('webrtc_offer', (payload: any) => {
      // { offer, isVideo, ownerId, buyerId, productId }
      this.socket.emit('ack_webrtc_offer'); // optional
    });
    this.socket.on('webrtc_answer', (_payload: any) => {
      /* pass-through handled via onEvent in component */
    });
    this.socket.on('webrtc_ice_candidate', (_payload: any) => {
      /* pass-through handled via onEvent in component */
    });
  }
}
