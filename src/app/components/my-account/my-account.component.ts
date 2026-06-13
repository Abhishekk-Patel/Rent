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

  showTrackOrderModal = false;
  trackOrderData: any = null;
  private trackingOrderId: string | null = null;

  showRejectModal = false;
  rejectTargetOrder: any = null;
  rejectReason = '';

  private orderReceivedSub?: Subscription;
  private orderErrorSub?: Subscription;
  private orderStatusSub?: Subscription;
  private orderStatusUpdatedSub?: Subscription;
  private tabLoadSub?: Subscription;

  userEditMode = false;
  editUser: any = {};
  user: any;

  userHistory: any[] = [];
  receivedOrders: any[] = [];
  yourOrders: any[] = [];

  isLoading = true;
  isSavingUser = false;

  getOrderData$ = this.store.select('orderData');

  constructor(
    public userService: UserService,
    public router: Router,
    public dataService: DataService,
    private orderService: OrderService,
    private myCartService: MyCartServiceService,
    private store: Store<{ orderData: any[] }>,
  ) {
    if (!this.userService.getUserDetails()) {
      this.router.navigate(['']);
      return;
    }

    this.store.dispatch(
      LoadOrderData({ email: this.userService.getUserDetails().email }),
    );
  }

  ngOnInit(): void {
    this.user = this.userService.getUserDetails();

    if (this.user?.email) {
      this.orderService.connectToSocket(
        this.user.email,
        this.user?._id || this.user?.userId,
      );

      this.orderErrorSub = this.orderService.orderError().subscribe((err) => {
        if (err?.message) this.myCartService.showMessage(err.message);
        console.error('Order socket error:', err);
      });

      this.orderStatusSub = this.orderService
        .listenOrderStatus()
        .subscribe((payload) => {
          this.applyOrderStatusPayload(payload);
          this.applyStatusToLists(payload);
        });

      this.orderStatusUpdatedSub = this.orderService
        .listenOrderStatusUpdated()
        .subscribe((payload) => {
          this.applyOrderStatusPayload(payload);
          this.applyStatusToLists(payload);
        });

      this.orderReceivedSub = this.orderService
        .receiveOrder()
        .subscribe(() => {});
    }

    this.onTabChange({ index: 0 });
  }

  ngOnDestroy(): void {
    this.tabLoadSub?.unsubscribe();
    this.orderReceivedSub?.unsubscribe();
    this.orderErrorSub?.unsubscribe();
    this.orderStatusSub?.unsubscribe();
    this.orderStatusUpdatedSub?.unsubscribe();
  }

  /* ---------------- Helpers ---------------- */

  private getOrderId(o: any): string {
    return String(o?.orderId || o?._id || o?.id || '');
  }

  normalizeStatus(
    status?: string,
  ): 'Order Placed' | 'Order Seen' | 'Order Accepted' | 'Order Rejected' {
    const s = (status || '').toLowerCase();
    if (s.includes('accepted')) return 'Order Accepted';
    if (s.includes('rejected')) return 'Order Rejected';
    if (s.includes('seen')) return 'Order Seen';
    return 'Order Placed';
  }

  statusIcon(status?: string): string {
    const s = this.normalizeStatus(status);
    if (s === 'Order Seen') return 'visibility';
    if (s === 'Order Accepted') return 'check_circle';
    if (s === 'Order Rejected') return 'cancel';
    return 'shopping_cart';
  }

  statusClass(status: string): string {
    const s = this.normalizeStatus(status);
    if (s === 'Order Seen') return 'status-seen';
    if (s === 'Order Accepted') return 'status-accepted';
    if (s === 'Order Rejected') return 'status-rejected';
    return 'status-placed';
  }

  trackByOrderId = (_: number, item: any) => this.getOrderId(item);
  trackByHistoryId = (_: number, item: any) =>
    String(item?._id || item?.id || item?.productId || _);

  /* ---------------- Track Modal ---------------- */

  private applyOrderStatusPayload(payload: any) {
    if (!payload) return;

    const payloadId = this.getOrderId(payload);
    if (this.trackingOrderId && payloadId && this.trackingOrderId !== payloadId)
      return;

    const status = this.normalizeStatus(payload.status);

    this.trackOrderData = {
      ...this.trackOrderData,
      ...payload,
      orderId: payload.orderId || payload._id || this.trackingOrderId,
      status,
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
      rejectionReason:
        payload.rejectionReason || this.trackOrderData?.rejectionReason || '',
    };
  }

  private applyStatusToLists(payload: any): void {
    const id = this.getOrderId(payload);
    const status = this.normalizeStatus(payload?.status);
    if (!id) return;

    const updateInList = (list: any[]) => {
      const idx = list.findIndex((o) => this.getOrderId(o) === id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          status,
          rejectionReason:
            payload?.rejectionReason || list[idx]?.rejectionReason || '',
        };
      }
    };

    updateInList(this.receivedOrders);
    updateInList(this.yourOrders);
  }

  private openTrackModalForOrder(orderObj: any): void {
    const id = this.getOrderId(orderObj);
    if (!id) return this.myCartService.showMessage('Order ID not found');

    this.trackingOrderId = id;

    this.trackOrderData = {
      orderId: id,
      status: this.normalizeStatus(orderObj?.status),
      productName:
        orderObj?.product?.[0]?.name || orderObj?.productName || 'NA',
      customerName:
        orderObj?.customer?.[0]?.name || orderObj?.customerName || 'NA',
      createdAt: orderObj?.createdAt || null,
      rejectionReason: orderObj?.rejectionReason || '',
    };

    this.showTrackOrderModal = true;

    try {
      this.orderService.requestOrderStatus(id);
    } catch (e) {
      console.warn('requestOrderStatus failed:', e);
    }
  }

  trackYourOrder(order: any): void {
    this.openTrackModalForOrder(order);
  }

  trackReceivedOrder(order: any): void {
    this.openTrackModalForOrder(order);
  }

  closeTrackOrderModal(): void {
    this.showTrackOrderModal = false;
    this.trackingOrderId = null;
    setTimeout(() => (this.trackOrderData = null), 0);
  }

  getOrderStepIndex(order: any): number {
    const s = this.normalizeStatus(order?.status);
    if (s === 'Order Placed') return 0;
    if (s === 'Order Seen') return 1;
    return 2;
  }

  /* ---------------- Owner Actions ---------------- */

  markSeen(order: any): void {
    const id = this.getOrderId(order);
    if (!id) return;
    this.orderService.markOrderSeen(id);
    order.status = 'Order Seen';
  }

  acceptOrderOwner(order: any): void {
    const id = this.getOrderId(order);
    if (!id) return;
    this.orderService.acceptOrder(id);
    order.status = 'Order Accepted';
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
    const id = this.getOrderId(this.rejectTargetOrder);
    if (!id) return;

    this.orderService.rejectOrder(id, this.rejectReason || '');
    this.rejectTargetOrder.status = 'Order Rejected';
    this.rejectTargetOrder.rejectionReason = this.rejectReason || '';
    this.closeRejectDialog();
  }

  /* ---------------- Profile Edit ---------------- */

  startEditUser(): void {
    this.editUser = { ...this.user };
    this.userEditMode = true;
  }

  saveUserDetails(): void {
    if (!this.editUser) return;

    this.isSavingUser = true;
    const updated = { ...this.editUser };
    const id = this.user._id || this.user.userId;

    this.userService.editUser(id, updated).subscribe(
      (response: any) => {
        const newUser = response?.User || response?.user || updated;
        this.userService.saveUserDetails(newUser);
        this.user = { ...this.userService.getUserDetails() }; // ✅ refresh
        this.userEditMode = false;
        this.myCartService.showMessage(response.message || 'Profile updated');
        this.isSavingUser = false;
      },
      (error) => {
        console.error('Error updating user details:', error);
        this.myCartService.showMessage('Failed to update profile');
        this.isSavingUser = false;
      },
    );
  }

  cancelEditUser(): void {
    this.userEditMode = false;
    this.editUser = {};
  }

  /* ---------------- History Edit ---------------- */

  startEditHistory(item: any): void {
    this.userHistory.forEach((x) => {
      x.editMode = false;
      x._draft = null;
    });

    item._draft = {
      productName: item.productName,
      productDescription: item.productDescription,
      productRent: item.productRent,
    };

    item.editMode = true;
  }

  cancelEditHistory(item: any): void {
    item.editMode = false;
    item._draft = null;
  }

  saveHistoryEdit(item: any): void {
    if (!item?._draft) return;

    const updatedData = {
      ...item,
      productName: item._draft.productName,
      productDescription: item._draft.productDescription,
      productRent: item._draft.productRent,
    };

    this.dataService.editProduct(item._id, updatedData).subscribe(
      (response: any) => {
        item.productName = updatedData.productName;
        item.productDescription = updatedData.productDescription;
        item.productRent = updatedData.productRent;
        item.editMode = false;
        item._draft = null;
        this.myCartService.showMessage(
          response?.message || 'Updated successfully',
        );
      },
      (error) => {
        console.error('Update failed:', error);
        this.myCartService.showMessage('Update failed');
      },
    );
  }

  /* ---------------- Tabs ---------------- */

  onTabChange(event: any): void {
    const tabNames = ['history', 'received', 'your'];
    const selectedTab = tabNames[event.index];

    if (!this.user?.email) return;

    this.tabLoadSub?.unsubscribe();
    this.isLoading = true;

    if (selectedTab === 'history') {
      this.tabLoadSub = this.dataService
        .getDataByEmail(this.user.email)
        .subscribe(
          (response: any) => {
            this.userHistory = Array.isArray(response) ? response : [];
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching history:', error);
            this.userHistory = [];
            this.isLoading = false;
          },
        );
    }

    if (selectedTab === 'received') {
      this.tabLoadSub = this.orderService
        .getReceivedOrder(this.user.email)
        .subscribe(
          (notifications: any) => {
            if (Array.isArray(notifications))
              this.receivedOrders = notifications;
            else if (notifications) this.receivedOrders = [notifications];
            else this.receivedOrders = [];
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching received:', error);
            this.receivedOrders = [];
            this.isLoading = false;
          },
        );
    }

    if (selectedTab === 'your') {
      this.tabLoadSub = this.orderService
        .getYourOrders(this.user.email)
        .subscribe(
          (orders: any[]) => {
            this.yourOrders = orders || [];
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching your orders:', error);
            this.yourOrders = [];
            this.isLoading = false;
          },
        );
    }
  }

  sortByDate(tab: string): void {
    const toTime = (d: any) => new Date(d || 0).getTime();

    if (tab === 'history') {
      this.userHistory = [...this.userHistory].sort(
        (a, b) => toTime(b.productListedDate) - toTime(a.productListedDate),
      );
    } else if (tab === 'received') {
      this.receivedOrders = [...this.receivedOrders].sort(
        (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
      );
    } else if (tab === 'your') {
      this.yourOrders = [...this.yourOrders].sort(
        (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
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
    this.userHistory = this.userHistory.filter((x) => x._id !== item._id);
    this.confirmDeleteItem = null;

    this.dataService.deleteProductById(item._id).subscribe(
      () => this.myCartService.showMessage('Item deleted successfully'),
      (error: Error) => console.error('Error deleting item:', error),
    );
  }

  /* ---------------- OTP Verify (FIXED UI UPDATE) ---------------- */

  verifyUser() {
    this.showOtpInput = true;
    this.otpError = '';

    this.userService.sendOtpToEmail(this.user.email).subscribe(
      () => this.myCartService.showMessage('OTP sent to your email.'),
      () => this.myCartService.showMessage('Failed to send OTP.'),
    );
  }

  verifyOtpAndEditUser() {
    if (!this.otp || this.otp.length < 4) {
      this.otpError = 'Please enter a valid OTP.';
      return;
    }

    this.userService.verifyOtp(this.user.email, this.otp).subscribe(
      (res: any) => {
        const updatedUser = res?.user || res?.User || null;

        if (!updatedUser) {
          this.otpError = res?.message || 'Invalid OTP.';
          return;
        }

        // ✅ normalize flags (your UI uses isVarified)
        updatedUser.isVarified = true;
        updatedUser.isVerified = true;

        // ✅ persist + refresh UI instantly
        this.userService.saveUserDetails(updatedUser);
        this.user = { ...updatedUser };

        this.showOtpInput = false;
        this.otp = '';
        this.otpError = '';

        this.myCartService.showMessage(
          res?.message || 'OTP verified successfully',
        );
      },
      () => {
        this.otpError = 'Invalid OTP or verification failed.';
      },
    );
  }

  resendOtp() {
    this.userService.sendOtpToEmail(this.user.email).subscribe(
      () => this.myCartService.showMessage('OTP resent to your email.'),
      () => this.myCartService.showMessage('Failed to resend OTP.'),
    );
  }

  /* placeholders */
  payToViewOwnerDetails(product: any) {
    this.myCartService.showMessage('This feature coming soon!');
  }
  editYourOrder(order: any): void {
    this.myCartService.showMessage('Edit Your Order feature coming soon!');
  }
  deleteYourOrder(order: any): void {
    this.myCartService.showMessage('Delete Your Order feature coming soon!');
  }
}
