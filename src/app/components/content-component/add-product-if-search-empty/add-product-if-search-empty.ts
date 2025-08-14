import { Component, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-add-product-if-search-empty',
  templateUrl: './add-product-if-search-empty.html',
  styleUrls: ['./add-product-if-search-empty.component.css'],
  standalone: false,
  
})
export class AddProductIfSearchEmptyComponent {
  @Output() addProduct = new EventEmitter<void>();

  addNewProduct() {
    this.addProduct.emit();
  }
}
