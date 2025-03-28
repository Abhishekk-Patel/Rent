import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { DataService } from 'src/app/service/data.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import { Category_LIST } from 'src/mock-data';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
})
export class ContentComponentComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  alertMsg: string = 'Opps! No match found';
  public totalPages: any;
  categories = Category_LIST;
  rewards: any[] = [];
  filteredRewards: any[] = [];
  isSortPanelOpen = false;
  searchValue = '';
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  isLoading: boolean = false;
  userRole: string = 'Bride';
  showScrollToTop: boolean = false;
  private scrollSubscription!: Subscription;
  private orderSubscription!: Subscription;
  private pageSize: number = 10;
  private currentPage: number = 1;
  private loadingTimeout: any;
  isDateToday: string = new Date().toISOString().split('T')[0];
  productRating: any = 0;

  productData$ = this.store.select('productData');

  constructor(
    public mycartService: MyCartServiceService,
    public router: Router,
    public dataService: DataService,
    public orderService: OrderService,
    public userService: UserService,
    private store: Store<{ productData: any }>
  ) {
    this.store.dispatch({ type: 'LoadProductData' });
  }

  ngOnInit() {
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
      }));
      this.filteredRewards = [...this.rewards]; // Set filteredRewards to the fetched data
      this.updateRewardsAndCategories();
      this.filterRewardsByCategory('All');
      this.isLoading = false;
    });

    this.mycartService.setIsAddNewProduct(false);
    this.isLoading = true;

    window.addEventListener('scroll', this.onScroll.bind(this));
    this.loadMoreRewards();

    this.orderService.receiveOrder().subscribe((data: any) => {
      console.log(data, 'receive order content page'); // Store the message in Msg variable
    });
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(debounceTime(300))
      .subscribe(() => {
        const searchValue = this.searchInput.nativeElement.value.trim();
        this.searchValue = searchValue;
        this.filterRewardsByCategory(searchValue || 'All');
      });

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
    window.removeEventListener('scroll', this.onScroll.bind(this));
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    // Unsubscribe from the 'orderReceived' event and disconnect the socket
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
    this.orderService.disconnect();
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

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  search(): void {
    const searchValue = this.searchInput.nativeElement.value
      .trim()
      .toLowerCase();
    this.searchValue = searchValue;
    this.filterRewards();
  }

  clear() {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
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
    console.log(reward, 'test');
  }

  showLoadingSpinner() {
    this.isLoading = true;
  }

  loadMoreRewards() {
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
    this.filteredRewards = this.rewards.filter((reward) => {
      return reward.city
        .toLocaleLowerCase()
        .includes(location.toLocaleLowerCase());
    });
  }

  private filterRewards() {
    this.filteredRewards = this.rewards
      .filter((reward) => {
        const matchesSearch =
          reward.name.toLocaleLowerCase().includes(this.searchValue) ||
          reward.city.toLocaleLowerCase().includes(this.searchValue);
        const matchesUserRole =
          reward.userRole === this.userRole || reward.userRole === 'Both';
        return matchesSearch && matchesUserRole;
      })
      .slice(0, this.pageSize);
    this.currentPage = 1;
  }
}
