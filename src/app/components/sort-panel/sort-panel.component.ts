import { Component, EventEmitter, Inject, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-sort-panel',
  templateUrl: './sort-panel.component.html',
  styleUrls: ['./sort-panel.component.css']
})
export class SortPanelComponent {
  @Output() close = new EventEmitter<void>();
  @Output() sort = new EventEmitter<string>();
  @Output() filterByPrice = new EventEmitter<{ min: number, max: number }>();
  @Output() filterByLocation = new EventEmitter<string>();

  isAscApplied: boolean = false;
  isDescApplied: boolean = false;

  selectedSort: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  location: string | null = null;

  constructor( public myCartService: MyCartServiceService) {}

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
    this.minPrice = null;
    this.maxPrice = null;
    this.location = null;
  }

  apply(): void {
    if (this.selectedSort) {
      this.sort.emit(this.selectedSort);
    }
    if (this.isPriceFilterApplied()) {
      this.filterByPrice.emit({ min: this.minPrice!, max: this.maxPrice! });
    }
    if (this.location) {
      this.filterByLocation.emit(this.location);
    }
    this.close.emit();
    this.selectedSort = null;
  }

  isPriceFilterApplied(): boolean {
    return this.minPrice !== null || this.maxPrice !== null;
  }

}
