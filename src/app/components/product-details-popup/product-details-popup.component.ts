import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

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
          public readonly router: Router,
          public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private store: Store<{ productData: any[] }>
        ) {
          this.mycartService.isAddNewProduct$.subscribe((res) => {
            this.isAddNewProduct = res;
          });
        }

        ngOnInit(): void {
          this.subscription = this.store.select('productData').subscribe((res) => {
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

            if (this.data.response.products && this.data.response.products.length > 0) {
              this.productDetails = this.data.response.products;
            } else if (this.data.response.product) {
              this.productDetails = [this.data.response.product];
            } else {
              this.productDetails = [];
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
          const products = this.getProductDetails();
          const product = Array.isArray(products) ? products[0] : products;
          if (!product) return;
          if (product.images?.length > 0) {
            if (product.currentImageIndex === undefined) {
              product.currentImageIndex = 0;
            }
            product.currentImageIndex = (product.currentImageIndex + 1) % product.images.length;
          } else if (product.display_img_urls?.length > 0) {
            if (product.currentImageIndex === undefined) {
              product.currentImageIndex = 0;
            }
            product.currentImageIndex = (product.currentImageIndex + 1) % product.display_img_urls.length;
          }
        }

        prevImage() {
          const products = this.getProductDetails();
          const product = Array.isArray(products) ? products[0] : products;
          if (!product) return;
          if (product.images?.length > 0) {
            if (product.currentImageIndex === undefined) {
              product.currentImageIndex = 0;
            }
            product.currentImageIndex = (product.currentImageIndex - 1 + product.images.length) % product.images.length;
          } else if (product.display_img_urls?.length > 0) {
            if (product.currentImageIndex === undefined) {
              product.currentImageIndex = 0;
            }
            product.currentImageIndex = (product.currentImageIndex - 1 + product.display_img_urls.length) % product.display_img_urls.length;
          }
        }

        selectImage(idx: number): void {
          const products = this.getProductDetails();
          const product = Array.isArray(products) ? products[0] : products;
          if (!product) return;
          if (product.display_img_urls && product.display_img_urls.length > 0) {
            product.currentImageIndex = idx;
          } else if (product.images && product.images.length > 0) {
            product.currentImageIndex = idx;
          }
        }

        ngOnDestroy(): void {
          if (this.subscription) {
            this.subscription.unsubscribe();
          }
        }
      }

