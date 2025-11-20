import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { UnifiedChatComponent } from '../unified-chat.component';

@Component({
        selector: 'app-product-details-popup',
        templateUrl: './product-details-popup.component.html',
        styleUrls: ['./product-details-popup.component.css'],
      })
      export class ProductDetailsPopupComponent implements OnInit, OnDestroy {
        productDetails: any;
        isAddNewProduct: boolean = false;
        subscription: Subscription = new Subscription();
        isMagnifierEnabled = true;
        showZoomPreview = false;
        zoomPreview = {
          x: 0,
          y: 0,
          bgPos: '50% 50%',
          scale: 2.2, // Preview box zoom
          boxSize: 220, // px
          imgUrl: '',
        };

        constructor(
          public mycartService: MyCartServiceService,
          public readonly router: Router,
          public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private store: Store<{ productData: any[] }>,
          public userService: UserService,
            private dialog: MatDialog
        ) {
          this.mycartService.isAddNewProduct$.subscribe((res) => {
            this.isAddNewProduct = res;
          });
        }

        ngOnInit(): void {
          this.subscription = this.store.select('productData').subscribe((res) => {
          //  console.log(res,"res in popup");
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
              color: item.color,
              size: item.size,
              productListedDate: item.productListedDate,
              ownerName: item.ownerName,
              ownerEmail: item.ownerEmail,
              ownerPhone: item.ownerPhone,
              ProductRatings: item.ratings || [],
              avgRating: item.avgRating || 0,
              totalUserRated: item.totalUserRated || item.ratings?.length || 0,
              userId: item.userId || '',
            }));

            this.productDetails = products.find(
              (product: any) => product.pk === this.data.primaryKey
            );


            if (this.data.response.products && this.data.response.products.length > 0) {
              this.productDetails = this.data.response.products.map((item: any) => this.normalizeProduct(item));
            } else if (this.data.response.product) {
              this.productDetails = [this.normalizeProduct(this.data.response.product)];
            }
            else if(this.data){
              this.productDetails = products.find(
              (product: any) => product.pk === this.data.response
            );
            }
            else {
              this.productDetails = [];
            }
              // mark favorite state from service if available
              const displayed = this.getDisplayedProduct();
              if (displayed) {
                const favs = this.mycartService.getFavoriteItems() || [];
                displayed.isFavorite = favs.some((f: any) => f.pk === displayed.pk);
              }
          });
        }

        getProductDetails() {

          // console.log(this.productDetails,"this.productDetails");
          return this.productDetails;
        }

        normalizeProduct(item: any): any {
          return {
            pk: item._id || item.pk,
            name: item.productName || item.name,
            Rent: item.productRent || item.Rent || item.price,
            description: item.productDescription || item.description || 'No description provided',
            category: item.category || 'General',
            quantity: item.quantity || 0,
            userRole: item.userRole || 'Both',
            valid_until: item.validUntil || item.valid_until,
            display_img_urls: item.images ? item.images.map((img: any) => img.url || img) : item.display_img_urls || [],
            currentImageIndex: item.currentImageIndex || 0,
            city: item.city || 'Unknown',
            low_quantity: item.lowQuantity || 5,
            buyers: item.buyers || 0,
            color: item.color,
            size: item.size,
            productListedDate: item.productListedDate,
            ownerName: item.ownerName,
            ownerEmail: item.ownerEmail || item.ProductOwnerEmail,
            ownerPhone: item.ownerPhone,
            ProductRatings: item.ratings || item.ProductRatings || [],
            avgRating: item.avgRating || 0,
            totalUserRated: item.totalUserRated || item.ratings?.length || 0,
            userId: item.userId || '',
            images: item.images || [],
          };
        }

        getDisplayedProduct() {
          const pd = this.getProductDetails();
          return Array.isArray(pd) ? pd[0] : pd;
        }

        closeProductDetailDialog(): void {
          this.dialogRef.close();
        }
          openMessageDialog(product: any) {
            this.dialog.open(UnifiedChatComponent, {
              position: { top: '0', left: '0' },
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              panelClass: 'chat-dialog-fullscreen',
              autoFocus: false,
              data: { product }
            });
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

        toggleFavorite(product: any) {
          if (!product) return;
          product.isFavorite = !product.isFavorite;
          if (product.isFavorite) {
            this.mycartService.addToFavorites(product);
          } else {
            this.mycartService.removeFromFavorites?.(product);
          }
        }

        onRatingChange(newRating: number, reward: any) {
          if (!reward) return;
          reward.rating = newRating;
          this.userService.updateRating(reward.pk, newRating, reward.userId).subscribe((res: any) => {});
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

        onZoomEnter(event: MouseEvent): void {
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            this.showZoomPreview = true;
            this.setZoomImageUrl();
            this.updateZoomPosition(event);
          }
        }

        onZoomLeave(): void {
          this.showZoomPreview = false;
        }

        onZoomMove(event: MouseEvent): void {
          if (!this.showZoomPreview) return;
          this.updateZoomPosition(event);
        }

        updateZoomPosition(event: MouseEvent): void {
          const img = event.target as HTMLElement;
          const rect = img.getBoundingClientRect();
          let x = event.clientX - rect.left;
          let y = event.clientY - rect.top;
          // Clamp preview box within image bounds
          x = Math.max(0, Math.min(x, rect.width));
          y = Math.max(0, Math.min(y, rect.height));
          const xPercent = (x / rect.width) * 100;
          const yPercent = (y / rect.height) * 100;
          this.zoomPreview.x = x;
          this.zoomPreview.y = y;
          this.zoomPreview.bgPos = `${xPercent}% ${yPercent}%`;
        }

        setZoomImageUrl(): void {
          this.zoomPreview.imgUrl =
            this.getProductDetails()?.display_img_urls?.[this.getProductDetails()?.currentImageIndex ?? 0] ||
            this.getProductDetails()[0]?.images?.[this.getProductDetails()[0]?.currentImageIndex ?? 0]?.url ||
            'assets/placeholder.png';
        }

        ngOnDestroy(): void {
          if (this.subscription) {
            this.subscription.unsubscribe();
          }
        }
      }

