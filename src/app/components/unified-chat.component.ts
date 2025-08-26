import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { io, Socket } from 'socket.io-client';
import { UserService } from '../service/user.service';

interface ChatSummary {
  productId: string;
  ownerId: string; // always product.userId
  buyerId?: string;
  ownerName?: string;
  productName?: string;
  productImage?: string;
  lastMessage?: string;
  lastTime?: string;
  googleId: string; // always current user ID
}

interface ChatMessage {
  text: string;
  time?: string;
  senderId: string;
  receiverId: string;
  productId: string;
  chatId: string;
}

@Component({
  selector: 'app-unified-chat',
  templateUrl: './unified-chat.component.html',
  styleUrls: ['./unified-chat.component.css']
})
export class UnifiedChatComponent implements OnInit, AfterViewInit, OnDestroy {
  socket!: Socket;
  currentUserId = '';
  chatList: ChatSummary[] = [];
  selectedChat: ChatSummary | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  buyerId = '';

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    public userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    
  }


  ngOnInit(): void {
    const userDetails = this.userService.getUserDetails();
    // Use googleId if available, else fallback to userId
    this.currentUserId = userDetails.googleId || userDetails.userId;

    if (this.data?.product) {
      const product = this.data.product;
      const isCurrentUserOwner = this.currentUserId === product.userId;
      this.selectedChat = {
        productId: product.pk,
        ownerId: product.userId, // always product.userId
        ownerName: '',
        productName: product.name,
        productImage: product.display_img_urls?.[0] || '',
        lastMessage: '',
        lastTime: '',
        buyerId: isCurrentUserOwner ? '' : this.currentUserId,
        googleId: this.currentUserId // always current user
      };
      this.buyerId = isCurrentUserOwner ? '' : this.currentUserId;
      this.loadMessages(product.pk, product.userId, this.selectedChat.buyerId || this.buyerId);
    }
  }



  ngAfterViewInit() {
    const token = localStorage.getItem('userToken');

  this.socket = io(environment.apiBaseUrl, { auth: { token } });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.connected);

      // Join all chat rooms after connecting
      this.joinAllChatRooms();
    });

    this.socket.on('disconnect', () => console.log('Socket disconnected'));

    this.socket.off('chatMessage');
    this.socket.on('chatMessage', (msg: any) => {
      console.log('Incoming socket message:', msg);

      if (!this.selectedChat) return;

      if (msg.chatId !== this.getChatId(this.selectedChat.ownerId, this.selectedChat.buyerId || this.buyerId, this.selectedChat.productId)) {
        // Message for a different chat - ignore here
        return;
      }

      const lastMsg = this.messages[this.messages.length - 1];
      if (lastMsg &&
          lastMsg.text === msg.message &&
          lastMsg.senderId === msg.senderId &&
          lastMsg.receiverId === msg.receiverId) {
        // Duplicate message - ignore
        return;
      }

      this.messages.push({
        text: msg.message,
        time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        productId: msg.productId,
        chatId: msg.chatId,
      });
      setTimeout(() => this.scrollToBottom(), 0);
    });

    this.fetchChatList();
  }

  // Join all chat rooms for this user
  joinAllChatRooms() {
    if (!this.chatList || this.chatList.length === 0) return;

    for (const chat of this.chatList) {
      if (!chat.buyerId) continue;

      const chatId = this.getChatId(chat.ownerId, chat.buyerId, chat.productId);
      console.log('Joining socket room:', chatId);
      this.socket.emit('joinRoom', { chatId });
    }
  }

  fetchChatList() {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const userId = this.currentUserId;
    this.http.get<ChatSummary[]>(`${environment.apiBaseUrl}/api/chat/list/${userId}`, { headers })
      .subscribe({
        next: list => {
          // Ensure googleId is always current user and ownerId is always product.userId
          this.chatList = list.map(chat => ({
            ...chat,
            googleId: this.currentUserId,
            ownerId: chat.ownerId
          }));
          if (this.chatList.length) {
            const firstChat = this.chatList[0];
            this.selectedChat = { ...firstChat };
            this.loadMessages(firstChat.productId, firstChat.ownerId, firstChat.buyerId || this.buyerId);
            this.joinAllChatRooms();
          }
        },
        error: err => console.error('Chat list error:', err)
      });
  }

  selectChat(chat: ChatSummary) {
    // Always set googleId to current user and ownerId to product.userId
    this.selectedChat = { ...chat, googleId: this.currentUserId, ownerId: chat.ownerId };
    this.loadMessages(chat.productId, chat.ownerId, chat.buyerId || this.buyerId);
  }

  loadMessages(productId: string, ownerId: string, buyerId: string) {
    if (!buyerId) {
      this.messages = [];
      return;
    }
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const [userA, userB] = [ownerId, buyerId].sort();
    this.http.get<any[]>(`${environment.apiBaseUrl}/api/chat/history/${userA}/${userB}/${productId}`, { headers })
      .subscribe({
        next: history => {
          this.messages = history.map(m => ({
            text: m.message,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: m.senderId,
            receiverId: m.receiverId,
            productId: m.productId,
            chatId: this.getChatId(m.senderId, m.receiverId, m.productId)
          }));
          setTimeout(() => this.scrollToBottom(), 0);
        },
        error: err => {
          this.messages = [];
        }
      });
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!this.selectedChat || !text) {
      return;
    }
    const { ownerId, buyerId, productId } = this.selectedChat;
    // Always set googleId to current user
    this.selectedChat.googleId = this.currentUserId;
    this.selectedChat.ownerId = ownerId;
    this.selectedChat.buyerId = buyerId || this.buyerId || this.currentUserId;

    if (!ownerId || !this.selectedChat.buyerId) {
      return;
    }
    const senderId = this.currentUserId;
    const receiverId = senderId === ownerId ? this.selectedChat.buyerId : ownerId;
    const chatId = this.getChatId(ownerId, this.selectedChat.buyerId, productId);
    const msgPayload = {
      chatId,
      senderId,
      senderGoogleId: this.currentUserId,
      receiverId,
      receiverGoogleId: receiverId,
      productId,
      message: text,
      timestamp: Date.now()
    };
    const lastMsg = this.messages[this.messages.length - 1];
    const isDuplicate = lastMsg && lastMsg.text === text && lastMsg.senderId === senderId;
    if (!isDuplicate) {
      this.messages.push({
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId,
        receiverId,
        productId,
        chatId
      });
      setTimeout(() => this.scrollToBottom(), 0);
    }
    this.socket.emit('chatMessage', msgPayload);
    this.newMessage = '';
  }

  // Helper to generate chatId from sorted user ids + product id
  getChatId(ownerId: string, buyerId: string, productId: string): string {
    const [userA, userB] = [ownerId, buyerId].sort();
    return `${userA}_${userB}_${productId}`;
  }

  scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  ngOnDestroy() {
    this.socket?.disconnect();
    console.log('Socket disconnected');
  }
}
