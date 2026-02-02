import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { UserService } from 'src/app/service/user.service';
import { OrderService } from 'src/app/service/order.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoadOrderData } from '../Store/productData.action';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
})
export class MyAccountComponent implements OnInit, OnDestroy {
  public confirmDeleteItem: any = null;
  public showOtpInput = false;
  public otp = '';
  public otpError = '';

  showTrackOrderModal: boolean = false;
  trackOrderData: any = null;

  private trackingOrderId: string | null = null;

  // ✅ Owner Reject modal
  showRejectModal: boolean = false;
  rejectTargetOrder: any = null;
  rejectReason: string = '';

  // Socket subscriptions
  private orderReceivedSub?: Subscription;
  private orderErrorSub?: Subscription;
  private orderStatusSub?: Subscription;
  private orderStatusUpdatedSub?: Subscription;

  userEditMode = false;
  editUser: any = {};
  user: any;

  userHistory: any[] = [];
  receivedOrders: any[] = [];
  yourOrders: any[] = [];

  orderSubscription: Subscription | null = null;
  isLoading: boolean = true;

  getOrderData$ = this.store.select('orderData');

  constructor(
    public userService: UserService,
    public router: Router,
    public dataService: DataService,
    private orderService: OrderService,
    private myCartService: MyCartServiceService,
    private store: Store<{ orderData: any[] }>
  ) {
    this.store.dispatch(
      LoadOrderData({ email: this.userService.getUserDetails().email })
    );

    if (!this.userService.getUserDetails()) {
      this.router.navigate(['']);
    }
  }

  ngOnInit(): void {
    this.user = this.userService.getUserDetails();

    // ✅ connect socket once
    if (this.user?.email) {
      this.orderService.connectToSocket(
        this.user.email,
        this.user?._id || this.user?.userId
      );

      this.orderErrorSub = this.orderService.orderError().subscribe((err) => {
        if (err?.message) this.myCartService.showMessage(err.message);
        console.error('Order socket error:', err);
      });

      this.orderStatusSub = this.orderService.listenOrderStatus().subscribe((payload) => {
        this.applyOrderStatusPayload(payload);
      });

      this.orderStatusUpdatedSub = this.orderService.listenOrderStatusUpdated().subscribe((payload) => {
        this.applyOrderStatusPayload(payload);
      });
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 1200);

    this.onTabChange({ index: 0 });
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) this.orderSubscription.unsubscribe();

    this.orderReceivedSub?.unsubscribe();
    this.orderErrorSub?.unsubscribe();
    this.orderStatusSub?.unsubscribe();
    this.orderStatusUpdatedSub?.unsubscribe();
  }

  /* ---------------- Tracking modal (DYNAMIC) ---------------- */

  private applyOrderStatusPayload(payload: any) {
    if (!payload) return;

    const payloadOrderId = String(payload.orderId || payload._id || '');
    if (!this.trackingOrderId || String(this.trackingOrderId) !== payloadOrderId) {
      return;
    }

    const normalized = {
      ...payload,
      orderId: payload.orderId || payload._id || this.trackingOrderId,
      status: payload.status || 'Order Placed',

      productName:
        payload.productName ||
        payload.product?.name ||
        payload.product?.[0]?.name ||
        this.trackOrderData?.productName ||
        'NA',

      customerName:
        payload.customerName ||
        payload.customer?.name ||
        payload.customer?.[0]?.name ||
        this.trackOrderData?.customerName ||
        'NA',

      createdAt: payload.createdAt || this.trackOrderData?.createdAt || null,
    };

    this.trackOrderData = normalized;
  }

  private openTrackModalForOrder(orderId: string, existingOrderObj?: any): void {
    this.trackingOrderId = String(orderId);

    this.trackOrderData = {
      status: existingOrderObj?.status || 'Order Placed',
      orderId: orderId,
      productName: existingOrderObj?.product?.[0]?.name || existingOrderObj?.productName || 'NA',
      customerName: existingOrderObj?.customer?.[0]?.name || existingOrderObj?.customerName || 'NA',
      createdAt: existingOrderObj?.createdAt || null,
    };
    this.showTrackOrderModal = true;

    try {
      this.orderService.requestOrderStatus(orderId);
    } catch (e) {
      console.warn('requestOrderStatus failed:', e);
    }
  }

  trackYourOrder(order: any): void {
    const id = order?.orderId || order?._id;
    if (!id) {
      this.myCartService.showMessage('Order ID not found');
      return;
    }
    this.openTrackModalForOrder(id, order);
  }

  trackReceivedOrder(order: any): void {
    const id = order?.orderId || order?._id;
    if (!id) {
      this.myCartService.showMessage('Order ID not found');
      return;
    }
    this.openTrackModalForOrder(id, order);
  }

  closeTrackOrderModal() {
    this.showTrackOrderModal = false;
    this.trackOrderData = null;
    this.trackingOrderId = null;
  }

  getOrderStepIndex(order: any): number {
    if (!order || !order.status) return 0;
    switch (order.status) {
      case 'Order Placed': return 0;
      case 'Order Seen': return 1;
      case 'Order Accepted':
      case 'Order Rejected': return 2;
      default: return 0;
    }
  }

  /* ---------------- Owner actions (Seen/Accept/Reject) ---------------- */

  private getOrderId(order: any): string | null {
    const id = order?.orderId || order?._id;
    return id ? String(id) : null;
  }

  markSeen(order: any): void {
    const orderId = this.getOrderId(order);
    if (!orderId) {
      this.myCartService.showMessage('Order ID not found');
      return;
    }

    this.orderService.markOrderSeen(orderId);

    // optional optimistic UI
    order.status = 'Order Seen';
    this.myCartService.showMessage('Order marked as seen');
  }

  acceptOrderOwner(order: any): void {
    const orderId = this.getOrderId(order);
    if (!orderId) {
      this.myCartService.showMessage('Order ID not found');
      return;
    }

    this.orderService.acceptOrder(orderId);

    // optional optimistic UI
    order.status = 'Order Accepted';
    this.myCartService.showMessage('Order accepted');
  }

  openRejectDialog(order: any): void {
    this.rejectTargetOrder = order;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectDialog(): void {
    this.showRejectModal = false;
    this.rejectTargetOrder = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectTargetOrder) return;

    const orderId = this.getOrderId(this.rejectTargetOrder);
    if (!orderId) {
      this.myCartService.showMessage('Order ID not found');
      return;
    }

    this.orderService.rejectOrder(orderId, this.rejectReason || '');

    // optional optimistic UI
    this.rejectTargetOrder.status = 'Order Rejected';
    this.rejectTargetOrder.rejectionReason = this.rejectReason || '';

    this.myCartService.showMessage('Order rejected');
    this.closeRejectDialog();
  }

  /* ---------------- Your existing functions (unchanged) ---------------- */

  startEditUser() {
    this.editUser = { ...this.user };
    this.userEditMode = true;
  }

  payToViewOwnerDetails(product: any) {
    this.myCartService.showMessage('This feature coming soon!');
  }

  saveUserDetails() {
    this.user = { ...this.editUser };
    this.userEditMode = false;

    this.userService
      .editUser(this.user._id || this.user.userId, this.user)
      .subscribe(
        (response: any) => {
          this.userService.saveUserDetails(response.User);
          this.myCartService.showMessage(response.message);
        },
        (error) => console.error('Error updating user details:', error)
      );
  }

  cancelEditUser() {
    this.userEditMode = false;
  }

  onTabChange(event: any): void {
    const tabNames = ['history', 'received', 'your'];
    const selectedTab = tabNames[event.index];

    if (!this.user || !this.user.email) return;

    if (selectedTab === 'history') {
      this.getUserHistoryByEmail(this.user.email);
    } else if (selectedTab === 'received') {
      this.loadReceivedOrders();

      this.orderService.getReceivedOrder(this.user.email).subscribe(
        (notifications) => {
          if (Array.isArray(notifications)) this.receivedOrders = notifications;
          else if (notifications) this.receivedOrders = [notifications];
          else this.receivedOrders = [];
        },
        (error) => {
          console.error('Error fetching received notifications:', error);
          this.receivedOrders = [];
        }
      );
    } else if (selectedTab === 'your') {
      this.loadYourOrders();
    }
  }

  onEditProduct(productId: string, updatedData: any) {
    this.dataService.editProduct(productId, updatedData).subscribe(
      (response: any) => {
        this.myCartService.showMessage(response.message);
        if (updatedData && typeof updatedData === 'object') updatedData.editMode = false;
      },
      (error) => console.error('Update failed:', error)
    );
  }

  getUserHistoryByEmail(email: string): void {
    this.dataService.getDataByEmail(email).subscribe(
      (response) => {
        if (response && Array.isArray(response)) {
          this.userHistory = response;
          this.isLoading = false;
        } else {
          this.userHistory = [];
        }
      },
      (error) => {
        console.error('Error fetching user history:', error);
        this.userHistory = [];
      }
    );
  }

  loadReceivedOrders(): void {
    // listen to "orderReceived" once
    this.orderReceivedSub?.unsubscribe();
    this.orderReceivedSub = this.orderService.receiveOrder().subscribe((orderEvent) => {
      if (orderEvent?.message) this.myCartService.showMessage(orderEvent.message);
    });

    this.orderService.fetchOrders(this.user.email).subscribe(
      () => {},
      (error) => console.error('Error fetching received orders:', error)
    );
  }

  loadYourOrders(): void {
    this.orderService.getYourOrders(this.user.email).subscribe(
      (orders: any[]) => (this.yourOrders = orders),
      (error) => console.error('Error fetching your orders:', error)
    );
  }

  sortByDate(tab: string): void {
    if (tab === 'history') {
      this.userHistory = [...this.userHistory].sort((a, b) =>
        new Date(b.productListedDate).getTime() - new Date(a.productListedDate).getTime()
      );
    } else if (tab === 'received') {
      this.receivedOrders = [...this.receivedOrders].sort((a, b) =>
        new Date(b.productListedDate).getTime() - new Date(a.productListedDate).getTime()
      );
    } else if (tab === 'your') {
      this.yourOrders = [...this.yourOrders].sort((a, b) =>
        new Date(b.productListedDate).getTime() - new Date(a.productListedDate).getTime()
      );
    }
  }

  showDeleteConfirm(item: any) {
    this.confirmDeleteItem = item;
  }

  cancelDelete() {
    this.confirmDeleteItem = null;
  }

  confirmDeleteHistoryItem(item: any) {
    this.userHistory = this.userHistory.filter((historyItem) => historyItem._id !== item._id);
    this.confirmDeleteItem = null;

    this.dataService.deleteProductById(item._id).subscribe(
      () => this.myCartService.showMessage('Item deleted successfully'),
      (error: Error) => console.error('Error deleting item:', error)
    );
  }

  getOwnerEmails = (data: any) =>
    data.flatMap((entry: any) => entry.product.map((product: any) => product.productOwnerEmail));

  editReceivedOrder(order: any): void {
    this.myCartService.showMessage('Edit Received Order feature coming soon!');
  }

  deleteReceivedOrder(order: any): void {
    this.myCartService.showMessage('Delete Received Order feature coming soon!');
  }

  editYourOrder(order: any): void {
    this.myCartService.showMessage('Edit Your Order feature coming soon!');
  }

  deleteYourOrder(order: any): void {
    this.myCartService.showMessage('Delete Your Order feature coming soon!');
  }

  verifyUser() {
    this.showOtpInput = true;
    this.otpError = '';

    this.userService.sendOtpToEmail(this.user.email).subscribe(
      () => this.myCartService.showMessage('OTP sent to your email.'),
      () => this.myCartService.showMessage('Failed to send OTP.')
    );
  }

  verifyOtpAndEditUser() {
    if (!this.otp || this.otp.length < 4) {
      this.otpError = 'Please enter a valid OTP.';
      return;
    }

    this.userService.verifyOtp(this.user.email, this.otp).subscribe(
      (res: any) => {
        if (res) {
          this.user.isVerified = true;
          this.showOtpInput = false;
          this.userService.saveUserDetails(res.user);
        } else {
          this.otpError = res.message || 'Invalid OTP.';
        }
      },
      () => (this.otpError = 'Invalid OTP or verification failed.')
    );
  }

  resendOtp() {
    this.userService.sendOtpToEmail(this.user.email).subscribe(
      () => this.myCartService.showMessage('OTP resent to your email.'),
      () => this.myCartService.showMessage('Failed to resend OTP.')
    );
  }
}
