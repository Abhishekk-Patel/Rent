import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/service/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { UnifiedChatComponent } from '../unified-chat.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  unreadMessages = 0;
  countryCode: string = '';
  isAddNewProduct: boolean = false;
  orderSubscription!: Subscription;
  orderReceived = '';

  isOwner: Boolean = false;
  showMobileMenu: boolean = false; // Added for mobile menu toggle

  constructor(
    public userService: UserService,
    public cartService: MyCartServiceService,
    public readonly router: Router,
    public orderService: OrderService,
    private dialog: MatDialog,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cartService.fetchCartItems();
    this.openLanguageDialog();
    this.cartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });

    // Subscribe to unread message count
    this.notificationService.unreadMessages$.subscribe(count => {
      this.unreadMessages = count;
      console.log('[Header] Unread message badge count:', count);
    });
  }
openMessageDialog() {
  this.notificationService.clear();
  this.dialog.open(UnifiedChatComponent, {
    position: { top: '0', left: '0' },
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    panelClass: 'chat-dialog-fullscreen',
    autoFocus: false
  });
}
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  openMyCard() {
    this.cartService.openCart();
  }

  openLanguageDialog(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
          .then((response) => response.json())
          .then((data) => {
            this.countryCode = data.countryCode;
          })
          .catch((error) => {
            console.error('Error fetching location data:', error);
          });
      },
      (error) => {
        console.error('Error getting geolocation:', error);
      }
    );
  }

  openAddProductDialog() {
    this.router.navigate(['/add-product']);
  }

  ngOnDestroy(): void {
    // this.orderSubscription.unsubscribe();
  }
}
