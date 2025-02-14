import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-product-details-popup',
  templateUrl: './product-details-popup.component.html',
  styleUrls: ['./product-details-popup.component.css'],
})
export class ProductDetailsPopupComponent implements OnInit, OnDestroy {
  productDetails: any;
  isAddNewProduct: boolean = false;
  subscription: Subscription = new Subscription();

  constructor(
    public mycartService: MyCartServiceService,
    public dataservice: DataService,
    public readonly router: Router,
    public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mycartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });
  }

  ngOnInit(): void {
    this.subscription = this.dataservice.products$.subscribe((res) => {
      const products = res.map((item: any) => ({
        pk: item._id,
        name: item.productName,
        Rent: item.productRent,
        description: item.productDescription || 'No description provided',
        category: item.category || 'General',
        quantity: item.quantity || 0,
        userRole: item.userRole || 'Both',
        valid_until: item.validUntil,
        display_img_urls: item.images.map((img: any) => img.url),
        currentImageIndex: 0,
        city: item.city || 'Unknown',
        low_quantity: item.lowQuantity || 5,
        buyers: item.buyers || 0,
      }));
      this.productDetails = products.find(
        (product: any) => product.pk === this.data.primaryKey
      );
      if (!products.length) {
        this.productDetails = this.data.response.product;
      }
    });
  }

  getProductDetails() {
    return this.productDetails;
  }

  closeProductDetailDialog(): void {
    this.dialogRef.close();
  }

  addToCart() {
    this.subscription = this.mycartService.isAddNewProduct$.subscribe((res) => {
      this.mycartService.showMessage('Product listed Successfully');
      this.dialogRef.close();
      this.router.navigate(['/content']);
      this.subscription.unsubscribe();
    });

    if (this.productDetails && this.productDetails.pk) {
      if (this.mycartService.itemExistsInCart(this.productDetails.pk)) {
        this.mycartService.showMessage('Item already in cart');
      } else {
        this.mycartService.addToCart(this.productDetails);
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
