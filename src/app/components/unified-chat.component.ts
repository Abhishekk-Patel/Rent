import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Inject,
  OnInit,
} from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { UserService } from '../service/user.service';
import { DataService } from '../service/data.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { SocketService } from '../service/socket.service';
import { CallService } from '../service/call.service';
import { ChatService } from '../service/chat.service';
interface ChatSummary {
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
  isOnline?: boolean; // Optional: for future use if needed
}

interface ChatMessage {
  text: string;
  time?: string;
  senderId: string;
  receiverId: string;
  productId: string;
  chatId: string;
  attachmentUrl?: string; // For file/image attachments
  attachmentType?: string; // e.g. 'image', 'file', etc.
  systemType?: 'call-ended' | 'missed-call' | 'call-rejected'; // For system messages
}

@Component({
  selector: 'app-unified-chat',
  templateUrl: './unified-chat.component.html',
  styleUrls: ['./unified-chat.component.css'],
})
export class UnifiedChatComponent implements OnInit, AfterViewInit, OnDestroy {
  // Emoji picker options
  emojis: string[] = [
    '😀',
    '😂',
    '😍',
    '👍',
    '🙏',
    '🎉',
    '❤️',
    '😎',
    '😢',
    '🤔',
  ];
  // Helper to add a message and scroll to bottom
  addMessageAndScroll(msg: any) {
    this.messages.push(msg);
    setTimeout(() => this.scrollToBottom(), 0);
  }
  // Expose isVideoCall for template compatibility
  get isVideoCall() {
    return this.callState.isVideoCall;
  }
  // Call UI/logic state
  incomingCall: boolean = false;
  callFrom: string | null = null;
  callType: 'video' | 'audio' | null = null;
  callOffer: any = null;
  callOfferSender: string | null = null;
  callAudio: HTMLAudioElement | null = null; // For call.mp3 notification
  // WebRTC call state (moved to CallState for CallService)
  callState = {
    peerConnection: null as RTCPeerConnection | null,
    localStream: null as MediaStream | null,
    remoteStream: null as MediaStream | null,
    isVideoCall: false,
    selectedChat: null as any,
    localVideo: undefined as ElementRef | undefined,
    remoteVideo: undefined as ElementRef | undefined,
  };
  isCalling = false;
  isInCall = false;
  @ViewChild('localVideo') set localVideoRef(ref: ElementRef) {
    this.callState.localVideo = ref;
  }
  @ViewChild('remoteVideo') set remoteVideoRef(ref: ElementRef) {
    this.callState.remoteVideo = ref;
  }
  // Right-side profile panel state
  selectedProfile: ChatSummary | null = null;
  // Default avatar image (can be replaced with a real asset)
  defaultAvatar =
    'https://ui-avatars.com/api/?name=User&background=1976d2&color=fff&size=64';
  // Track which chat's popover is open
  popoverChat: ChatSummary | null = null;
  // Open the right-side profile panel
  openProfilePanel(chat: ChatSummary) {
    this.selectedProfile = chat;
  }

  // Close the right-side profile panel
  closeProfilePanel() {
    this.selectedProfile = null;
  }
  isChatListLoading = false;
  isMessagesLoading = false;
  // socket!: Socket; // Remove direct socket usage
  currentUserId = '';
  chatList: ChatSummary[] = [];
  selectedChat: ChatSummary | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  showEmojiPicker = false;
  // Handle file input change
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Handle emoji selection
  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }
  buyerId = '';
  onlineUsers: Set<string> = new Set(); // Track online user IDs

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    public userService: UserService,
    public dataService: DataService,
    public myCartService: MyCartServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private callService: CallService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Listen for call_rejected event so caller can update UI and state
    this.socketService.onEvent('call_rejected').subscribe(() => {
      if (this.isCalling) {
        this.isCalling = false;
        this.isInCall = false;
        this.callState.isVideoCall = false;
        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        this.sendSystemMessage(`Call rejected at ${timeStr}`, 'call-rejected');
        alert('Call was rejected');
      }
    });
    // Listen for call_accepted event so caller can update UI and start WebRTC
    this.socketService.onEvent('call_accepted').subscribe(() => {
      if (this.isCalling) {
        this.isCalling = false;
        this.isInCall = true;
        this.initWebRTC(true);
      }
    });
    const userDetails = this.userService.getUserDetails();
    this.currentUserId = userDetails.googleId || userDetails.userId;
    console.log('[Init] currentUserId:', this.currentUserId);

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
      console.log('[Init] selectedChat:', this.selectedChat);
      this.loadMessages(
        product.pk,
        product.userId,
        this.selectedChat.buyerId || this.buyerId
      );
    }

    // --- SOCKET INITIALIZATION AND EVENT LISTENERS ---
    const token = localStorage.getItem('userToken');
    this.socketService.connect(token!);
    console.log('[SocketService] Connecting to server with token:', token);

    // Listen for professional call signaling events
    this.socketService.onCall().subscribe((data: any) => {
      console.log('[SocketService] Received incoming_call', data);
      this.incomingCall = true;
      this.callFrom = data.from;
      this.callType = data.isVideo ? 'video' : 'audio';
      this.callOffer = null;
      this.callOfferSender = data.from;
      this.notificationService.playCallSound();
      console.log(
        '[State] incomingCall:',
        this.incomingCall,
        'callFrom:',
        this.callFrom,
        'callType:',
        this.callType
      );
    });

    this.socketService.onOnlineUsers().subscribe((userIds: string[]) => {
      this.onlineUsers = new Set(userIds);
      console.log('[SocketService] onlineUsers:', userIds);
    });

    this.socketService.onMessage().subscribe((msg: any) => {
      console.log('[SocketService] chatMessage:', msg);
      if (!this.selectedChat) return;
      const incomingChatId = msg.chatId;
      const selectedChatId = this.chatService.getChatId(
        this.selectedChat.ownerId,
        this.selectedChat.buyerId || this.buyerId,
        this.selectedChat.productId
      );
      if (incomingChatId === selectedChatId) {
        const lastMsg = this.messages[this.messages.length - 1];
        if (
          lastMsg &&
          lastMsg.text === msg.message &&
          lastMsg.senderId === msg.senderId &&
          lastMsg.receiverId === msg.receiverId
        ) {
          return;
        }
        this.addMessageAndScroll({
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
      } else {
        const chat = this.chatList.find(
          (c) =>
            this.chatService.getChatId(
              c.ownerId,
              c.buyerId || this.buyerId,
              c.productId
            ) === incomingChatId
        );
        if (chat) {
          chat.hasNewMessage = true;
        }
      }
    });

    // Listen for call_ended event from the server and end call on both sides
    this.socketService.onEvent('call_ended').subscribe(() => {
      this.endCall();
    });

    // TODO: Move WebRTC and call event listeners to SocketService or CallService for full modularization

    this.fetchChatList();
  }

  ngAfterViewInit() {
    // No socket logic here anymore; reserved for DOM logic if needed
    // (intentionally left blank)
  }
  // --- WebRTC Voice/Video Call Methods ---
  startCall(isVideo: boolean) {
    console.log('[Call] startCall called', {
      isVideo,
      currentUserId: this.currentUserId,
      selectedChat: this.selectedChat,
    });
    this.callState.isVideoCall = isVideo;
    this.isCalling = true;
    console.log(
      '[State] isVideoCall:',
      this.callState.isVideoCall,
      'isCalling:',
      this.isCalling
    );
    // Allow both buyer and owner to start a call
    if (this.selectedChat) {
      this.socketService.emit('incoming_call', {
        ownerId: this.selectedChat.ownerId,
        buyerId: this.selectedChat.buyerId,
        isVideo: isVideo,
        from: this.currentUserId,
      });
      console.log('[SocketService] Emitted incoming_call', {
        ownerId: this.selectedChat.ownerId,
        buyerId: this.selectedChat.buyerId,
        isVideo: isVideo,
        from: this.currentUserId,
      });
    }
  }

  async initWebRTC(isCaller: boolean) {
    // isVideoCall already set in startCall or acceptCall
    this.callState.selectedChat = this.selectedChat;
    await this.callService.initWebRTC(
      this.callState,
      isCaller,
      this.socketService,
      () => this.endCall()
    );
  }

  async handleOffer(offer: any, from: string, isVideo: boolean) {
    this.callState.isVideoCall = isVideo;
    this.callState.selectedChat = this.selectedChat;
    await this.callService.handleOffer(
      this.callState,
      offer,
      isVideo,
      this.socketService,
      () => this.endCall()
    );
    this.isInCall = true;
  }

  // Accept incoming call (owner)
  acceptCall() {
    if (!this.selectedChat) return;
    console.log('[Call] acceptCall called');
    this.incomingCall = false;
    this.isInCall = true; // Set immediately for UI
    this.isCalling = false;
    this.callState.isVideoCall = this.callType === 'video';
    // Stop call notification sound
    this.notificationService.stopCallSound();
    console.log(
      '[State] Accepting call. isVideoCall:',
      this.callState.isVideoCall
    );
    // Notify initiator
    this.socketService.emit('call_accepted', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
    });
    console.log('[Socket] Emitted call_accepted', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
    });
    // Wait for webrtc_offer from initiator
    this.callOffer = null;
    this.callOfferSender = null;
    this.callType = null;
  }

  // Reject incoming call (owner)
  rejectCall() {
    if (!this.selectedChat) return;
    console.log('[Call] rejectCall called');
    // Only send missed call if not in call
    if (!this.isInCall) {
      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      this.sendSystemMessage(`Missed call at ${timeStr}`, 'missed-call');
    }
    this.incomingCall = false;
    this.callOffer = null;
    this.callOfferSender = null;
    this.callType = null;
    // Stop call notification sound
    this.notificationService.stopCallSound();
    // Notify buyer
    this.socketService.emit('call_rejected', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
    });
    console.log('[Socket] Emitted call_rejected', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
    });
  }

  async handleAnswer(answer: any) {
    await this.callService.handleAnswer(this.callState, answer);
  }

  async handleIceCandidate(candidate: any) {
    await this.callService.handleIceCandidate(this.callState, candidate);
  }

  endCall() {
    // Only send 'call ended' if the call was actually received (in-call)
    if (this.selectedChat && this.isInCall) {
      this.sendSystemMessage('Call ended', 'call-ended');
    }
    // Only send 'missed call' if the call was never picked up (not in-call, but a call was attempted)
    if (
      this.selectedChat &&
      !this.isInCall &&
      (this.isCalling || this.incomingCall)
    ) {
      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      this.sendSystemMessage(`Missed call at ${timeStr}`, 'missed-call');
    }

    if (this.selectedChat && (this.isInCall || this.isCalling)) {
      this.socketService.emit('call_ended', {
        ownerId: this.selectedChat.ownerId,
        buyerId: this.selectedChat.buyerId,
      });
    }
    this.incomingCall = false;
    this.isInCall = false;
    this.isCalling = false;
    this.callState.isVideoCall = false;
    this.callType = null;
    this.callFrom = null;
    this.callOffer = null;
    this.callOfferSender = null;
    this.notificationService.stopCallSound();
    this.callService.cleanupCall(this.callState);
  }
  sendSystemMessage(
    text: string,
    systemType: 'call-ended' | 'missed-call' | 'call-rejected'
  ) {
    if (!this.selectedChat) return;
    const ownerId: string = this.selectedChat.ownerId;
    const buyerId: string = this.selectedChat.buyerId || this.buyerId || '';
    const productId: string = this.selectedChat.productId;
    const senderId: string = this.currentUserId;
    const receiverId: string = senderId === ownerId ? buyerId : ownerId;
    if (!ownerId || !buyerId || !productId || !receiverId) return;
    const chatId: string = this.chatService.getChatId(
      ownerId,
      buyerId,
      productId
    );
    const msgPayload: any = {
      chatId,
      senderId,
      receiverId,
      productId,
      message: text,
      timestamp: Date.now(),
      systemType: systemType,
    };
    this.addMessageAndScroll({
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderId,
      receiverId,
      productId,
      chatId,
      systemType: systemType,
    });
    this.socketService.emit('chatMessage', msgPayload);
  }

  // Returns true if the user (owner or buyer) is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // Helper to check if a chat is selected (compare by IDs, not object reference)
  isSelectedChat(chat: ChatSummary): boolean {
    if (!this.selectedChat) return false;
    return (
      chat.productId === this.selectedChat.productId &&
      chat.ownerId === this.selectedChat.ownerId &&
      (chat.buyerId || '') === (this.selectedChat.buyerId || '')
    );
  }
  // Join all chat rooms for this user
  joinAllChatRooms() {
    if (!this.chatList || this.chatList.length === 0) return;
    for (const chat of this.chatList) {
      if (!chat.buyerId) continue;
      const chatId = this.chatService.getChatId(
        chat.ownerId,
        chat.buyerId,
        chat.productId
      );
      this.socketService.emit('joinRoom', { chatId });
    }
  }

  fetchChatList() {
    const token = localStorage.getItem('userToken');
    const userId = this.currentUserId;
    this.isChatListLoading = true;
    this.chatService.fetchChatList(userId, token!).subscribe({
      next: (list) => {
        this.chatList = list.map((chat) => ({
          ...chat,
          googleId: this.currentUserId,
          ownerId: chat.ownerId,
          avatarUrl: chat.avatarUrl || (chat as any).ownerAvatar || '',
          ownerEmail: chat.ownerEmail || (chat as any).email || '',
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
      (c) =>
        c.productId === chat.productId &&
        c.ownerId === chat.ownerId &&
        c.buyerId === (chat.buyerId || this.buyerId)
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
    this.chatList.forEach((c) => {
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
    this.isMessagesLoading = true;
    this.chatService
      .loadMessages(productId, ownerId, buyerId, token!)
      .subscribe({
        next: (history) => {
          if (history.length === 0) {
            this.messages = [];
          } else {
            this.messages = history.map((m: any) => ({
              text: m.message,
              time: new Date(m.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              senderId: m.senderId,
              receiverId: m.receiverId,
              productId: m.productId,
              chatId: this.chatService.getChatId(
                m.senderId,
                m.receiverId,
                m.productId
              ),
            }));
          }
          setTimeout(() => this.scrollToBottom(), 0);
          this.isMessagesLoading = false;
        },
        error: (_err) => {
          this.messages = [];
          this.isMessagesLoading = false;
        },
      });
  }
  async sendMessage() {
    await this.chatService.sendMessage(
      this.http,
      environment,
      this.socketService,
      this.selectedChat,
      this.newMessage,
      this.selectedFile,
      this.currentUserId,
      this.buyerId,
      this.addMessageAndScroll.bind(this),
      (val: string) => {
        this.newMessage = val;
      },
      (val: File | null) => {
        this.selectedFile = val;
      }
    );
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
  getOnlineStatusClass(userId: string): string {
    return this.isUserOnline(userId) ? 'online' : 'offline';
  }
  getOnlineStatusText(userId: string): string {
    return this.isUserOnline(userId) ? 'Online' : 'Offline';
  }
  // Returns the CSS class for online/offline status dot

  ngOnDestroy() {
    this.socketService.disconnect();
    if (this.callAudio) {
      this.callAudio.pause();
      this.callAudio.currentTime = 0;
    }
  }
}
