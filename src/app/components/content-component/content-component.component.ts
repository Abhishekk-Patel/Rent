import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, fromEvent } from 'rxjs';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { Category_LIST, REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css'],
})
export class ContentComponentComponent implements OnInit, AfterViewInit {
  alertMsg: string = 'Opps! No match found';
  //isProductAddedInCart: boolean = false;
  public totalPages: any;

  rewards = REWARD_LIST;
  categories = Category_LIST;
  filteredRewards = REWARD_LIST;
  isSortPanelOpen = false;
  searchValue = '';
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  isLoading: boolean = false;

  constructor(public mycartService: MyCartServiceService,public router: Router) {}

  ngOnInit() {
    this.isLoading = true; // Show spinner on init
    const loggedUser=    this.mycartService.getUser();
   
    if(loggedUser === 'Bride'){
      this.rewards = REWARD_LIST.filter(reward => reward.userRole === 'Bride'|| reward.userRole === 'Both');
      this.categories = this.categories.filter(cat => cat.useRole === 'Bride'|| cat.useRole === 'Both');
    }
    else if(loggedUser === 'Groom'){
      this.categories = this.categories.filter(cat => cat.useRole === 'Groom'|| cat.useRole === 'Both');
        
        this.rewards = REWARD_LIST.filter(reward => reward.userRole === 'Groom' || reward.userRole === 'Both');
    }
    else this.router.navigate(['']);
    this.filterRewardsByCategory('All');
    this.rewards.forEach(reward => reward.currentImageIndex = 0);
    this.isLoading = false; // Hide spinner after data is loaded
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(debounceTime(300))
      .subscribe(() => {
        const searchValue = this.searchInput.nativeElement.value.trim();
        this.searchValue = searchValue;
        this.filterRewardsByCategory(searchValue || 'All');
      });
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
    const searchValue = this.searchInput.nativeElement.value.trim();
    console.log(searchValue, 'searchValue');
    this.searchValue = searchValue;
    this.filterRewardsByCategory(searchValue || 'All');
  }

  clear() {
    this.searchValue = '';
    this.searchInput.nativeElement.value = '';
    this.filterRewardsByCategory('All');
  }

  onPanelChange() {
    const expandedCategory = this.getExpandedCategory();
    this.filterRewardsByCategory(expandedCategory ? expandedCategory.name : 'All');
  }

  filterRewardsByCategory(categoryName: string) {
    if (categoryName === 'All') {
      this.filteredRewards = this.rewards;
    } else {
      const lowerCategoryName = categoryName.toLocaleLowerCase();
      this.filteredRewards = this.rewards.filter((reward) => {
        return (
          reward.category.toLocaleLowerCase().includes(lowerCategoryName) ||
          reward.name.toLocaleLowerCase().includes(lowerCategoryName)
        );
      });
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
    this.mycartService.addToCart(pk);
  }
  
  calculateTotalPages() {
    const pageSize = 10;
    this.totalPages = Array.from({ length: Math.ceil(this.rewards.length / pageSize) }, (_, i) => i + 1);
  }

  onPageChange($event: any) {
    const pageIndex = $event.pageIndex;
    const pageSize = $event.pageSize;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;

    if (this.searchValue) {
      const searchValue = this.searchValue.toLocaleLowerCase();
      const filteredRewards = this.rewards.filter((reward) => {
        return (
          reward.category.toLocaleLowerCase().includes(searchValue) ||
          reward.name.toLocaleLowerCase().includes(searchValue)
        );
      });
      this.filteredRewards = filteredRewards.slice(startIndex, endIndex);
    } else {
      this.filteredRewards = this.rewards.slice(startIndex, endIndex);
    }
  }

  productDetails(primaryKey: number) {
    this.mycartService.openProductDetails(primaryKey);
  }

  nextImage(reward: any) {
    reward.currentImageIndex = (reward.currentImageIndex + 1) % reward.display_img_urls.length;
  }

  prevImage(reward: any) {
    reward.currentImageIndex = (reward.currentImageIndex - 1 + reward.display_img_urls.length) % reward.display_img_urls.length;
  }
}
