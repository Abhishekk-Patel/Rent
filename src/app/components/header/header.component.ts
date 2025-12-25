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
  showMobileSearch = false;
  searchValue = '';
  isMobileView = false;
  userRole: string = 'Bride';
  showCategoryMenu = false;
  isSortPanelOpen = false;
  activeCategory: 'bride' | 'groom' = 'bride';
  activeNavItem: string = 'home';
  brideCategories = [
    'Bridal Lehenga','Bridal Saree','Bridal Jewelry Set','Bridal Shoes','Bridal Accessories','Bridal Makeup','Bridal Clutches','Bridal Dupatta','Bridal Gown','Bridal Handbags','Other',
  ];
  groomCategories = [
    'Groom’s Sherwani','Groom’s Kurta','Groom’s Footwear','Groom’s Tech','Groom’s Suit','Groom’s Accessories','Groom’s Watches','Groom’s Ties','Other',
  ];
  categories: any[] = [];
  filteredCategories: any[] = [];
  unreadMessages = 0;
  countryCode = '';
  isAddNewProduct = false;
  orderReceived = '';
  isOwner = false;

  get isCategoryFilterApplied(): boolean {
    return this.categories.some(cat => cat.isSelected);
  }
  clearCategoryFilter() {
    this.categories.forEach(cat => cat.isSelected = false);
    this.userService.setActiveCategory('All');
    this.filterCategories();
  }


  openMobileSearch() {
    this.showMobileSearch = true;
    setTimeout(() => {
      const input = document.querySelector('.mobile-search-box input');
      if (input) (input as HTMLInputElement).focus();
    }, 100);
  }

  closeMobileSearch() {
    this.showMobileSearch = false;
  }

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
    // Initialize categories based on userRole
    this.updateCategories();
    this.filteredCategories = [...this.categories];
  }

  updateCategories(role?: 'bride' | 'groom') {
    if (this.userRole === 'Bride' || role === 'bride') {
      this.categories = this.brideCategories.map(cat => ({ name: cat, isSelected: false }));
    } else {
      this.categories = this.groomCategories.map(cat => ({ name: cat, isSelected: false }));
    }
    this.filterCategories();
  }

  filterCategories() {
    const val = this.searchValue.trim().toLowerCase();
    this.filteredCategories = val
      ? this.categories.filter(cat => cat.name.toLowerCase().includes(val))
      : [...this.categories];
  }

  openMessageDialog() {
    this.notificationService.clear();
    this.router.navigate(['/messenger']);
    // this.dialog.open(UnifiedChatComponent, {
    //   position: { top: '0', left: '0' },
    //   width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh', panelClass: 'chat-dialog-fullscreen', autoFocus: false
    // });
  }
  // Optionally keep dark mode toggle for future use

  openMyCard() { this.cartService.openCart(); }

  openLanguageDialog(): void {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`)
          .then(res => res.json())
          .then(data => { this.countryCode = data.countryCode; })
          .catch(console.error);
      },
      console.error
    );
  }

  openAddProductDialog() { this.router.navigate(['/add-product']); }
  toggleCategory(category: 'bride' | 'groom') {
    this.activeCategory = category;
    this.userRole = category === 'bride' ? 'Bride' : 'Groom';
    this.userService.setUserRole(this.userRole);
    this.updateCategories(category);
    this.cartService.fetchCartItems();
    this.userService.setActiveCategory('All');
  }

  selectCategory(categoryName: string) {
    this.categories.forEach(cat => cat.isSelected = false);
    const selectedCat = this.categories.find(cat => cat.name === categoryName);
    if (selectedCat) selectedCat.isSelected = true;
    this.userService.setActiveCategory(selectedCat && selectedCat.isSelected ? categoryName : 'All');
    this.showCategoryMenu = false;
    this.filterCategories();
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkMobileView.bind(this));
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView && this.showCategoryMenu) this.showCategoryMenu = false;
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
      if (this.isMobileView) this.closeMobileSearch();
    }
  }

  search(): void {
    this.searchValue = this.searchValue.trim();
    this.filterCategories();
    this.userService.setSearchValue(this.searchValue);
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  clear() {
    this.searchValue = '';
    this.filterCategories();
    this.userService.setSearchValue(this.searchValue);
  }

  onUserRoleChange(event: any) {
    this.userRole = event.value;
    this.activeCategory = event.value === 'Bride' ? 'bride' : 'groom';
    this.userService.setUserRole(this.userRole);
    this.updateCategories(this.activeCategory);
    this.userService.setActiveCategory('All');
    this.clearCategoryFilter();
     setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  openSortPanel() { this.isSortPanelOpen = true; }
  toggleMobileMenu() { this.showCategoryMenu = !this.showCategoryMenu; }
}
