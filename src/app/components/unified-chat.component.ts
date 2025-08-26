import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Inject,
  OnInit,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { io, Socket } from 'socket.io-client';
import { UserService } from '../service/user.service';
import { DataService } from '../service/data.service';
// import { NotificationService } from '../service/notification.service';

interface ChatSummary {
  productId: string;
  ownerId: string;
  buyerId?: string;
  ownerName?: string;
  productName?: string;
  productImage?: string;
  lastMessage?: string;
  lastTime?: string;
  googleId: string;
  hasNewMessage?: boolean;
  isOnline?: boolean; // Optional: for future use if needed
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
  styleUrls: ['./unified-chat.component.css'],
})
export class UnifiedChatComponent implements OnInit, AfterViewInit, OnDestroy {
  isChatListLoading = false;
  isMessagesLoading = false;
  socket!: Socket;
  currentUserId = '';
  chatList: ChatSummary[] = [];
  selectedChat: ChatSummary | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  buyerId = '';
  onlineUsers: Set<string> = new Set(); // Track online user IDs

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    public userService: UserService,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const userDetails = this.userService.getUserDetails();
    this.currentUserId = userDetails.googleId || userDetails.userId;

    if (this.data?.product) {
      const product = this.data.product;
      const isCurrentUserOwner = this.currentUserId === product.userId;
      this.selectedChat = {
        productId: product.pk,
        ownerId: product.userId,
        ownerName: '',
        productName: product.name,
        productImage: product.display_img_urls?.[0] || '',
        lastMessage: '',
        lastTime: '',
        buyerId: isCurrentUserOwner ? '' : this.currentUserId,
        googleId: this.currentUserId,
      };
      this.buyerId = isCurrentUserOwner ? '' : this.currentUserId;
      this.loadMessages(
        product.pk,
        product.userId,
        this.selectedChat.buyerId || this.buyerId
      );
    }
  }

  ngAfterViewInit() {
    const token = localStorage.getItem('userToken');
    this.socket = io(environment.apiBaseUrl, { auth: { token } });

    this.socket.on('connect', () => {
      this.joinAllChatRooms();
      // Request online users list after connecting
      this.socket.emit('getOnlineUsers');
    });

    this.socket.on('disconnect', () => {});

    // Listen for online users list from server
    this.socket.on('onlineUsers', (userIds: string[]) => {
      this.onlineUsers = new Set(userIds);
    });

    // Listen for user online/offline events
    this.socket.on('userOnline', (userId: string) => {
      this.onlineUsers.add(userId);
    });
    this.socket.on('userOffline', (userId: string) => {
      this.onlineUsers.delete(userId);
    });

    this.socket.off('chatMessage');
    this.socket.on('chatMessage', (msg: any) => {
      if (!this.selectedChat) return;
      const incomingChatId = msg.chatId;
      const selectedChatId = this.getChatId(
        this.selectedChat.ownerId,
        this.selectedChat.buyerId || this.buyerId,
        this.selectedChat.productId
      );
      if (incomingChatId === selectedChatId) {
        // Message for currently open chat
        const lastMsg = this.messages[this.messages.length - 1];
        if (
          lastMsg &&
          lastMsg.text === msg.message &&
          lastMsg.senderId === msg.senderId &&
          lastMsg.receiverId === msg.receiverId
        ) {
          return;
        }
        this.messages.push({
          text: msg.message,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          productId: msg.productId,
          chatId: msg.chatId,
        });
        setTimeout(() => this.scrollToBottom(), 0);
      } else {
        // Message for another chat: set hasNewMessage on that chat
        const chat = this.chatList.find(c => this.getChatId(c.ownerId, c.buyerId || this.buyerId, c.productId) === incomingChatId);
        if (chat) {
          chat.hasNewMessage = true;
        }
      }
    });

    this.fetchChatList();
  }
  // Returns true if the user (owner or buyer) is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // Join all chat rooms for this user
  joinAllChatRooms() {
    if (!this.chatList || this.chatList.length === 0) return;
    for (const chat of this.chatList) {
      if (!chat.buyerId) continue;
      const chatId = this.getChatId(chat.ownerId, chat.buyerId, chat.productId);
      this.socket.emit('joinRoom', { chatId });
    }
  }

  fetchChatList() {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const userId = this.currentUserId;
    this.isChatListLoading = true;
    this.http
      .get<ChatSummary[]>(`${environment.apiBaseUrl}/api/chat/list/${userId}`, {
        headers,
      })
      .subscribe({
        next: (list) => {
            // console.log(list,"list")
                 

            // const productIds = list.map(chat => chat.productId);
            // this.dataService.getProductById(productIds as any).subscribe((products) => {
            //     console.log(products, "products 123");
            // });
            // // Example: fetch product for the first chat in the list (if any)
            // if (list.length > 0) {
            //   this.dataService.getProductById(list[0].productId).subscribe((product) => {
            //     console.log(product,"product")
            //   });
            // }


          this.chatList = list.map((chat) => ({
            ...chat,
            googleId: this.currentUserId,
            ownerId: chat.ownerId,
          }));
          if (this.chatList.length) {
            const firstChat = this.chatList[0];
            this.selectedChat = { ...firstChat };
            this.loadMessages(
              firstChat.productId,
              firstChat.ownerId,
              firstChat.buyerId || this.buyerId
            );
            this.joinAllChatRooms();
          }
          this.isChatListLoading = false;
        },
        error: (err) => {
          this.isChatListLoading = false;
        },
      });
  }

  selectChat(chat: ChatSummary) {
    // Always use all three: productId, ownerId, buyerId
    const isNewChat =
      !this.selectedChat ||
      this.selectedChat.productId !== chat.productId ||
      this.selectedChat.ownerId !== chat.ownerId ||
      this.selectedChat.buyerId !== (chat.buyerId || this.buyerId);

    // Find chat with exact productId, ownerId, buyerId
    let foundChat = this.chatList.find(
      c => c.productId === chat.productId && c.ownerId === chat.ownerId && c.buyerId === (chat.buyerId || this.buyerId)
    );

    if (!foundChat) {
      foundChat = {
        ...chat,
        googleId: this.currentUserId,
        ownerId: chat.ownerId,
        buyerId: chat.buyerId || this.buyerId,
        lastMessage: '',
        lastTime: '',
      };
      if (isNewChat) {
        this.chatList.unshift(foundChat);
      }
    }

    // Only proceed if foundChat is defined
    if (!foundChat) {
      return;
    }
    this.selectedChat = {
      ...foundChat,
      googleId: this.currentUserId,
      ownerId: foundChat.ownerId,
    };
    // Clear new message indicator for all matching chats when chat is opened
    this.chatList.forEach(c => {
      if (
        c.productId === foundChat!.productId &&
        c.ownerId === foundChat!.ownerId &&
        c.buyerId === foundChat!.buyerId
      ) {
        c.hasNewMessage = false;
      }
    });
    if (isNewChat) {
      this.messages = [];
    }
    this.loadMessages(
      foundChat.productId,
      foundChat.ownerId,
      foundChat.buyerId || ''
    );
  }

  loadMessages(productId: string, ownerId: string, buyerId: string) {
    // Always require all three for chat history
    if (!buyerId || !ownerId || !productId) {
      this.messages = [];
      return;
    }
    this.isMessagesLoading = true;
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http
      .get<any[]>(
        `${environment.apiBaseUrl}/api/chat/history/${ownerId}/${buyerId}/${productId}`,
        { headers }
      )
      .subscribe({
        next: (history) => {
          if (history.length === 0) {
            // No messages yet for this chat
            this.messages = [];
          } else {
            this.messages = history.map((m) => ({
              text: m.message,
              time: new Date(m.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              senderId: m.senderId,
              receiverId: m.receiverId,
              productId: m.productId,
              chatId: this.getChatId(m.senderId, m.receiverId, m.productId),
            }));
          }
          setTimeout(() => this.scrollToBottom(), 0);
          this.isMessagesLoading = false;
        },
        error: (err) => {
          this.messages = [];
          this.isMessagesLoading = false;
        },
      });
  }
  sendMessage() {
    const text = this.newMessage.trim();
    if (!this.selectedChat || !text) {
      return;
    }
    const { ownerId, buyerId, productId } = this.selectedChat;
    this.selectedChat.googleId = this.currentUserId;
    this.selectedChat.ownerId = ownerId;
    this.selectedChat.buyerId = buyerId || this.buyerId || this.currentUserId;

    if (!ownerId || !this.selectedChat.buyerId) {
      return;
    }
    const senderId = this.currentUserId;
    const receiverId =
      senderId === ownerId ? this.selectedChat.buyerId : ownerId;
    const chatId = this.getChatId(
      ownerId,
      this.selectedChat.buyerId,
      productId
    );
    const msgPayload = {
      chatId,
      senderId,
      senderGoogleId: this.currentUserId,
      receiverId,
      receiverGoogleId: receiverId,
      productId,
      message: text,
      timestamp: Date.now(),
    };
    const lastMsg = this.messages[this.messages.length - 1];
    const isDuplicate =
      lastMsg && lastMsg.text === text && lastMsg.senderId === senderId;
    if (!isDuplicate) {
      this.messages.push({
        text,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderId,
        receiverId,
        productId,
        chatId,
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
  }
}

