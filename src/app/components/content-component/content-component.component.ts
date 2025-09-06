


   import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
    import { FormControl } from '@angular/forms';
    import { Router } from '@angular/router';
    import { Store } from '@ngrx/store';
    import { debounceTime, fromEvent, Subscription } from 'rxjs';
    import { DataService } from 'src/app/service/data.service';
    import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
    import { OrderService } from 'src/app/service/order.service';
    import { UserService } from 'src/app/service/user.service';
    import { UnifiedChatComponent } from '../unified-chat.component';
    import { MatDialog } from '@angular/material/dialog';
    import { trigger, transition, style, animate } from '@angular/animations';
import { Category_LIST } from 'src/mock-data';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
})
export class ContentComponentComponent

  implements OnInit, AfterViewInit, OnDestroy
{
  alertMsg: string = 'No matches found';
  isMobileView: boolean = false;
  showCategoryMenu: boolean = false;
  public totalPages: any;
  categories = Category_LIST;
  
  onAddProduct() {
    this.router.navigate(['/add-product']);
  }
  rewards: any[] = [];
  filteredRewards: any[] = [];
  isSortPanelOpen = false;
  searchValue = '';
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;
  isLoading: boolean = false;
  userRole: string = 'Bride';
  showScrollToTop: boolean = false;
  private scrollSubscription!: Subscription;
  private orderSubscription!: Subscription;
  private pageSize: number = 10;
  private currentPage: number = 1;
  private loadingTimeout: any;
  data:any;
  isDateToday: string = new Date().toISOString().split('T')[0];
  productRating: any = 0;

  productData$ = this.store.select('productData');

      constructor(
        public mycartService: MyCartServiceService,
        public router: Router,
        public dataService: DataService,
        public orderService: OrderService,
        public userService: UserService,
        private store: Store<{ productData: any }>,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
      ) {
        this.store.dispatch({ type: 'LoadProductData' });
      }

      ngOnInit() {
        this.checkMobileView();
        window.addEventListener('resize', this.checkMobileView.bind(this));
        this.userService.userRole$.subscribe(role => {
          this.userRole = role;
          this.filterRewardsByCategory('All');
        });
        // Listen for category changes from header
        this.userService.activeCategory$.subscribe(categoryName => {
          this.filterRewardsByCategory(categoryName);
        });
        // Listen for global search value changes
        this.userService.searchValue$.subscribe(searchValue => {
          this.searchValue = searchValue.trim().toLowerCase();
          this.filterRewards();
        });
        this.isLoading = true;
        this.productData$.subscribe((data) => {
          this.rewards = data.map((item: any) => ({
            pk: item._id,
            name: item.productName,
            Rent: item.productRent,
            description: item.productDescription || 'No description provided',
            category: item.category || 'General',
            quantity: item.quantity || 0,
            userRole: item.userRole || 'Both',
            valid_until: item.validUntil,
            display_img_urls: item.images.map((img: any) => img.url),
            currentImageIndex: 0,
            city: item.city || 'Unknown',
            low_quantity: item.lowQuantity || 5,
            buyers: item.buyers || 0,
            ProductOwnerEmail: item.productOwnerEmail,
            ProductRatings: item.ratings || [],
            userId: item.userId || '',
            userRatings: item.ratings || [],
            totalUserRated: item.totalUserRated ? item.totalUserRated : item.ratings.length || 0,
          }));
          this.filteredRewards = [...this.rewards];
          this.updateRewardsAndCategories();
          this.filterRewardsByCategory('All');
          this.isLoading = false;
          this.cdr.detectChanges();
        });
        this.mycartService.setIsAddNewProduct(false);
        window.addEventListener('scroll', this.onScroll.bind(this));
        this.loadMoreRewards();
      }

      checkMobileView() {
        this.isMobileView = window.innerWidth <= 768;
        if (!this.isMobileView) {
          this.showCategoryMenu = false;
        }
      }
        scrollToCatalog(): void {
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) {
        (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

      ngAfterViewInit() {
        if (this.searchInput && this.searchInput.nativeElement) {
          fromEvent(this.searchInput.nativeElement, 'input')
            .pipe(debounceTime(300))
            .subscribe(() => {
              const searchValue = this.searchInput!.nativeElement.value.trim();
              this.searchValue = searchValue;
              this.filterRewardsByCategory(searchValue || 'All');
            });
        }
        this.scrollSubscription = fromEvent(window, 'scroll')
          .pipe(debounceTime(300))
          .subscribe(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
              this.showLoadingSpinner();
              this.loadMoreRewards();
            }
          });
      }

      ngOnDestroy() {
        window.removeEventListener('resize', this.checkMobileView.bind(this));
        window.removeEventListener('scroll', this.onScroll.bind(this));
        if (this.scrollSubscription) {
          this.scrollSubscription.unsubscribe();
        }
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
      }

      onScroll() {
        this.showScrollToTop = window.scrollY > 300;
      }

      scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      getExpandedCategory() {
        return this.categories.find((category) => category.isExpanded);
      }

      selectCategory(category: any) {
        this.categories.forEach(cat => cat.isSelected = false);
        category.isSelected = true;
        this.filterRewardsByCategory(category.name);
        this.showCategoryMenu = false;
        // Scroll to catalog section
        setTimeout(() => {
          const catalogEl = document.querySelector('.catalog');
          if (catalogEl) {
            (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }

      handleKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
          this.search();
          this.scrollToFirstMatch();
        }
      }

      search(): void {
        let searchValue = this.searchValue || '';
        if (this.searchInput && this.searchInput.nativeElement) {
          searchValue = this.searchInput.nativeElement.value.trim().toLowerCase();
          this.searchValue = searchValue;
        } else if (searchValue) {
          this.searchValue = searchValue.trim().toLowerCase();
        } else {
          this.searchValue = '';
        }
        this.filterRewards();
        // Optionally, scroll on blur
        if (this.searchInput && this.searchInput.nativeElement) {
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
        if (this.searchInput && this.searchInput.nativeElement) {
          this.searchInput.nativeElement.value = '';
        }
        this.filterRewards();
      }

      onPanelChange() {
        const expandedCategory = this.getExpandedCategory();
        this.filterRewardsByCategory(
          expandedCategory ? expandedCategory.name : 'All'
        );
      }

      filterRewardsByCategory(categoryName: string) {
        this.filteredRewards = this.rewards
          .filter((reward) => {
            const matchesCategory =
              categoryName === 'All' ||
              reward.category
                .toLocaleLowerCase()
                .includes(categoryName.toLocaleLowerCase());
            const matchesSearch =
              reward.name.toLocaleLowerCase().includes(this.searchValue) ||
              reward.city.toLocaleLowerCase().includes(this.searchValue);
            const matchesUserRole =
              reward.userRole === this.userRole || reward.userRole === 'Both';
            return matchesCategory && matchesSearch && matchesUserRole;
          })
          .slice(0, this.pageSize);
        this.currentPage = 1;
        if (this.searchValue || categoryName !== 'All') {
          if (!this.filteredRewards.length) {
            this.mycartService.showMessage(this.alertMsg);
          }
        }
      }

      openSortPanel() {
        this.isSortPanelOpen = true;
      }

      closeSortPanel() {
        this.isSortPanelOpen = false;
      }

      sortRewards(order: string) {
        this.filteredRewards.sort((a, b) => {
          return order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        });
      }

      isValidUntilWithin7Days(validUntil: string): boolean {
        const today = new Date();
        const validUntilDate = new Date(validUntil);
        const timeDifference = validUntilDate.getTime() - today.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        return daysDifference <= 7 && daysDifference >= 0;
      }

      closePanel() {
        this.closeSortPanel();
      }

      addToCart(pk: number) {
        const reward = this.rewards.find((reward) => reward.pk === pk);
        if (reward) {
          this.mycartService.addToCart(reward);
        }
      }

      addToFavorite(reward: any) {
        this.mycartService.addToFavorites(reward);
      }

      showLoadingSpinner() {
        this.isLoading = true;
      }

      loadMoreRewards() {
        this.isLoading = true;
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = this.currentPage * this.pageSize;
        const newRewards = this.rewards
          .filter((reward) => {
            const matchesSearch =
              reward.name.toLocaleLowerCase().includes(this.searchValue) ||
              reward.city.toLocaleLowerCase().includes(this.searchValue);
            const matchesUserRole =
              reward.userRole === this.userRole || reward.userRole === 'Both';
            return matchesSearch && matchesUserRole;
          })
          .slice(startIndex, endIndex);
        this.filteredRewards = [
          ...new Set([...this.filteredRewards, ...newRewards]),
        ];
        this.currentPage++;
        this.isLoading = false;
        this.cdr.detectChanges();
      }

      productDetails(primaryKey: number) {
        this.mycartService.openProductDetails(primaryKey);
      }

      nextImage(reward: any) {
        reward.currentImageIndex =
          (reward.currentImageIndex + 1) % reward.display_img_urls.length;
        if (!reward.display_img_urls[reward.currentImageIndex]) {
          reward.currentImageIndex = 0;
        }
      }

      prevImage(reward: any) {
        reward.currentImageIndex =
          (reward.currentImageIndex - 1 + reward.display_img_urls.length) %
          reward.display_img_urls.length;
        if (!reward.display_img_urls[reward.currentImageIndex]) {
          reward.currentImageIndex = reward.display_img_urls.length - 1;
        }
      }

      onUserRoleChange(event: any) {
        this.userRole = event.value;
        this.updateRewardsAndCategories();
        this.currentPage = 1;
        this.filteredRewards = [];
        this.showLoadingSpinner();
        this.loadMoreRewards();
      }

      updateRewardsAndCategories() {
        this.filteredRewards = this.rewards
          .filter((reward) => {
            return reward.userRole === this.userRole || reward.userRole === 'Both';
          })
          .slice(0, this.pageSize);
        this.categories = Category_LIST.filter((cat) => {
          return cat.useRole === this.userRole || cat.useRole === 'Both';
        });
        this.filterRewardsByCategory('All');
        this.currentPage = 1;
        this.showLoadingSpinner();
        this.loadMoreRewards();
      }

      applyPriceFilter(priceRange: { min: number; max: number }) {
        this.filteredRewards = this.rewards.filter((reward) => {
          return reward.Rent >= priceRange.min && reward.Rent <= priceRange.max;
        });
      }

  applyLocationFilter(location: string) {
    this.filteredRewards = this.rewards.filter((reward: any) => {
      return reward.city
        .toLocaleLowerCase()
        .includes(location.toLocaleLowerCase());
    });
  }

  private filterRewards() {
    // Best match search: check all relevant fields
    this.filteredRewards = this.rewards
      .filter((reward: any) => {
        const search = this.searchValue;
        if (!search) return reward.userRole === this.userRole || reward.userRole === 'Both';
        const fields = [
          reward.name,
          reward.city,
          reward.category,
          reward.description,
          reward.ProductOwnerEmail
        ];
        const matchesSearch = fields.some(field => field && field.toLowerCase().includes(search));
        const matchesUserRole = reward.userRole === this.userRole || reward.userRole === 'Both';
        return matchesSearch && matchesUserRole;
      })
      .slice(0, this.pageSize);
    this.currentPage = 1;
    if (this.searchValue && !this.filteredRewards.length) {
      this.mycartService.showMessage(this.alertMsg);
    }
  }

  onRatingChange(newRating: number, reward: any) {
    reward.rating = newRating;
    this.userService.updateRating(reward.pk, newRating, reward.userId).subscribe((res: any) => {});
  }

  openMessageDialog(product: any) {
    this.dialog.open(UnifiedChatComponent, {
      position: { top: '0', left: '0' },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'chat-dialog-fullscreen',
      autoFocus: false,
      data: { product }
    });
  }
}

