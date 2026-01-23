
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/service/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // ===== State =====
  showMobileSearch = false;
  searchValue = '';
  isMobileView = false;
  userRole: string = 'Bride';
  showCategoryMenu = false;
  isSortPanelOpen = false;
  activeCategory: 'bride' | 'groom' = 'bride';
  activeNavItem: string = 'home';

  brideCategories = [
    'Bridal Lehenga','Bridal Saree','Bridal Jewelry Set','Bridal Shoes','Bridal Accessories',
    'Bridal Makeup','Bridal Clutches','Bridal Dupatta','Bridal Gown','Bridal Handbags','Other',
  ];
  groomCategories = [
    'Groom’s Sherwani','Groom’s Kurta','Groom’s Footwear','Groom’s Tech','Groom’s Suit',
    'Groom’s Accessories','Groom’s Watches','Groom’s Ties','Other',
  ];
  categories: Array<{ name: string; isSelected: boolean }> = [];
  filteredCategories: Array<{ name: string; isSelected: boolean }> = [];
  unreadMessages = 0;
  countryCode = '';
  isAddNewProduct = false;
  orderReceived = '';
  isOwner = false;

  // New UI state
  darkMode = false;
  notificationsOn = true;
  recentSearches: string[] = ['Lehenga', 'Sherwani', 'Silk Saree', 'Reception', 'Jaipur'];
  trendingTags: string[] = ['Banarasi', 'Kanjivaram', 'Pastel', 'Vintage', 'Indo-western'];

  // Drag-to-close
  @ViewChild('mobileMenu', { static: false }) mobileMenuRef?: ElementRef<HTMLElement>;
  isDragging = false;
  dragStartX = 0;
  menuTransform = 'translateX(0)'; // set to 0 when open

  constructor(
    public userService: UserService,
    public cartService: MyCartServiceService,
    public readonly router: Router,
    public orderService: OrderService,
    private dialog: MatDialog,
    public notificationService: NotificationService,
     private socialAuth: SocialAuthService,
  ) {}

  ngOnInit() {
    this.showCategoryMenu = false;
    this.checkMobileView();
    this.cartService.fetchCartItems();
    this.openLanguageDialog();

    this.cartService.isAddNewProduct$.subscribe(res => (this.isAddNewProduct = res));
    this.notificationService.unreadMessages$.subscribe(count => (this.unreadMessages = count));

    this.updateCategories();
    this.filteredCategories = [...this.categories];
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  /* ================== Window & Key Events ================== */
  @HostListener('window:resize') onResize() { this.checkMobileView(); }
  @HostListener('document:keydown.escape') onEscKey() { this.closeMenu(); }

  /* ================== Mobile Menu open/close ================== */
  toggleMobileMenu() {
    if (this.showCategoryMenu) this.closeMenu();
    else this.openMenu();
  }

  openMenu() {
    this.showCategoryMenu = true;
    this.menuTransform = 'translateX(0)';
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      const focusable = this.mobileMenuRef?.nativeElement.querySelector('input, button, [tabindex]');
      (focusable as HTMLElement | null)?.focus();
    }, 50);
  }

  closeMenu() {
    this.showCategoryMenu = false;
    this.menuTransform = 'translateX(100%)';
    document.body.classList.remove('no-scroll');
  }

  /* ================== Drag-to-close (rightward drag) ================== */
  onDragStart(ev: PointerEvent) {
    this.isDragging = true;
    this.dragStartX = ev.clientX;
  }
  onDragMove(ev: PointerEvent) {
    if (!this.isDragging) return;
    const dx = ev.clientX - this.dragStartX;
    const clamped = Math.max(0, dx); // only allow dragging to the right
    this.menuTransform = `translateX(${clamped}px)`;
  }
  onDragEnd(ev: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const dx = ev.clientX - this.dragStartX;
    const shouldClose = dx > 120; // threshold
    if (shouldClose) this.closeMenu();
    else this.menuTransform = 'translateX(0)'; // snap back
  }

  /* ================== Mobile Search Overlay ================== */
  openMobileSearch() {
    this.showMobileSearch = true;
    setTimeout(() => {
      const input = document.querySelector('.mobile-search-box input') as HTMLInputElement | null;
      input?.focus();
    }, 100);
  }
  closeMobileSearch() { this.showMobileSearch = false; }

  /* ================== Toggles & quick actions ================== */
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    // Integrate with your theme manager if available:
    // document.documentElement.classList.toggle('dark-theme', this.darkMode);
  }
  toggleNotifications() { this.notificationsOn = !this.notificationsOn; }

  applyQuickAction(action: 'orders' | 'wishlist' | 'rentals' | 'support') {
    switch (action) {
      case 'orders': this.router.navigate(['/orders']); break;
      case 'wishlist': this.router.navigate(['/wishlist']); break;
      case 'rentals': this.router.navigate(['/rentals']); break;
      case 'support': this.router.navigate(['/support']); break;
    }
    this.closeMenu();
  }

  applyTag(tag: string) {
    this.searchValue = tag;
    this.search();
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog') as HTMLElement | null;
      catalogEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  applyCollectionFilter(type: 'premium' | 'budget' | 'festive') {
    const map = { premium: 'Designer', budget: 'Budget', festive: 'Festive' };
    this.userService.setActiveCategory('All');
    this.searchValue = map[type];
    this.search();
    this.closeMenu();
  }

  /* ================== Categories & Search ================== */
  get isCategoryFilterApplied(): boolean { return this.categories.some(cat => cat.isSelected); }

  clearCategoryFilter() {
    this.categories.forEach(cat => (cat.isSelected = false));
    this.userService.setActiveCategory('All');
    this.filterCategories();
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

  selectCategory(categoryName: string) {
    this.categories.forEach(cat => (cat.isSelected = false));
    const selectedCat = this.categories.find(cat => cat.name === categoryName);
    if (selectedCat) selectedCat.isSelected = true;
    this.userService.setActiveCategory(selectedCat && selectedCat.isSelected ? categoryName : 'All');
    this.closeMenu();
    this.filterCategories();
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog') as HTMLElement | null;
      catalogEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /* ================== Navigation / Actions ================== */
  openMessageDialog() {
    this.notificationService.clear();
    this.router.navigate(['/messenger']);
  }
  openMyCard() { this.cartService.openCart(); }

  openLanguageDialog(): void {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
        )
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

  onUserRoleChange(event: any) {
    this.userRole = event.value;
    this.activeCategory = event.value === 'Bride' ? 'bride' : 'groom';
    this.userService.setUserRole(this.userRole);
    this.updateCategories(this.activeCategory);
    this.userService.setActiveCategory('All');
    this.clearCategoryFilter();
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog') as HTMLElement | null;
      catalogEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView && this.showCategoryMenu) this.closeMenu();
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
      const catalogEl = document.querySelector('.catalog') as HTMLElement | null;
      catalogEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
  logout(): void {
    console.log('test')
 
  localStorage.removeItem('userToken');
  localStorage.removeItem('user'); 
  localStorage.removeItem('userDetails'); 
  sessionStorage.clear(); 
  this.socialAuth.signOut().catch(() => {});
  this.router.navigateByUrl('/', { replaceUrl: true });
}

  clear() {
    this.searchValue = '';
    this.filterCategories();
    this.userService.setSearchValue(this.searchValue);
  }

  openSortPanel() { this.isSortPanelOpen = true; }
}
