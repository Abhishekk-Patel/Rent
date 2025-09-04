  // For delete confirmation dialog

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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
    // Ensure user is logged in, otherwise redirect to home
    if (!this.userService.getUserDetails()) {
      this.router.navigate(['']);
    }
  }

  // Start editing user details
  startEditUser() {
    this.editUser = { ...this.user };
    this.userEditMode = true;
  }
  payToViewOwnerDetails(product: any) {
    // In a real app, trigger payment flow here
    // For demo, just unlock details
    // product.ownerDetailsPaid = true;
    this.myCartService.showMessage('This feature coming soon!');
  }

  // Save user details (simulate update, in real app call service)
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
        (error) => {
          console.error('Error updating user details:', error);
        }
      );

    // Optionally, update in userService or backend here
  }

  // Cancel editing
  cancelEditUser() {
    this.userEditMode = false;
  }

  ngOnInit(): void {
    // Get user details when the component initializes
    this.user = this.userService.getUserDetails();

    // Simulate loading for demo; in real app, set isLoading = false after data loads
    setTimeout(() => {
      this.isLoading = false;
    }, 1200);

    // Load data for the default tab (History)
    this.onTabChange({ index: 0 });
  }

  ngOnDestroy(): void {
    // Cleanup the subscription and disconnect socket on destroy
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
    // this.orderService.disconnect();
  }
  onTabChange(event: any): void {
    // event.index gives the tab index (0 = History, 1 = Received Orders, 2 = Your Orders)
    const tabNames = ['history', 'received', 'your'];
    const selectedTab = tabNames[event.index];

    if (!this.user || !this.user.email) {
      return;
    }

    if (selectedTab === 'history') {
      this.getUserHistoryByEmail(this.user.email);
    } else if (selectedTab === 'received') {
      this.loadReceivedOrders();
      // Fetch and display received notifications
      this.orderService.getReceivedOrder(this.user.email).subscribe(
        (notifications) => {
          if (Array.isArray(notifications)) {
            this.receivedOrders = notifications;
          } else if (notifications) {
            this.receivedOrders = [notifications];
          } else {
            this.receivedOrders = [];
          }
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
        // Close edit mode after successful save
        if (updatedData && typeof updatedData === 'object') {
          updatedData.editMode = false;
        }
      },
      (error) => {
        console.error('Update failed:', error);
      }
    );
  }

  // Get user history by email
  getUserHistoryByEmail(email: string): void {
    this.dataService.getDataByEmail(email).subscribe(
      (response) => {
        if (response && Array.isArray(response)) {
          this.userHistory = response;
          this.isLoading = false;
        } else {
          this.userHistory = []; // If no history is returned, reset the array
        }
      },
      (error) => {
        console.error('Error fetching user history:', error);
        this.userHistory = []; // Handle any errors and reset the history
      }
    );
  }

  loadReceivedOrders(): void {
    this.orderService.connectToSocket(this.user.email);

    // Store the subscription so it can be unsubscribed later
    this.orderSubscription = this.orderService
      .receiveOrder()
      .subscribe((order) => {
        this.receivedOrders = order;
      });

    this.orderService.fetchOrders(this.user.email).subscribe(
      (orders) => {
        if (orders && orders.length > 0) {
          const ownerEmails = this.getOwnerEmails(orders);

          if (this.user.email === ownerEmails) {
            this.receivedOrders = orders;
          }
        }
      },
      (error) => {
        console.error('Error fetching received orders:', error);
      }
    );
  }

  loadYourOrders(): void {
    this.orderService.getYourOrders(this.user.email).subscribe(
      (orders: any[]) => {
        this.yourOrders = orders;
      },
      (error) => {
        console.error('Error fetching your orders:', error);
      }
    );
  }

  sortByDate(tab: string): void {
    if (tab === 'history') {
      this.userHistory = [...this.userHistory].sort((a, b) => {
        return (
          new Date(b.productListedDate).getTime() -
          new Date(a.productListedDate).getTime()
        );
      });
    } else if (tab === 'received') {
      this.receivedOrders = [...this.receivedOrders].sort((a, b) => {
        return (
          new Date(b.productListedDate).getTime() -
          new Date(a.productListedDate).getTime()
        );
      });
    } else if (tab === 'your') {
      this.yourOrders = [...this.yourOrders].sort((a, b) => {
        return (
          new Date(b.productListedDate).getTime() -
          new Date(a.productListedDate).getTime()
        );
      });
    }
  }

  // editHistoryItem(item: any): void {
  //   console.log('Editing item:', item);
  //  this.onEditProduct(item._id, item);
  // }

  // Show confirm dialog for delete
  showDeleteConfirm(item: any) {
    this.confirmDeleteItem = item;
  }

  // Cancel delete
  cancelDelete() {
    this.confirmDeleteItem = null;
  }

  // Confirm delete
  confirmDeleteHistoryItem(item: any) {
    this.userHistory = this.userHistory.filter(
      (historyItem) => historyItem._id !== item._id
    );
    this.confirmDeleteItem = null;
    this.dataService.deleteProductById(item._id).subscribe(
      () => {
        this.myCartService.showMessage('Item deleted successfully');
      },
      (error: Error) => {
        console.error('Error deleting item:', error);
      }
    );
  }

  getOwnerEmails = (data: any) => {
    return data.flatMap((entry: any) =>
      entry.product.map((product: any) => product.productOwnerEmail)
    );
  };

  // --- Order Actions for Received Orders ---
  editReceivedOrder(order: any): void {
    // TODO: Implement edit logic for received order
    this.myCartService.showMessage('Edit Received Order feature coming soon!');
  }

  deleteReceivedOrder(order: any): void {
    // TODO: Implement delete logic for received order
    this.myCartService.showMessage(
      'Delete Received Order feature coming soon!'
    );
  }

  trackReceivedOrder(order: any): void {
    // Show tracking modal with real order details
    this.trackOrderData = {
      status: order.status || 'Order Placed',
      orderId: order.orderId || order._id || 'NA',
      productName:
        order.productName || (order.product && order.product[0]?.name) || 'NA',
      customerName:
        order.customerName ||
        (order.customer && order.customer[0]?.name) ||
        'NA',
      createdAt: order.createdAt || null,
      // Add more fields as needed
    };
    this.showTrackOrderModal = true;
  }

  // --- Order Actions for Your Orders ---
  editYourOrder(order: any): void {
    // TODO: Implement edit logic for your order
    this.myCartService.showMessage('Edit Your Order feature coming soon!');
  }

  deleteYourOrder(order: any): void {
    // TODO: Implement delete logic for your order
    this.myCartService.showMessage('Delete Your Order feature coming soon!');
  }

  trackYourOrder(order: any): void {
    // Show tracking modal with real order details
    this.trackOrderData = {
      status: order.status || 'Order Placed',
      orderId: order.orderId || order._id || 'NA',
      productName:
        order.productName || (order.product && order.product[0]?.name) || 'NA',
      customerName:
        order.customerName ||
        (order.customer && order.customer[0]?.name) ||
        'NA',
      createdAt: order.createdAt || null,
      // Add more fields as needed
    };
    this.showTrackOrderModal = true;
  }

  closeTrackOrderModal() {
    this.showTrackOrderModal = false;
    this.trackOrderData = null;
  }
  // Returns the step index for the order status stepper
  getOrderStepIndex(order: any): number {
    if (!order || !order.status) return 0;
    switch (order.status) {
      case 'Order Placed':
        return 0;
      case 'Order Seen':
        return 1;
      case 'Order Accepted':
      case 'Order Rejected':
        return 2;
      default:
        return 0;
    }
  }
  verifyUser() {
    // Show OTP input UI
    this.showOtpInput = true;
    this.otpError = '';
    // In a real app, trigger backend to send OTP to user's email here
    this.userService.sendOtpToEmail(this.user.email).subscribe(
      (res: any) => {
        this.myCartService.showMessage('OTP sent to your email.');
      },
      (err: any) => {
        this.myCartService.showMessage('Failed to send OTP.');
      }
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
      (err: any) => {
        this.otpError = 'Invalid OTP or verification failed.';
      }
    );
  }

  resendOtp() {
    this.userService.sendOtpToEmail(this.user.email).subscribe(
      (res: any) => {
        this.myCartService.showMessage('OTP resent to your email.');
      },
      (err: any) => {
        this.myCartService.showMessage('Failed to resend OTP.');
      }
    );
  }
}
