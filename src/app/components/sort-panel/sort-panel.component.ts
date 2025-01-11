import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-panel',
  templateUrl: './sort-panel.component.html',
  styleUrls: ['./sort-panel.component.css']
})
export class SortPanelComponent {
  @Output() close = new EventEmitter<void>();
  @Output() sort = new EventEmitter<string>();

  isAscApplied: boolean = false;
  isDescApplied: boolean = false;
  selectedSort: string | null = null;

  applySort(order: string): void {
    if (order === 'asc') {
      this.isAscApplied = true;
    } else if (order === 'desc') {
      this.isDescApplied = true;
    }
    this.selectedSort = order;
  }

  resetAll(): void {
    this.selectedSort = null;
    this.isAscApplied = false;
    this.isDescApplied = false;
  }

  apply(): void {
    if (this.selectedSort) {
      this.sort.emit(this.selectedSort);
      this.close.emit();
      this.selectedSort = null;
    }
  }


}
