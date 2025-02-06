import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-product-details-popup',
  templateUrl: './product-details-popup.component.html',
  styleUrls: ['./product-details-popup.component.css'],
})
export class ProductDetailsPopupComponent implements OnDestroy{ 
  productDetails = REWARD_LIST;
  isAddNewProduct: boolean = false;
  subscription: any;

  constructor(
    public mycartService: MyCartServiceService,
    public readonly router: Router,
    public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (typeof this.data.primaryKey === 'object') {
    }
    this.mycartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });
  }

  getProductDetails() {
    if (typeof this.data.primaryKey === 'number') {
      return this.productDetails.find(
        (product) => product.pk === this.data.primaryKey
      );
    } else if (typeof this.data.primaryKey === 'object') {
      return this.data['primaryKey'];
    } else {
      return null;
    }
  }

  closeProductDetailDialog(): void {
    this.dialogRef.close();
  }

  addToCart() {
    this.subscription = this.mycartService.isAddNewProduct$.subscribe(
      (res) => {
        this.mycartService.showMessage('Product listed Successfully');
        this.dialogRef.close();
        this.router.navigate(['/content']);
        this.subscription.unsubscribe();
      }
    );

    if (typeof this.data.primaryKey === 'number') {
      if (this.mycartService.itemExistsInCart(this.data.primaryKey)) {
        this.mycartService.showMessage('Item already in cart');
      } else {
        this.mycartService.addToCart(this.data.primaryKey);
        this.mycartService.showMessage('Product successfully added in cart');
        this.dialogRef.close();
      }
    }
  }

  nextImage() {
    const product = this.getProductDetails();
    if (product) {
      product.currentImageIndex =
        (product.currentImageIndex + 1) % product.display_img_urls.length;
    }
  }

  prevImage() {
    const product = this.getProductDetails();
    if (product) {
      product.currentImageIndex =
        (product.currentImageIndex - 1 + product.display_img_urls.length) %
        product.display_img_urls.length;
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
  }
}
