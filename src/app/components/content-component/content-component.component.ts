import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  TemplateRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { DataService } from 'src/app/service/data.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import { UnifiedChatComponent } from '../unified-chat.component';
import { Category_LIST } from 'src/mock-data';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
})
export class ContentComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  alertMsg: string = 'No matches found';

  // View / layout state
  isMobileView: boolean = false;
  showCategoryMenu: boolean = false;

  // Product & filter state
  rewards: any[] = [];
  filteredRewards: any[] = [];
  categories = Category_LIST;
  isSortPanelOpen = false;

  // Search
  searchValue = '';
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef<HTMLInputElement>;

  // Loading / paging
  isLoading: boolean = false;
  private pageSize: number = 10;
  private currentPage: number = 1;
  private loadingTimeout: any;

  // Roles & misc
  userRole: string = 'Bride';
  isDateToday: string = new Date().toISOString().split('T')[0];
  productRating: any = 0;

  // Scroll-to-top visibility
  showScrollToTop: boolean = false;

  // Subscriptions
  private scrollSubscription!: Subscription;
  private dataSubscription!: Subscription;

  productData$ = this.store.select('productData');
  defaultImg = 'assets/Downloads/MissingProduct.webp';

  @ViewChild('howItWorksSheet') howItWorksSheetTpl!: TemplateRef<any>;
  private howSheetRef?: MatBottomSheetRef;

  constructor(
    public mycartService: MyCartServiceService,
    public router: Router,
    public dataService: DataService,
    public orderService: OrderService,
    public userService: UserService,
    private store: Store<{ productData: any }>,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet
  ) {
    this.store.dispatch({ type: 'LoadProductData' });
  }

  // ✅ Single source of truth for scroll-to-top visibility
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollToTop = window.scrollY > 300;
  }

  // ✅ Keep mobile view state updated
  @HostListener('window:resize', [])
  onWindowResize() {
    this.checkMobileView();
  }

  ngOnInit() {
    this.checkMobileView();
    this.onWindowScroll();

    // Role changes
    this.userService.userRole$.subscribe(role => {
      this.userRole = role;
      this.filterRewardsByCategory('All');
    });

    // Category changes from header/service
    this.userService.activeCategory$.subscribe(categoryName => {
      this.filterRewardsByCategory(categoryName);
    });

    // Global search value changes
    this.userService.searchValue$.subscribe(searchValue => {
      this.searchValue = (searchValue || '').trim().toLowerCase();
      this.filterRewards();
    });

    // Load product data
    this.isLoading = true;
    this.dataSubscription = this.productData$.subscribe((data: any[]) => {
      if (!data || !Array.isArray(data)) return;

      this.rewards = data.map((item: any) => ({
        pk: item._id,
        name: item.productName,
        Rent: item.productRent,
        description: item.productDescription || 'No description provided',
        category: item.category || 'General',
        quantity: item.quantity || 0,
        userRole: item.userRole || 'Both',
        valid_until: item.validUntil,
        display_img_urls: Array.isArray(item.images) ? item.images.map((img: any) => img.url) : [],
        currentImageIndex: 0,
        city: item.city || 'Unknown',
        low_quantity: item.lowQuantity || 5,
        buyers: item.buyers || 0,
        ProductOwnerEmail: item.productOwnerEmail,
        ProductRatings: item.ratings || [],
        userId: item.userId || '',
        userRatings: item.ratings || [],
        totalUserRated: item.totalUserRated ? item.totalUserRated : (item.ratings?.length || 0),
        avgRating: item.avgRating || 0,
      }));

      this.updateRewardsAndCategories();

      // ✅ start the first page only AFTER data exists
      this.filteredRewards = [];
      this.currentPage = 1;
      this.loadMoreRewards();

      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.mycartService.setIsAddNewProduct(false);
  }

  openHowItWorksSheet(): void {
    if (!this.howItWorksSheetTpl) return;

    this.howSheetRef = this.bottomSheet.open(this.howItWorksSheetTpl, {
      panelClass: 'how-sheet-panel',
      hasBackdrop: true,
      backdropClass: 'how-sheet-backdrop',
    });
  }

  closeHowItWorksSheet(): void {
    this.howSheetRef?.dismiss();
  }

  goToProductsFromSheet(): void {
    this.closeHowItWorksSheet();
    setTimeout(() => this.scrollToCatalog(), 120);
  }

  ngAfterViewInit() {
    // Debounced search input (both desktop & mobile templates reuse #searchInput)
    if (this.searchInput && this.searchInput.nativeElement) {
      fromEvent(this.searchInput.nativeElement, 'input')
        .pipe(debounceTime(250))
        .subscribe(() => {
          const value = this.searchInput!.nativeElement.value.trim().toLowerCase();
          this.searchValue = value;
          this.filterRewardsByCategory(value || 'All');
        });
    }

    // Infinite scroll bottom detection
    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(debounceTime(300))
      .subscribe(() => {
        const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
        if (atBottom) {
          this.showLoadingSpinner();
          this.loadMoreRewards();
        }
      });
  }

  ngOnDestroy() {
    if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  // ---------- UI helpers ----------

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) this.showCategoryMenu = false;
  }

  scrollToCatalog(): void {
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) {
        (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  scrollToTop() {
    this.showScrollToTop = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Category & selection ----------

  getExpandedCategory() {
    return this.categories.find((category) => category.isExpanded);
  }

  selectCategory(category: any) {
    this.categories.forEach(cat => cat.isSelected = false);
    category.isSelected = true;
    this.filterRewardsByCategory(category.name);
    this.showCategoryMenu = false;

    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) {
        (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onPanelChange() {
    const expandedCategory = this.getExpandedCategory();
    this.filterRewardsByCategory(expandedCategory ? expandedCategory.name : 'All');
  }

  // ---------- Search ----------

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
      this.scrollToFirstMatch();
    }
  }

  search(): void {
    let value = (this.searchValue || '').trim().toLowerCase();

    if (this.searchInput?.nativeElement) {
      value = this.searchInput.nativeElement.value.trim().toLowerCase();
    }

    this.searchValue = value;
    this.filterRewards();

    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.addEventListener('blur', () => {
        this.scrollToFirstMatch();
      }, { once: true });
    }
  }

  scrollToFirstMatch(): void {
    if (this.searchValue && this.filteredRewards.length) {
      setTimeout(() => {
        const firstMatchId = 'search-match-' + this.filteredRewards[0].pk;
        const el = document.getElementById(firstMatchId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLElement).focus();
        }
      }, 100);
    }
  }

  clear() {
    this.searchValue = '';
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
    this.filterRewards();
  }

  private filterRewards() {
    const search = (this.searchValue || '').trim().toLowerCase();

    this.filteredRewards = this.rewards
      .filter((reward: any) => {
        if (!search) return reward.userRole === this.userRole || reward.userRole === 'Both';

        const fields = [
          reward.name,
          reward.city,
          reward.category,
          reward.description,
          reward.ProductOwnerEmail
        ];

        const matchesSearch = fields.some(f => f && String(f).toLowerCase().includes(search));
        const matchesUserRole = reward.userRole === this.userRole || reward.userRole === 'Both';
        return matchesSearch && matchesUserRole;
      })
      .slice(0, this.pageSize);

    this.currentPage = 1;

    if (search && !this.filteredRewards.length) {
      this.mycartService.showMessage(this.alertMsg);
    }
  }

  // ---------- Filtering & sorting ----------

  filterRewardsByCategory(categoryName: string) {
    const cat = (categoryName || 'All').toLowerCase();
    const search = (this.searchValue || '').toLowerCase();

    this.filteredRewards = this.rewards
      .filter((reward) => {
        const matchesCategory =
          cat === 'all' || (reward.category || '').toLowerCase().includes(cat);

        const matchesSearch =
          (reward.name || '').toLowerCase().includes(search) ||
          (reward.city || '').toLowerCase().includes(search) ||
          (reward.category || '').toLowerCase().includes(search);

        const matchesUserRole =
          reward.userRole === this.userRole || reward.userRole === 'Both';

        return matchesCategory && matchesSearch && matchesUserRole;
      })
      .slice(0, this.pageSize);

    this.currentPage = 1;

    if ((this.searchValue || categoryName !== 'All') && !this.filteredRewards.length) {
      this.mycartService.showMessage(this.alertMsg);
    }
  }

  applyPriceFilter(priceRange: { min: any; max: any }) {
    this.filteredRewards = this.rewards.filter((reward:any) => {
      return reward.Rent >= priceRange.min && reward.Rent <= priceRange.max;
    });
  }

  applyLocationFilter(location: string) {
    this.filteredRewards = this.rewards.filter((reward: any) => {
      return (reward.city || '').toLowerCase().includes((location || '').toLowerCase());
    });
  }

  sortRewards(order: string) {
    this.filteredRewards.sort((a, b) => {
      return order === 'asc'
        ? String(a.name).localeCompare(String(b.name))
        : String(b.name).localeCompare(String(a.name));
    });
  }

  // ---------- Pagination / infinite scroll ----------

  showLoadingSpinner() {
    this.isLoading = true;
  }

  loadMoreRewards() {
    if (!this.rewards.length) {
      this.isLoading = false;
      return;
    }

    const search = (this.searchValue || '').toLowerCase();

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = this.currentPage * this.pageSize;

    const newRewards = this.rewards
      .filter((reward) => {
        const matchesSearch =
          (reward.name || '').toLowerCase().includes(search) ||
          (reward.city || '').toLowerCase().includes(search) ||
          (reward.category || '').toLowerCase().includes(search);

        const matchesUserRole =
          reward.userRole === this.userRole || reward.userRole === 'Both';

        return matchesSearch && matchesUserRole;
      })
      .slice(startIndex, endIndex);

    // ✅ Dedupe by pk (reliable)
    const map = new Map<string, any>();
    [...this.filteredRewards, ...newRewards].forEach(r => map.set(String(r.pk), r));
    this.filteredRewards = Array.from(map.values());

    this.currentPage++;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // ---------- Product actions ----------

  onAddProduct() {
    this.router.navigate(['/add-product']);
  }

  addToCart(pk: number) {
    const reward = this.rewards.find((r) => r.pk === pk);
    if (reward) this.mycartService.addToCart(reward);
  }

  toggleFavorite(reward: any) {
    reward.isFavorite = !reward.isFavorite;
    if (reward.isFavorite) {
      this.mycartService.addToFavorites(reward);
    } else {
      this.mycartService.removeFromFavorites?.(reward);
    }
  }

  productDetails(primaryKey: number) {
    this.mycartService.openProductDetails(primaryKey);
  }

  nextImage(reward: any) {
    if (!reward.display_img_urls?.length) return;

    reward.currentImageIndex =
      (reward.currentImageIndex + 1) % reward.display_img_urls.length;

    if (!reward.display_img_urls[reward.currentImageIndex]) {
      reward.currentImageIndex = 0;
    }
  }

  prevImage(reward: any) {
    if (!reward.display_img_urls?.length) return;

    reward.currentImageIndex =
      (reward.currentImageIndex - 1 + reward.display_img_urls.length) %
      reward.display_img_urls.length;

    if (!reward.display_img_urls[reward.currentImageIndex]) {
      reward.currentImageIndex = reward.display_img_urls.length - 1;
    }
  }

  isValidUntilWithin7Days(validUntil: string): boolean {
    const today = new Date();
    const validUntilDate = new Date(validUntil);
    const timeDifference = validUntilDate.getTime() - today.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference <= 7 && daysDifference >= 0;
  }

  onRatingChange(newRating: number, reward: any) {
    reward.rating = newRating;
    this.userService.updateRating(reward.pk, newRating, reward.userId).subscribe(() => {});
  }

  openMessageDialog(product: any) {
    // kept your router navigation behavior
    this.router.navigate(['/messenger'], {
      queryParams: {
        productId: product.pk || product._id,
        ownerId: product.userId,
        name: product.name,
        image: product.display_img_urls?.[0] || product.imageUrl || ''
      }
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImg;
  }

  closeSortPanel() {
    this.isSortPanelOpen = false;
  }

  openSortPanel() {
    this.isSortPanelOpen = true;
  }

  closePanel() {
    this.closeSortPanel();
  }

  updateRewardsAndCategories() {
    this.filteredRewards = this.rewards
      .filter((reward) => reward.userRole === this.userRole || reward.userRole === 'Both')
      .slice(0, this.pageSize);

    this.categories = Category_LIST.filter((cat) => {
      return cat.useRole === this.userRole || cat.useRole === 'Both';
    });

    // Keep selection sane
    const anySelected = this.categories.some(c => c.isSelected);
    if (!anySelected && this.categories.length) {
      this.categories[0].isSelected = false;
    }

    this.currentPage = 1;
  }

  onUserRoleChange(event: any) {
    this.userRole = event.value;
    this.updateRewardsAndCategories();

    this.currentPage = 1;
    this.filteredRewards = [];
    this.showLoadingSpinner();
    this.loadMoreRewards();
  }
}
