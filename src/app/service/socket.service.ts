import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  private messageSubject = new Subject<any>();
  private callSubject = new Subject<any>();
  private onlineUsersSubject = new Subject<string[]>();

  /** Connect to CHAT namespace (/chat) with JWT token */
  connect(token: string): void {
    if (this.socket && (this.socket.connected || this.socket.active)) return;

    this.socket = io(`${environment.socketUrl}/chat`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });

    this.registerEvents();

    // optional logs
    this.socket.on('connect', () => console.log('✅ Chat socket connected:', this.socket?.id));
    this.socket.on('connect_error', (err) => console.error('❌ Chat socket connect_error:', err?.message || err));
    this.socket.on('disconnect', (reason) => console.warn('⚠️ Chat socket disconnected:', reason));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  /** New generic listener */
  on<T = any>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      const waitForSocket = () => {
        if (!this.socket) {
          const t = setTimeout(waitForSocket, 50);
          return () => clearTimeout(t);
        }

        const handler = (data: T) => observer.next(data);
        this.socket.on(event, handler);

        return () => {
          this.socket?.off(event, handler);
        };
      };

      return waitForSocket();
    });
  }

  /** ✅ BACKWARD COMPAT: your component calls onEvent(...) */
  onEvent<T = any>(event: string): Observable<T> {
    return this.on<T>(event);
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

  private registerEvents(): void {
    if (!this.socket) return;

    this.socket.on('chatMessage', (msg: any) => this.messageSubject.next(msg));
    this.socket.on('incoming_call', (data: any) => this.callSubject.next(data));
    this.socket.on('onlineUsers', (users: string[]) => this.onlineUsersSubject.next(users || []));
  }
}
