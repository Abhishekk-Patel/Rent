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
  user: any;
  userHistory: any[] = [];
  receivedOrders: any[] = [];
  yourOrders: any[] = [];
  orderSubscription: Subscription | null = null;

  isLoading: boolean = true;

  getOrderData$ = this.store.select('orderData');



  constructor(
    private userService: UserService,
    public router: Router,
    public dataService: DataService,
    private orderService: OrderService,
    private myCartService: MyCartServiceService,
    private store: Store<{ orderData: any[] }>
  ) {
    this.store.dispatch(LoadOrderData({ email: this.userService.getUserDetails().email }));
    // Ensure user is logged in, otherwise redirect to home
    if (!this.userService.getUserDetails()) {
      this.router.navigate(['']);
    }
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
    console.log('Selected tab:', selectedTab);

    if (!this.user || !this.user.email) {
      return;
    }

    if (selectedTab === 'history') {
      this.getUserHistoryByEmail(this.user.email);
    } else if (selectedTab === 'received') {
      this.loadReceivedOrders();
    } else if (selectedTab === 'your') {
      this.loadYourOrders();
    }
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
        console.log('Order received in component:', this.receivedOrders);
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

  editHistoryItem(item: any): void {
    // Navigate to the edit page with the item details
    // this.router.navigate(['/edit-product', item.pk]);
  }

  deleteHistoryItem(item: any): void {
    // Remove the item from the user history
    this.userHistory = this.userHistory.filter(
      (historyItem) => historyItem._id !== item._id
    );
    // Optionally, call a service to delete the item from the backend
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
}
