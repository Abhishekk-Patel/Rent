import { Component, Output, EventEmitter,Input } from '@angular/core';

@Component({
  selector: 'app-add-product-if-search-empty',
  templateUrl: './add-product-if-search-empty.html',
  styleUrls: ['./add-product-if-search-empty.component.css'],
  standalone: false,
  
})
export class AddProductIfSearchEmptyComponent {
  @Output() addProduct = new EventEmitter<void>();
  @Input() isCartOpen: boolean = false;

  ngOnChanges() {
    if (this.isCartOpen) {
      this.heading = 'Your cart is empty';
      this.subHeading = 'You can add products to your cart.';
    } else {
      this.heading = 'No Results Found';
      this.subHeading = 'We could not find any products matching your search.';
    }
  }
  heading = 'No Results Found';
  subHeading = 'We could not find any products matching your search.';



  addNewProduct() {
    this.addProduct.emit();
  }
}
