import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { Category_LIST, REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
})
export class ContentComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  alertMsg: string = 'Opps! No match found';
  public totalPages: any;
  rewards = REWARD_LIST;
  categories = Category_LIST;
  filteredRewards = REWARD_LIST;
  isSortPanelOpen = false;
  searchValue = '';
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  isLoading: boolean = false;
  userRole: string = 'Bride';
  showScrollToTop: boolean = false;
  private scrollSubscription!: Subscription;
  private pageSize: number = 10;
  private currentPage: number = 1;
  private loadingTimeout: any;

  constructor(
    public mycartService: MyCartServiceService,
    public router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    const loggedUser = this.mycartService.getUser();
    this.mycartService.setIsAddNewProduct(false);

    if (loggedUser === 'Bride') {
      this.rewards = REWARD_LIST.filter(
        (reward) => reward.userRole === 'Bride' || reward.userRole === 'Both'
      );
      this.categories = this.categories.filter(
        (cat) => cat.useRole === 'Bride' || cat.useRole === 'Both'
      );
    } else if (loggedUser === 'Groom') {
      this.categories = this.categories.filter(
        (cat) => cat.useRole === 'Groom' || cat.useRole === 'Both'
      );
      this.rewards = REWARD_LIST.filter(
        (reward) => reward.userRole === 'Groom' || reward.userRole === 'Both'
      );
    } else {
      this.router.navigate(['']);
    }

    this.updateRewardsAndCategories();
    this.filterRewardsByCategory('All');
    this.rewards.forEach((reward) => (reward.currentImageIndex = 0));
    this.isLoading = false;

    window.addEventListener('scroll', this.onScroll.bind(this));
    this.loadMoreRewards();
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
    const searchValue = this.searchInput.nativeElement.value.trim().toLowerCase();
    this.searchValue = searchValue;
    const matchedRewards = this.rewards.filter((reward) => {
      return (
        reward.category.toLocaleLowerCase().includes(searchValue) ||
        reward.name.toLocaleLowerCase().includes(searchValue) ||
        reward.city.toLocaleLowerCase().includes(searchValue)
      );
    }).filter((reward) => {
      return reward.userRole === this.userRole || reward.userRole === 'Both';
    });

    if (matchedRewards.length > 0) {
      this.filteredRewards = matchedRewards.slice(0, this.pageSize);
      this.totalPages = Math.ceil(matchedRewards.length / this.pageSize);
    } else {
      this.filteredRewards = [];
      this.alertMsg = 'Opps! No match found';
    }
    this.currentPage = 1;
  }

  clear() {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
    this.filteredRewards = this.rewards.filter((reward) => {
      return reward.userRole === this.userRole || reward.userRole === 'Both';
    }).slice(0, this.pageSize);
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredRewards.length / this.pageSize);
  }

  onPanelChange() {
    const expandedCategory = this.getExpandedCategory();
    this.filterRewardsByCategory(
      expandedCategory ? expandedCategory.name : 'All'
    );
  }

  filterRewardsByCategory(categoryName: string) {
    if (categoryName === 'All') {
      this.filteredRewards = this.rewards.filter((reward) => {
        return reward.userRole === this.userRole || reward.userRole === 'Both';
      }).slice(0, this.pageSize);
    } else {
      const lowerCategoryName = categoryName.toLocaleLowerCase();
      const matchedRewards = this.rewards.filter((reward) => {
        return (
          reward.category.toLocaleLowerCase().includes(lowerCategoryName) ||
          reward.name.toLocaleLowerCase().includes(lowerCategoryName) ||
          reward.city.toLocaleLowerCase().includes(lowerCategoryName)
        );
      }).filter((reward) => {
        return reward.userRole === this.userRole || reward.userRole === 'Both';
      });

      if (matchedRewards.length > 0) {
        this.filteredRewards = matchedRewards.slice(0, this.pageSize);
        this.totalPages = Math.ceil(matchedRewards.length / this.pageSize);
      } else {
        this.filteredRewards = [];
        this.alertMsg = 'Opps! No match found';
      }
    }
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
    this.mycartService.addToCart(pk);
  }

  showLoadingSpinner() {
    this.isLoading = true;
    // this.loadingTimeout = setTimeout(() => {
    //   this.isLoading = false;
    // }, 2000); // Show spinner for 2 seconds
  }

  loadMoreRewards() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = this.currentPage * this.pageSize;
    const newRewards = this.rewards.filter((reward) => {
      return (
        (reward.userRole === this.userRole || reward.userRole === 'Both') &&
        (reward.category.toLocaleLowerCase().includes(this.searchValue) ||
        reward.name.toLocaleLowerCase().includes(this.searchValue) ||
        reward.city.toLocaleLowerCase().includes(this.searchValue))
      );
    }).slice(startIndex, endIndex);
    this.filteredRewards = [...new Set([...this.filteredRewards, ...newRewards])];
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
    if (this.userRole === 'Bride') {
      this.rewards = REWARD_LIST.filter(
        (reward) => reward.userRole === 'Bride' || reward.userRole === 'Both'
      );
      this.categories = Category_LIST.filter(
        (cat) => cat.useRole === 'Bride' || cat.useRole === 'Both'
      );
    } else if (this.userRole === 'Groom') {
      this.rewards = REWARD_LIST.filter(
        (reward) => reward.userRole === 'Groom' || reward.userRole === 'Both'
      );
      this.categories = Category_LIST.filter(
        (cat) => cat.useRole === 'Groom' || cat.useRole === 'Both'
      );
    }
    this.filterRewardsByCategory('All');
    this.currentPage = 1;
    this.filteredRewards = [];
    this.showLoadingSpinner();
    this.loadMoreRewards();
  }

  applyPriceFilter(priceRange: { min: number, max: number }) {
    this.filteredRewards = this.rewards.filter(reward => {
      return reward.Rent >= priceRange.min && reward.Rent <= priceRange.max;
    });
  }

  applyLocationFilter(location: string) {
    this.filteredRewards = this.rewards.filter(reward => {
      return reward.city.toLocaleLowerCase().includes(location.toLocaleLowerCase());
    });
  }
}
