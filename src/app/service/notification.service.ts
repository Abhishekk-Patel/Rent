import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _unreadMessages = new BehaviorSubject<number>(0);
  unreadMessages$ = this._unreadMessages.asObservable();
  private socket: Socket | null = null;
  private userId: string | null = null;

  constructor(private userService: UserService) {
    this.initSocket();
  }

  private initSocket() {
    const userDetails = this.userService.getUserDetails();
    this.userId = userDetails.googleId || userDetails.userId;
    const token = localStorage.getItem('userToken');
    if (!token || !this.userId) return;
    this.socket = io(environment.apiBaseUrl, { auth: { token } });
    this.socket.on('connect', () => {
      // Join personal room for notifications
      this.socket?.emit('joinRoom', { chatId: this.userId });
    });
    this.socket.on('newMessageNotification', (notif: any) => {
      console.log('[Global Socket] Received newMessageNotification:', notif);
      this.increment();
    });
  }

  increment() {
    this._unreadMessages.next(this._unreadMessages.value + 1);
  }

  clear() {
    this._unreadMessages.next(0);
  }
}
