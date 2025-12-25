
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NotificationService } from '../service/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserService } from '../service/user.service';
import { DataService } from '../service/data.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { SocketService } from '../service/socket.service';
import { CallService } from '../service/call.service';
import { ChatService } from '../service/chat.service';
import { Store } from '@ngrx/store';
import {
  Subject,
  combineLatest,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';

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
  lastTime?: Date | string | null;
  googleId: string;
  hasNewMessage?: boolean;
  isOnline?: boolean;
  productOwnerEmail?: string | null;
}

interface ChatMessage {
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

@Component({
  selector: 'app-unified-chat',
  templateUrl: './unified-chat.component.html',
  styleUrls: ['./unified-chat.component.css'],
})
export class UnifiedChatComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Responsive/mobile state
  isMobileScreen = false;
  showChatList = false;
  showProfilePanel = false;

  productData$ = this.store.select((state: any) => state?.productData ?? []);

  // Emoji picker options
  emojis: string[] = ['😀','😂','😍','👍','🙏','🎉','❤️','😎','😢','🤔'];

  // Call UI/logic state
  incomingCall = false;
  callFrom: string | null = null;
  callType: 'video' | 'audio' | null = null;
  callOffer: any = null;
  callOfferSender: string | null = null;
  callAudio: HTMLAudioElement | null = null;

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

  // Right-side profile panel state
  selectedProfile: ChatSummary | null = null;

  // Default avatar image
  defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=1976d2&color=fff&size=64';

  // Track which chat's popover is open
  popoverChat: ChatSummary | null = null;

  // Lists & message state
  isChatListLoading = false;
  isMessagesLoading = false;
  currentUserId = '';
  chatList: ChatSummary[] = [];
  selectedChat: ChatSummary | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  showEmojiPicker = false;
  buyerId = '';
  onlineUsers: Set<string> = new Set();

  // When owner navigates from product w/o buyerId, defer selection
  private pendingSelection: {
    productId: string;
    ownerId: string;
    productName?: string;
    productImage?: string;
  } | null = null;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Assign local/remote video elements
  @ViewChild('localVideo') set localVideoRef(ref: ElementRef) { this.callState.localVideo = ref; }
  @ViewChild('remoteVideo') set remoteVideoRef(ref: ElementRef) { this.callState.remoteVideo = ref; }

  constructor(
    public userService: UserService,
    public dataService: DataService,
    public myCartService: MyCartServiceService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private callService: CallService,
    private chatService: ChatService,
    private store: Store,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // --- Convenience getters ---
  get isVideoCall() { return this.callState.isVideoCall; }
  get canSend() { return !!this.selectedChat && !!this.newMessage.trim(); }

  // --- Lifecycle ---
  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    // Responsive detection
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isMobileScreen = state.matches;
        if (this.isMobileScreen) {
          this.showChatList = true;
          this.showProfilePanel = false;
        } else {
          this.showChatList = false;
          this.showProfilePanel = false;
        }
      });

    // Fallback resize listener
    this.updateScreenMode();

    // User identity
    const userDetails = this.userService.getUserDetails() || {};
    this.currentUserId = userDetails.googleId || userDetails.userId || '';

    // Establish socket
    const token = localStorage.getItem('userToken');
    if (token) {
      this.socketService.connect(token);
    }

    // Register socket listeners
    this.bindSocketListeners();

    // Read initial selected product/chat from routing (router state or params)
    this.initSelectedChatFromRoute();

    // Load the chat list
    this.fetchChatList();
  }

  ngAfterViewInit() { /* reserved if needed */ }

  ngOnDestroy() {
    // Clean up subscriptions and audio
    this.destroy$.next();
    this.destroy$.complete();

    if (this.callAudio) {
      this.callAudio.pause();
      this.callAudio.currentTime = 0;
    }

    // Disconnect socket (optional depending on your app topology)
    this.socketService.disconnect();
  }

  // --- Socket bindings ---
  private bindSocketListeners() {
    // Incoming call
    this.socketService.onCall()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        // data: { from, isVideo, ownerId, buyerId, productId, offer? }
        this.incomingCall = true;
        this.callFrom = data.from || null;
        this.callType = data.isVideo ? 'video' : 'audio';
        this.callOffer = data.offer ?? null;
        this.callOfferSender = data.from || null;
        this.notificationService.playCallSound();

        // Auto-select chat context if possible
        const ctxOwnerId = data.ownerId;
        const ctxBuyerId = data.buyerId;
        const ctxProductId = data.productId;

        if (ctxOwnerId && ctxBuyerId && ctxProductId) {
          // Find chat in list; if not found, create a temporary selected chat
          const found = this.chatList.find(
            (c) =>
              c.ownerId === ctxOwnerId &&
              c.buyerId === ctxBuyerId &&
              c.productId === ctxProductId
          );
          if (found) {
            this.selectChat(found);
          } else {
            // Create transient context to allow acceptCall to work
            this.selectedChat = {
              productId: ctxProductId,
              ownerId: ctxOwnerId,
              buyerId: ctxBuyerId,
              ownerName: '',
              productName: '',
              productImage: '',
              googleId: this.currentUserId,
              lastMessage: '',
              lastTime: '',
            };
            this.buyerId = ctxBuyerId;
          }
        }
      });

    // Online users presence
    this.socketService.onOnlineUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((userIds: string[]) => {
        this.onlineUsers = new Set(userIds || []);
      });

    // Chat messages
    this.socketService.onMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: any) => {
        const incomingChatId = msg.chatId;
        const selectedChatId = this.selectedChat
          ? this.chatService.getChatId(
              this.selectedChat.ownerId,
              this.selectedChat.buyerId || this.buyerId,
              this.selectedChat.productId
            )
          : null;

        // Update previews
        this.updateChatPreviewOnIncomingMessage(msg);

        if (selectedChatId && incomingChatId === selectedChatId) {
          const lastMsg = this.messages[this.messages.length - 1];
          if (
            lastMsg &&
            lastMsg.text === msg.message &&
            lastMsg.senderId === msg.senderId &&
            lastMsg.receiverId === msg.receiverId
          ) {
            return; // de-duplicate
          }

          this.addMessageAndScroll({
            text: msg.message,
            time: this.formatTime(msg.timestamp || Date.now()),
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            productId: msg.productId,
            chatId: msg.chatId,
            systemType: msg.systemType ?? undefined,
            attachmentUrl: msg.attachmentUrl ?? undefined,
            attachmentType: msg.attachmentType ?? undefined,
          });
        } else {
          // Show new dot
          const chat = this.chatList.find(
            (c) =>
              this.chatService.getChatId(
                c.ownerId,
                c.buyerId || this.buyerId,
                c.productId
              ) === incomingChatId
          );
          if (chat) chat.hasNewMessage = true;
        }
      });

    // Call control events
    this.socketService.onEvent('call_ended')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.endCall());

    this.socketService.onEvent('call_accepted')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isCalling) {
          this.isCalling = false;
          this.isInCall = true;
          this.initWebRTC(true); // caller initializes local, sends offer
        }
      });

    this.socketService.onEvent('call_rejected')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isCalling) {
          this.isCalling = false;
          this.isInCall = false;
          this.callState.isVideoCall = false;
          const timeStr = this.formatTime(Date.now());
          this.sendSystemMessage(`Call rejected at ${timeStr}`, 'call-rejected');
          alert('Call was rejected');
        }
      });

    // WebRTC signaling
    this.socketService.onEvent('webrtc_offer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload: any) => {
        // { offer, isVideo, ownerId, buyerId }
        this.handleOffer(payload.offer, this.callOfferSender || '', !!payload.isVideo);
        this.isInCall = true;
      });

    this.socketService.onEvent('webrtc_answer')
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (payload: any) => {
        await this.handleAnswer(payload.answer);
      });

    this.socketService.onEvent('webrtc_ice_candidate')
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (payload: any) => {
        // { candidate, ownerId, buyerId }
        await this.handleIceCandidate(payload.candidate);
      });
  }

  // --- Responsive fallback ---
  @HostListener('window:resize')
  updateScreenMode() {
    this.isMobileScreen = window.innerWidth <= 600;
    if (!this.isMobileScreen) {
      this.showChatList = false;
      this.showProfilePanel = false;
    }
  }

  // --- Route-driven initialization ---
  private initSelectedChatFromRoute() {
    const state = (this.router.getCurrentNavigation()?.extras?.state as any) || history.state || {};
    const routeParams = this.route.snapshot.paramMap;
    const query = this.route.snapshot.queryParamMap;

    // 1) Try state.product
    const productFromState = state.product;
    if (productFromState) {
      this.buildInitialSelectedChatFromProduct(productFromState);
      return;
    }

    // 2) Try compact state fields
    const compactState = {
      productId: state.productId ?? state.pk,
      ownerId: state.ownerId ?? state.userId,
      productName: state.productName ?? state.name,
      productImage: state.productImage ?? (state.display_img_urls ? state.display_img_urls[0] : ''),
    };
    if (compactState.productId && compactState.ownerId) {
      this.buildInitialSelectedChat(
        compactState.productId,
        compactState.ownerId,
        compactState.productName,
        compactState.productImage
      );
      return;
    }

    // 3) Try route params / query params
    const qpProductId = query.get('productId') || query.get('pk') || routeParams.get('productId') || routeParams.get('pk');
    const qpOwnerId = query.get('ownerId') || query.get('userId') || routeParams.get('ownerId') || routeParams.get('userId');
    const qpName = query.get('name') || query.get('productName') || '';
    const qpImage = query.get('image') || query.get('productImage') || '';

    if (qpProductId && qpOwnerId) {
      this.buildInitialSelectedChat(qpProductId, qpOwnerId, qpName, qpImage);
    }
  }

  private buildInitialSelectedChatFromProduct(product: any) {
    const isCurrentUserOwner = this.currentUserId === product.userId;

    if (isCurrentUserOwner) {
      this.pendingSelection = {
        productId: product.pk,
        ownerId: product.userId,
        productName: product.name,
        productImage: product.display_img_urls?.[0] || '',
      };
      this.selectedChat = null;
      this.buyerId = '';
      return;
    }

    this.selectedChat = {
      productId: product.pk,
      ownerId: product.userId,
      ownerName: '',
      productName: product.name,
      productImage: product.display_img_urls?.[0] || '',
      lastMessage: '',
      lastTime: '',
      buyerId: this.currentUserId,
      googleId: this.currentUserId,
    };
    this.buyerId = this.currentUserId;
    this.loadMessages(product.pk, product.userId, this.buyerId);
  }

  private buildInitialSelectedChat(productId: string, ownerId: string, productName?: string, productImage?: string) {
    const isCurrentUserOwner = this.currentUserId === ownerId;

    if (isCurrentUserOwner) {
      this.pendingSelection = { productId, ownerId, productName, productImage };
      this.selectedChat = null;
      this.buyerId = '';
      return;
    }

    this.selectedChat = {
      productId,
      ownerId,
      ownerName: '',
      productName: productName || '',
      productImage: productImage || '',
      lastMessage: '',
      lastTime: '',
      buyerId: this.currentUserId,
      googleId: this.currentUserId,
    };
    this.buyerId = this.currentUserId;
    this.loadMessages(productId, ownerId, this.buyerId);
  }

  // --- Emoji / file ---
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.selectedFile = file;
  }
  toggleEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  addMessageAndScroll(msg: ChatMessage) {
    this.messages.push(msg);
    setTimeout(() => this.scrollToBottom(), 0);
  }

  // --- WebRTC Voice/Video Call Methods ---
  startCall(isVideo: boolean) {
    if (!this.selectedChat) return;
    this.callState.isVideoCall = isVideo;
    this.isCalling = true;

    this.socketService.emit('incoming_call', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
      productId: this.selectedChat.productId,
      isVideo: isVideo,
      from: this.currentUserId,
    });
  }

  async initWebRTC(isCaller: boolean) {
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

  acceptCall() {
    if (!this.selectedChat) return;

    this.incomingCall = false;
    this.isInCall = true;
    this.isCalling = false;
    this.callState.isVideoCall = this.callType === 'video';
    this.notificationService.stopCallSound();

    // If we already have an offer, handle it first; otherwise init stack and wait for offer
    if (this.callOffer) {
      this.handleOffer(this.callOffer, this.callOfferSender || '', this.callType === 'video');
    } else {
      this.initWebRTC(false);
    }

    this.socketService.emit('call_accepted', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
      productId: this.selectedChat.productId,
    });

    this.callOffer = null;
    this.callOfferSender = null;
    this.callType = null;
  }

  rejectCall() {
    if (!this.selectedChat) return;

    if (!this.isInCall) {
      const timeStr = this.formatTime(Date.now());
      this.sendSystemMessage(`Missed call at ${timeStr}`, 'missed-call');
    }

    this.incomingCall = false;
    this.callOffer = null;
    this.callOfferSender = null;
    this.callType = null;
    this.notificationService.stopCallSound();

    this.socketService.emit('call_rejected', {
      ownerId: this.selectedChat.ownerId,
      buyerId: this.selectedChat.buyerId,
      productId: this.selectedChat.productId,
    });
  }

  async handleAnswer(answer: any) {
    await this.callService.handleAnswer(this.callState, answer);
  }

  async handleIceCandidate(candidate: any) {
    await this.callService.handleIceCandidate(this.callState, candidate);
  }

  endCall() {
    if (this.selectedChat && this.isInCall) {
      this.sendSystemMessage('Call ended', 'call-ended');
    }

    if (this.selectedChat && !this.isInCall && (this.isCalling || this.incomingCall)) {
      const timeStr = this.formatTime(Date.now());
      this.sendSystemMessage(`Missed call at ${timeStr}`, 'missed-call');
    }

    if (this.selectedChat && (this.isInCall || this.isCalling)) {
      this.socketService.emit('call_ended', {
        ownerId: this.selectedChat.ownerId,
        buyerId: this.selectedChat.buyerId,
        productId: this.selectedChat.productId,
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

    const chatId: string = this.chatService.getChatId(ownerId, buyerId, productId);

    const msgPayload: any = {
      chatId,
      senderId,
      receiverId,
      productId,
      message: text,
      timestamp: Date.now(),
      systemType,
    };

    this.addMessageAndScroll({
      text,
      time: this.formatTime(Date.now()),
      senderId,
      receiverId,
      productId,
      chatId,
      systemType,
    });

    this.socketService.emit('chatMessage', msgPayload);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  isSelectedChat(chat: ChatSummary): boolean {
    if (!this.selectedChat) return false;
    return (
      chat.productId === this.selectedChat.productId &&
      chat.ownerId === this.selectedChat.ownerId &&
      (chat.buyerId || '') === (this.selectedChat.buyerId || '')
    );
  }

  joinAllChatRooms() {
    if (!this.chatList || this.chatList.length === 0) return;
    for (const chat of this.chatList) {
      if (!chat.buyerId) continue;
      const chatId = this.chatService.getChatId(chat.ownerId, chat.buyerId, chat.productId);
      this.socketService.emit('joinRoom', { chatId });
    }
  }

  fetchChatList() {
    const token = localStorage.getItem('userToken');
    const userId = this.currentUserId;
    if (!token || !userId) return;

    this.isChatListLoading = true;

    const getNameFromEmail = (email: string): string => {
      if (!email) return '';
      const match = email.match(/^([^@]+)/);
      let name = match ? match[1] : '';
      if (name.includes('.')) name = name.split('.')[0];
      return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
    };

    this.chatService.fetchChatList(userId, token).pipe(
      switchMap((list: any[]) => {
        const productIds = list.map(item => item.productId);
        return combineLatest([
          of(list),
          this.productData$.pipe(
            map((products: any[]) => {
              const byId = new Map<string, any>(
                (products || []).map((p: any) => [p._id, p])
              );
              const mappedProducts = productIds.map((id) => byId.get(id));
              return mappedProducts;
            })
          ),
        ]);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([list, mappedProducts]) => {
        this.chatList = list.map((chat: any, index: number) => {
          const prod = mappedProducts[index];
          const productImg =
            prod?.images?.[0]?.url ??
            chat.productImage ??
            prod?.display_img_urls?.[0] ??
            null;

          const email =
            chat.ownerEmail ||
            chat.email ||
            prod?.productOwnerEmail ||
            '';

          const lastTimeVal = chat.lastTime ? new Date(chat.lastTime) : null;

          return {
            ...chat,
            googleId: this.currentUserId,
            ownerId: chat.ownerId,
            avatarUrl: chat.avatarUrl || chat.ownerAvatar || '',
            ownerEmail: email || '',
            ownerName: getNameFromEmail(email || ''),
            productImage: productImg,
            productOwnerEmail: prod?.productOwnerEmail || null,
            lastTime: lastTimeVal,
          } as ChatSummary;
        });

        // Auto-select logic
        if (this.pendingSelection) {
          const candidates = this.chatList.filter(
            c =>
              c.productId === this.pendingSelection!.productId &&
              c.ownerId === this.pendingSelection!.ownerId &&
              !!c.buyerId
          );

          if (candidates.length > 0) {
            // pick latest by lastTime
            const picked = candidates.sort((a, b) => {
              const ta = a.lastTime ? new Date(a.lastTime as any).getTime() : 0;
              const tb = b.lastTime ? new Date(b.lastTime as any).getTime() : 0;
              return tb - ta;
            })[0];

            this.selectChat(picked);
            this.pendingSelection = null;
          } else {
            // No buyer chats yet; show empty messages with header context
            this.selectedChat = {
              productId: this.pendingSelection.productId,
              ownerId: this.pendingSelection.ownerId,
              ownerName: '',
              productName: this.pendingSelection.productName || '',
              productImage: this.pendingSelection.productImage || '',
              lastMessage: '',
              lastTime: '',
              buyerId: '',
              googleId: this.currentUserId,
            };
            this.messages = [];
          }
        } else if (!this.selectedChat && this.chatList.length) {
          const firstChat = this.chatList[0];
          this.selectChat(firstChat);
        }

        // Join rooms
        this.joinAllChatRooms();
        this.isChatListLoading = false;
      },
      error: (err) => {
        console.error('Error fetching chat list:', err);
        this.isChatListLoading = false;
      }
    });
  }

  selectChat(chat: ChatSummary) {
    const isNewChat =
      !this.selectedChat ||
      this.selectedChat.productId !== chat.productId ||
      this.selectedChat.ownerId !== chat.ownerId ||
      this.selectedChat.buyerId !== (chat.buyerId || this.buyerId);

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
        lastMessage: chat.lastMessage || '',
        lastTime: chat.lastTime || '',
      };
      if (isNewChat) {
        this.chatList.unshift(foundChat);
      }
    }

    if (!foundChat) return;

    this.selectedChat = { ...foundChat, googleId: this.currentUserId, ownerId: foundChat.ownerId };
    this.buyerId = this.selectedChat.buyerId || this.buyerId;

    // Clear new indicator on matching entries
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

    this.loadMessages(foundChat.productId, foundChat.ownerId, foundChat.buyerId || '');
    if (this.isMobileScreen) this.showChatList = false;
  }

  loadMessages(productId: string, ownerId: string, buyerId: string) {
    if (!buyerId || !ownerId || !productId) {
      this.messages = [];
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      this.messages = [];
      return;
    }

    this.isMessagesLoading = true;

    this.chatService
      .loadMessages(productId, ownerId, buyerId, token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          if (!history || history.length === 0) {
            this.messages = [];
          } else {
            const consistentChatId = this.chatService.getChatId(ownerId, buyerId, productId);
            this.messages = history.map((m: any) => ({
              text: m.message,
              time: this.formatTime(m.timestamp),
              senderId: m.senderId,
              receiverId: m.receiverId,
              productId: m.productId,
              chatId: consistentChatId,
              systemType: m.systemType ?? undefined,
              attachmentUrl: m.attachmentUrl ?? undefined,
              attachmentType: m.attachmentType ?? undefined,
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
    if (!this.canSend) return;
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
      (val: string) => { this.newMessage = val; },
      (val: File | null) => { this.selectedFile = val; }
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
      event.preventDefault();
      this.sendMessage();
    }
  }

  getOnlineStatusClass(userId: string): string {
    return this.isUserOnline(userId) ? 'online' : 'offline';
  }
  getOnlineStatusText(userId: string): string {
    return this.isUserOnline(userId) ? 'Online' : 'Offline';
  }

  // Profile panel toggles
  openProfilePanel(chat: ChatSummary) {
    this.selectedProfile = chat;
  }
  closeProfilePanel() {
    this.selectedProfile = null;
  }

  // --- Helpers ---
  private formatTime(ts: number | string | Date): string {
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateChatPreviewOnIncomingMessage(msg: any) {
    const incomingChatId = msg.chatId;
    const target = this.chatList.find(
      (c) => this.chatService.getChatId(c.ownerId, c.buyerId || this.buyerId, c.productId) === incomingChatId
    );
    if (!target) return;

    target.lastMessage = msg.systemType
      ? (msg.systemType === 'call-ended'
          ? 'Call ended'
          : msg.systemType === 'missed-call'
          ? 'Missed call'
          : msg.systemType === 'call-rejected'
          ? 'Call rejected'
          : msg.message)
      : msg.message;

    target.lastTime = new Date(msg.timestamp || Date.now());
    target.hasNewMessage = !this.selectedChat || !this.isSelectedChat(target);

    // Sort list by latest activity
    this.chatList = [...this.chatList].sort((a, b) => {
      const ta = a.lastTime ? new Date(a.lastTime as any).getTime() : 0;
      const tb = b.lastTime ? new Date(b.lastTime as any).getTime() : 0;
      return tb - ta;
    });
  }

  trackByChat(_idx: number, chat: ChatSummary) {
    return `${chat.ownerId}-${chat.buyerId || ''}-${chat.productId}`;
  }
  trackByMsg(_idx: number, msg: ChatMessage) {
    return `${msg.chatId}-${msg.senderId}-${msg.receiverId}-${msg.time}-${msg.text}`;
  }
}
