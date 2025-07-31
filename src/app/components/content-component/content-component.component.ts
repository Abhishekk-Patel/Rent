import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
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
  isMobileView: boolean = false;
  showCategoryMenu: boolean = false;
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
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.store.dispatch({ type: 'LoadProductData' });
  }

  ngOnInit() {
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView.bind(this));
  

 

 
    this.data =   {
        "_id": "67b090e3747349507c359a00",
        "productName": "Mens",
        "productDescription": "NA",
        "productRent": 1200,
        "category": "Groom’s Suit",
        "quantity": 1,
        "userRole": "Groom",
        "validUntil": "2026-02-15T00:00:00.000Z",
        "productOwnerEmail": "abhishekpatel67@gmail.com",
        "productListedDate": "2025-02-15T00:00:00.000Z",
        "city": "Test",
        "images": [
            {
                "_id": "67b090e3747349507c359a01",
                "filename": "image0.jpg",
                "url": "https://mys3rentbucket.s3.ap-south-1.amazonaws.com/1739624672473_image0.jpg"
            },
            {
                "_id": "67b090e3747349507c359a02",
                "filename": "image1.jpg",
                "url": "https://mys3rentbucket.s3.ap-south-1.amazonaws.com/1739624672495_image1.jpg"
            },
            {
                "_id": "67b090e3747349507c359a03",
                "filename": "image2.jpg",
                "url": "https://mys3rentbucket.s3.ap-south-1.amazonaws.com/1739624672498_image2.jpg"
            }
        ],
        "__v": 0,
        "ratings": [
            {
                "_id": "687bdb5525dd53570083dd1b",
                "productId": "67b090e3747349507c359a00",
                "rating": 4,
                "createdAt": "2025-07-19T17:52:23.012Z",
                "__v": 0
            },
            {
                "_id": "687bde1725dd53570083dd20",
                "productId": "67b090e3747349507c359a00",
                "rating": 3,
                "createdAt": "2025-07-19T18:04:07.692Z",
                "__v": 0
            }
        ],
        "userId": "67a7b26a1730b16b90c52300"
    };
    this.isLoading = true; // Set isLoading to true before data fetch
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
        totalUserRated: item.totalUserRated
          ? item.totalUserRated
          : item.ratings.length || 0,

      }));
      this.filteredRewards = [...this.rewards]; // Set filteredRewards to the fetched data
      this.updateRewardsAndCategories();
      this.filterRewardsByCategory('All');
      this.isLoading = false; // Set isLoading to false after data is loaded
      this.cdr.detectChanges(); // Trigger change detection
    });

    this.mycartService.setIsAddNewProduct(false);
    this.isLoading = true;

    window.addEventListener('scroll', this.onScroll.bind(this));
    this.loadMoreRewards();

    this.orderService.receiveOrder().subscribe((data: any) => {
      console.log(data, 'receive order content page'); // Store the message in Msg variable
    });
  }
   checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.showCategoryMenu = false;
    }
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
    window.removeEventListener('resize', this.checkMobileView.bind(this));
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
   selectCategory(category: any) {
    this.categories.forEach(cat => cat.isSelected = false);
    category.isSelected = true;
    this.filterRewardsByCategory(category.name);
    this.showCategoryMenu = false;
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
    this.mycartService.addToFavorites(reward);
  
  }

  showLoadingSpinner() {
    this.isLoading = true;
  }

  loadMoreRewards() {
    this.isLoading = true; // Show loader before loading more rewards
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
    this.isLoading = false; // Hide loader after rewards are loaded
    this.cdr.detectChanges(); // Trigger change detection
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
  onRatingChange(newRating: number, reward: any) {
    
    reward.rating = newRating;
    // Optionally, send the new rating to the backend here
     this.userService.updateRating(reward.pk, newRating,reward.userId).subscribe(res=> console.log(res,"response"));
  }
}
