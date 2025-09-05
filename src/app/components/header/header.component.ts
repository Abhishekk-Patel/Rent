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
  searchValue: string = '';
  isMobileView: boolean = false;
  userRole: string = 'Bride';
  showCategoryMenu: boolean = false;
  isSortPanelOpen: boolean = false;
  activeCategory: 'bride' | 'groom' | null = 'bride';

  brideCategories = [
    'Bridal Lehenga',
    'Bridal Saree',
    'Bridal Jewelry Set',
    'Bridal Shoes',
    'Bridal Accessories',
    'Bridal Makeup',
    'Bridal Clutches',
    'Bridal Dupatta',
    'Bridal Gown',
    'Bridal Handbags',
    'Other',
  ];
  groomCategories = [
    'Groom’s Sherwani',
    'Groom’s Kurta',
    'Groom’s Footwear',
    'Groom’s Tech',
    'Groom’s Suit',
    'Groom’s Accessories',
    'Groom’s Watches',
    'Groom’s Ties',
    'Other',
  ];


  categories: any[] = [
    { name: 'Accessories', isSelected: false },
    { name: 'Jewellery', isSelected: false },
    { name: 'Footwear', isSelected: false }
  ];
  filteredRewards: any[] = [];
  unreadMessages = 0;
  countryCode: string = '';
  isAddNewProduct: boolean = false;
  orderSubscription!: Subscription;
  orderReceived = '';

  isOwner: Boolean = false;

  constructor(
    public userService: UserService,
    public cartService: MyCartServiceService,
    public readonly router: Router,
    public orderService: OrderService,
    private dialog: MatDialog,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.showCategoryMenu = false; // Always start closed
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView.bind(this));
    this.cartService.fetchCartItems();
    this.openLanguageDialog();
    this.cartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });

    // Subscribe to unread message count
    this.notificationService.unreadMessages$.subscribe(count => {
      this.unreadMessages = count;
     
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
  toggleCategory(category: 'bride' | 'groom' | null) {
    this.activeCategory = category;
  }

selectCategory(category: string) {
  console.log('Selected category:', category);
  this.showCategoryMenu = false;
  // You can call your user role change function or navigate
  this.onUserRoleChange({ value: category });
}

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkMobileView.bind(this));
    // if (this.orderSubscription) this.orderSubscription.unsubscribe();
  }

  checkMobileView() {
      this.isMobileView = window.innerWidth <= 768;
      // Only close menu if switching to desktop view
      if (!this.isMobileView && this.showCategoryMenu) {
        this.showCategoryMenu = false;
      }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  search(): void {
    this.searchValue = this.searchValue.trim().toLowerCase();
    // Dummy: just clear filteredRewards for now
    this.filteredRewards = [];
  }

  clear() {
    this.searchValue = '';
    this.filteredRewards = [];
  }

  onUserRoleChange(event: any) {
    this.userRole = event.value;
    // Dummy: just clear filteredRewards for now
    this.filteredRewards = [];
  }

  openSortPanel() {
    this.isSortPanelOpen = true;
  }
    // Toggle mobile menu reliably for slide-out
    toggleMobileMenu() {
      this.showCategoryMenu = !this.showCategoryMenu;
    }
}
