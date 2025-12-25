
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, firstValueFrom } from 'rxjs';

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

  // Helper to generate chatId from sorted user ids + product id
  getChatId(ownerId: string, buyerId: string, productId: string): string {
    const [userA, userB] = [ownerId, buyerId].sort();
    return `${userA}_${userB}_${productId}`;
  }

  // Send a chat message (with optional file upload)
  async sendMessage(
    http: HttpClient,
    environmentRef: any,
    socketService: any,
    selectedChat: any,
    newMessage: string,
    selectedFile: File | null,
    currentUserId: string,
    buyerId: string,
    addMessageAndScroll: (msg: any) => void,
    setNewMessage: (val: string) => void,
    setSelectedFile: (val: File | null) => void
  ) {
    const text = (newMessage || '').trim();
    if (!selectedChat || (!text && !selectedFile)) return;

    const { ownerId, productId } = selectedChat;
    selectedChat.googleId = currentUserId;
    selectedChat.ownerId = ownerId;
    selectedChat.buyerId = selectedChat.buyerId || buyerId || currentUserId;

    if (!ownerId || !selectedChat.buyerId) return;

    const senderId = currentUserId;
    const receiverId = senderId === ownerId ? selectedChat.buyerId : ownerId;
    const chatId = this.getChatId(ownerId, selectedChat.buyerId, productId);

    let attachmentUrl = '';
    let attachmentType = '';
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const uploadRes: any = await firstValueFrom(
          http.post(`${environmentRef.apiBaseUrl}/api/upload`, formData)
        );
        attachmentUrl = uploadRes?.url || '';
        attachmentType = selectedFile.type.startsWith('image') ? 'image' : 'file';
      } catch {
        attachmentUrl = '';
        attachmentType = '';
      }
    }

    const msgPayload: any = {
      chatId,
      senderId,
      senderGoogleId: currentUserId,
      receiverId,
      receiverGoogleId: receiverId,
      productId,
      message: text,
      timestamp: Date.now(),
      attachmentUrl,
      attachmentType,
    };

    addMessageAndScroll({
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderId,
      receiverId,
      productId,
      chatId,
      attachmentUrl,
      attachmentType,
    });

    socketService.emit('chatMessage', msgPayload);
    setNewMessage('');
    setSelectedFile(null);
  }

  fetchChatList(userId: string, token: string): Observable<ChatSummary[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<ChatSummary[]>(`${environment.apiBaseUrl}/api/chat/list/${userId}`, { headers });
  }

  loadMessages(productId: string, ownerId: string, buyerId: string, token: string): Observable<any[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}/api/chat/history/${ownerId}/${buyerId}/${productId}`,
      { headers }
    );
  }
}
