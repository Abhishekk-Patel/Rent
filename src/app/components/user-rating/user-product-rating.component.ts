import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-rating',
  templateUrl: './user-product-rating.component.html',
  styleUrls: ['./user-product-rating.component.css']
})
export class UserProductRatingComponent {
  @Input() rating: number = 0;
  @Input() avgRating: number = 0;
  @Input() totalUsers: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
 @Input() disabled: boolean = false;

  stars = Array(5).fill(0);

  setRating(value: number) {
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }

}
