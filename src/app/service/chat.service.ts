import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ChatSummary {
  productId: string;
  ownerId: string;
  buyerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  avatarUrl?: string;
  productName?: string;
  productImage?: string;
  lastMessage?: string;
  lastTime?: string;
  googleId: string;
  hasNewMessage?: boolean;
  isOnline?: boolean;
}

export interface ChatMessage {
  text: string;
  time?: string;
  senderId: string;
  receiverId: string;
  productId: string;
  chatId: string;
  attachmentUrl?: string;
  attachmentType?: string;
  systemType?: 'call-ended' | 'missed-call' | 'call-rejected';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  fetchChatList(userId: string, token: string): Observable<ChatSummary[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<ChatSummary[]>(`${environment.apiBaseUrl}/api/chat/list/${userId}`, { headers });
  }

  loadMessages(productId: string, ownerId: string, buyerId: string, token: string): Observable<any[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/chat/history/${ownerId}/${buyerId}/${productId}`, { headers });
  }

  // Add more chat-related methods as needed
}
