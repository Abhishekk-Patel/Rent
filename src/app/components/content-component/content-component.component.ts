import { Component } from '@angular/core';
import { REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-content-component',
  templateUrl: './content-component.component.html',
  styleUrls: ['./content-component.component.css']
})
export class ContentComponentComponent {
  categories = [
    { name: 'e-Voucher', isExpanded: true, isSelected: true },
    { name: 'Products', isExpanded: false, isSelected: false },
    { name: 'Evergreen', isExpanded: false, isSelected: false },
    { name: 'Fashion & Retail', isExpanded: false, isSelected: false }
  ];
 
  rewards = REWARD_LIST;
  isSortPanelOpen = false;

  openSortPanel() {
    this.isSortPanelOpen = true;
  }

  closeSortPanel() {
    this.isSortPanelOpen = false;
  }

  sortRewards(order: string) {
    this.rewards.sort((a, b) => {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
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

}
