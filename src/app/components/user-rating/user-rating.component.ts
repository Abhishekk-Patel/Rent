import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-rating',
  templateUrl: './user-rating.component.html',
  styleUrls: ['./user-rating.component.css']
})
export class UserRatingComponent {
  @Input() rating: number = 0;
  @Input() avgRating: number = 0;
  @Input() totalUsers: number = 0;
  @Output() ratingChange = new EventEmitter<number>();

  stars = Array(5).fill(0);

  setRating(value: number) {
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }

}
