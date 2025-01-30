import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-product-details-popup',
  templateUrl: './product-details-popup.component.html',
  styleUrls: ['./product-details-popup.component.css']
})
export class ProductDetailsPopupComponent {
  constructor(
    public mycartService: MyCartServiceService,
    public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject the data
  ) {
   // console.log(data, 'dialogRef.data'); // Access the data here
  }

   productDetails = REWARD_LIST;
   isAdded: boolean = false;

   getProductDetails() {
    return this.productDetails.find((product) => product.pk === this.data.primaryKey);

   }
   closeProductDetailDialog(): void {
    this.dialogRef.close();
  }
  addToCart() {
    this.mycartService.addToCart(this.data.primaryKey);
    this.mycartService.showMessage('Product successfully added in cart');
  }

  nextImage() {
    const product = this.getProductDetails();
    if (product) {
      product.currentImageIndex = (product.currentImageIndex + 1) % product.display_img_urls.length;
    }
  }

  prevImage() {
    const product = this.getProductDetails();
    if (product) {
      product.currentImageIndex = (product.currentImageIndex - 1 + product.display_img_urls.length) % product.display_img_urls.length;
    }
  }
}
