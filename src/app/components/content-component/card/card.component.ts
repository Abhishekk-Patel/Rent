import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
     @Input() product: any;
  currentImageIndex = 0;

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
  }

  getAverageRating(): number {
    const ratings = this.product.ratings || [];
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
    return total / ratings.length;
  }
}
