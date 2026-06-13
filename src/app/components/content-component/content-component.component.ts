import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { trigger, transition, style, animate } from '@angular/animations';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { DataService } from 'src/app/service/data.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import { Category_LIST } from 'src/mock-data';



@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('320ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContentComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  alertMsg = 'No matches found';

  // View / layout
  isMobileView = false;
  showCategoryMenu = false;

  // Data
  rewards:any[] = [];
  filteredRewards:any[] = [];
  categories = Category_LIST;
  isSortPanelOpen = false;

  // Search / filters
  searchValue = '';
  locationValue = ''; // ✅ separate from searchValue
  userRole = 'Bride';

  // UI state
  isLoading = false;
  showScrollToTop = false;

  // Paging
  private pageSize = 10;
  private currentPage = 1;
  private isLoadingMore = false;

  // Debounce scroll
  private scrollTicking = false;

  // Template refs
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('howItWorksSheet') howItWorksSheetTpl!: TemplateRef<any>;
  private howSheetRef?: MatBottomSheetRef;

  // Rx subscriptions
  private dataSub?: Subscription;
  private roleSub?: Subscription;
  private categorySub?: Subscription;
  private searchSub?: Subscription;
  private searchInputSub?: Subscription;

  // Store
  productData$ = this.store.select('productData');

  // Assets
  defaultImg = 'assets/Downloads/MissingProduct.webp';

  // ✅ avoid template-time allocations
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  readonly skeletons = Array.from({ length: 8 });

  // ✅ cache user details once (no template service calls)
  private readonly user = this.userService.getUserDetails();
  readonly userId = this.user.userId;
  readonly userEmail = this.user.email;

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

  // ✅ trackBy (big perf win)
  trackByReward = (_: number, r:any) => r.pk;
  trackByCategory = (_: number, c: any) => c.id ?? c.name;

  // ✅ single scroll handler: scroll-to-top + infinite scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    console.log('scroll event');
    if (this.scrollTicking) return;
    this.scrollTicking = true;

    requestAnimationFrame(() => {
      this.scrollTicking = false;
      this.showScrollToTop = window.scrollY > 300;
      this.tryLoadMoreOnBottom();
      this.cdr.markForCheck();
    });
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.checkMobileView();
    this.cdr.markForCheck();
  }

  ngOnInit() {
    this.checkMobileView();
    this.onWindowScroll();

    // role changes
    this.roleSub = this.userService.userRole$.subscribe((role) => {
      this.userRole = role || 'Bride';
      this.resetAndLoad();
    });

    // category changes
    this.categorySub = this.userService.activeCategory$.subscribe((categoryName) => {
      this.setSelectedCategory(categoryName || 'All');
      this.resetAndLoad();
    });

    // global search changes
    this.searchSub = this.userService.searchValue$.subscribe((v) => {
      this.searchValue = (v || '').trim().toLowerCase();
      this.resetAndLoad();
    });

    // load product data
    this.isLoading = true;
    this.dataSub = this.productData$.subscribe((data: any[]) => {
      if (!Array.isArray(data)) return;

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
        totalUserRated: item.totalUserRated ?? (item.ratings?.length || 0),
        avgRating: item.avgRating || 0,
      }));

      this.updateCategoriesForRole();
      this.resetAndLoad();

      this.isLoading = false;
      this.cdr.markForCheck();
    });

    this.mycartService.setIsAddNewProduct(false);
  }

  ngAfterViewInit() {
    // Debounced input -> updates searchValue -> resets and loads
    if (this.searchInput?.nativeElement) {
      this.searchInputSub = fromEvent(this.searchInput.nativeElement, 'input')
        .pipe(debounceTime(250))
        .subscribe(() => {
          this.searchValue = this.searchInput!.nativeElement.value.trim().toLowerCase();
          this.resetAndLoad();
          this.cdr.markForCheck();
        });
    }
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
    this.roleSub?.unsubscribe();
    this.categorySub?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.searchInputSub?.unsubscribe();
  }

  // ---------- Bottom sheet ----------

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

  // ---------- UI helpers ----------

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) this.showCategoryMenu = false;
  }

  scrollToCatalog(): void {
    setTimeout(() => {
      const el = document.querySelector('.catalog') as HTMLElement | null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  scrollToTop() {
    this.showScrollToTop = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Category selection ----------

  selectCategory(category: any) {
    this.categories.forEach((c: any) => (c.isSelected = false));
    category.isSelected = true;

    this.resetAndLoad();
    this.showCategoryMenu = false;

    setTimeout(() => this.scrollToCatalog(), 100);
  }

  private setSelectedCategory(name: string) {
    const n = (name || 'All').toLowerCase();
    this.categories.forEach((c: any) => (c.isSelected = (c.name || '').toLowerCase() === n));
    // if not found, nothing selected (that’s ok)
  }

  // ---------- Search ----------

  search(): void {
    const value =
      this.searchInput?.nativeElement?.value?.trim().toLowerCase() ??
      (this.searchValue || '').trim().toLowerCase();

    this.searchValue = value;
    this.resetAndLoad();

    // keep scroll behavior you had
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.addEventListener(
        'blur',
        () => this.scrollToFirstMatch(),
        { once: true }
      );
    }
  }

  clear() {
    this.searchValue = '';
    if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = '';
    this.resetAndLoad();
  }

  scrollToFirstMatch(): void {
    if (this.searchValue && this.filteredRewards.length) {
      setTimeout(() => {
        const firstMatchId = 'search-match-' + this.filteredRewards[0].pk;
        const el = document.getElementById(firstMatchId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          try {
            (el as HTMLElement).focus({ preventScroll: true } as any);
          } catch {
            (el as HTMLElement).focus();
          }
        }
      }, 100);
    }
  }

  // ---------- Filtering / sorting ----------

  applyPriceFilter(priceRange: { min: number; max: number }) {
    // keep current list but apply constraint
    this.filteredRewards = this.filteredRewards.filter(
      (r) => r.Rent >= priceRange.min && r.Rent <= priceRange.max
    );
    this.cdr.markForCheck();
  }

  applyLocationFilter(location: string) {
    this.locationValue = location || '';
    this.resetAndLoad();
  }

  sortRewards(order: string) {
    this.filteredRewards = [...this.filteredRewards].sort((a, b) =>
      order === 'asc'
        ? String(a.name).localeCompare(String(b.name))
        : String(b.name).localeCompare(String(a.name))
    );
    this.cdr.markForCheck();
  }

  // ---------- Paging / infinite scroll ----------

  private tryLoadMoreOnBottom(): void {
    if (this.isLoadingMore || this.isLoading || !this.rewards.length) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    const fullH = document.documentElement.scrollHeight || 0;

    const buffer = 120;
    const atBottom = scrollTop + viewportH >= fullH - buffer;
    if (!atBottom) return;

    this.isLoadingMore = true;
    this.isLoading = true;

    this.loadMoreRewards();

    setTimeout(() => (this.isLoadingMore = false), 250);
  }

  private resetAndLoad() {
    this.currentPage = 1;
    this.filteredRewards = [];
    this.isLoadingMore = false;

    // show toast only if you are actually searching and it returns 0
    this.loadMoreRewards(true);
    this.cdr.markForCheck();
  }

  private loadMoreRewards(checkEmptyToast = false) {
    if (!this.rewards.length) {
      this.isLoading = false;
      return;
    }

    const search = (this.searchValue || '').trim().toLowerCase();
    const location = (this.locationValue || '').trim().toLowerCase();

    const selectedCategory =
      this.categories.find((c: any) => c.isSelected)?.name ?? 'All';
    const cat = (selectedCategory || 'All').toLowerCase();

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = this.currentPage * this.pageSize;

    const page = this.rewards
      .filter((r) => this.matchesAllFilters(r, { search, location, cat }))
      .slice(startIndex, endIndex);

    // dedupe by pk
    const map = new Map<number,any>();
    for (const r of [...this.filteredRewards, ...page]) map.set(r.pk, r);
    this.filteredRewards = Array.from(map.values());

    if (checkEmptyToast && search && this.filteredRewards.length === 0) {
      this.mycartService.showMessage(this.alertMsg);
    }

    this.currentPage++;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private matchesAllFilters(
    r:any,
    f: { search: string; location: string; cat: string }
  ): boolean {
    const matchesRole = r.userRole === this.userRole || r.userRole === 'Both';

    const matchesCategory =
      f.cat === 'all' || (r.category || '').toLowerCase().includes(f.cat);

    const matchesLocation =
      !f.location || (r.city || '').toLowerCase().includes(f.location);

    if (!f.search) return matchesRole && matchesCategory && matchesLocation;

    const fields = [r.name, r.city, r.category, r.description, r.ProductOwnerEmail];
    const matchesSearch = fields.some((x) => String(x || '').toLowerCase().includes(f.search));

    return matchesRole && matchesCategory && matchesLocation && matchesSearch;
  }

  private updateCategoriesForRole() {
    this.categories = Category_LIST.filter((cat: any) => {
      return cat.useRole === this.userRole || cat.useRole === 'Both';
    });

    // do not auto-select anything if none is selected; keep previous behavior-ish
    const anySelected = this.categories.some((c: any) => c.isSelected);
    if (!anySelected && this.categories.length) {
      // keep all false
      this.categories.forEach((c: any) => (c.isSelected = false));
    }
  }

  // ---------- Product actions ----------

  onAddProduct() {
    this.router.navigate(['/add-product']);
  }

  addToCart(pk: number) {
    const reward = this.rewards.find((r) => r.pk === pk);
    if (reward) this.mycartService.addToCart(reward);
  }

  toggleFavorite(reward:any) {
    reward.isFavorite = !reward.isFavorite;
    if (reward.isFavorite) this.mycartService.addToFavorites(reward);
    else this.mycartService.removeFromFavorites?.(reward);
    this.cdr.markForCheck();
  }

  productDetails(primaryKey: number) {
    this.mycartService.openProductDetails(primaryKey);
  }

  nextImage(reward:any) {
    if (!reward.display_img_urls?.length) return;
    reward.currentImageIndex = (reward.currentImageIndex + 1) % reward.display_img_urls.length;
    this.cdr.markForCheck();
  }

  prevImage(reward:any) {
    if (!reward.display_img_urls?.length) return;
    reward.currentImageIndex =
      (reward.currentImageIndex - 1 + reward.display_img_urls.length) % reward.display_img_urls.length;
    this.cdr.markForCheck();
  }

  onRatingChange(newRating: number, reward:any) {
    // optimistic update
    (reward as any).rating = newRating;
    this.userService.updateRating(reward.pk, newRating, reward.userId).subscribe(() => {});
    this.cdr.markForCheck();
  }

  openMessageDialog(product:any) {
    this.router.navigate(['/messenger'], {
      queryParams: {
        productId: product.pk,
        ownerId: product.userId,
        name: product.name,
        image: product.display_img_urls?.[0] || '',
      },
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImg;
  }

  closeSortPanel() {
    this.isSortPanelOpen = false;
    this.cdr.markForCheck();
  }

  openSortPanel() {
    this.isSortPanelOpen = true;
    this.cdr.markForCheck();
  }

  closePanel() {
    this.closeSortPanel();
  }

  onUserRoleChange(event: any) {
    this.userRole = event.value || 'Bride';
    this.updateCategoriesForRole();
    this.resetAndLoad();
  }

  setImageIndex(reward: any, index: number) {
    reward.currentImageIndex = index;
    this.cdr.markForCheck();
  }

  // kept from your older code (if you still use it elsewhere)
  isValidUntilWithin7Days(validUntil: string): boolean {
    const today = new Date();
    const validUntilDate = new Date(validUntil);
    const days = (validUntilDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return days <= 7 && days >= 0;
  }
}
