import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
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
  defaultImg = 'assets/Downloads/MissingProduct.webp';

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

  response: any;

  constructor(
    public mycartService: MyCartServiceService,
    public readonly router: Router,
    private route: ActivatedRoute,
    @Optional() public dialogRef: MatDialogRef<ProductDetailsPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store<{ productData: any[] }>,
    public userService: UserService,
    private dialog: MatDialog
  ) {
    this.mycartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });
  }

  ngOnInit(): void {
    // 1) From routing state (when navigated)
    const navState = history.state || {};
    const responseFromRoute = navState.response;

    // 2) From dialog (when opened by MatDialog)
    const responseFromDialog = this.data?.response;

    // 3) From url param (refresh-safe) e.g. /product-details/:id
    const idFromParam = this.route.snapshot.paramMap.get('id');

    // Pick best available
    this.response = responseFromRoute || responseFromDialog || null;
    console.log(this.response, 'response');

    this.subscription = this.store.select('productData').subscribe((res) => {
      const products = (res || []).map((item: any) => ({
        pk: item._id,
        name: item.productName,
        Rent: item.productRent,
        description: item.productDescription || 'No description provided',
        category: item.category || 'General',
        quantity: item.quantity || 0,
        userRole: item.userRole || 'Both',
        valid_until: item.validUntil,
        display_img_urls: item.images?.map((img: any) => img.url) || [],
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

      // --- Decide what to display ---
      // A) If response has products/product
      if (this.response?.products?.length) {
        this.productDetails = this.response.products.map((item: any) =>
          this.normalizeProduct(item)
        );
      } else if (this.response?.product) {
        this.productDetails = [this.normalizeProduct(this.response.product)];
      }
      // B) If navigated with an id in url
      else if (idFromParam) {
        this.productDetails = products.find((p: any) => p.pk === idFromParam) || [];
      }
      // C) If passed primaryKey via dialog data
      else if (this.data?.primaryKey) {
        this.productDetails =
          products.find((p: any) => p.pk === this.data.primaryKey) || [];
      }
      // D) If response is just an id
      else if (this.response && typeof this.response === 'string') {
        this.productDetails =
          products.find((p: any) => p.pk === this.response) || [];
      }
      // E) fallback
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

  // ---------- Helpers for product structure ----------
  getProductDetails() {
    return this.productDetails;
  }

  normalizeProduct(item: any): any {
    return {
      pk: item._id || item.pk,
      name: item.productName || item.name,
      Rent: item.productRent || item.Rent || item.price,
      description:
        item.productDescription ||
        item.description ||
        'No description provided',
      category: item.category || 'General',
      quantity: item.quantity || 0,
      userRole: item.userRole || 'Both',
      valid_until: item.validUntil || item.valid_until,
      display_img_urls: item.images
        ? item.images.map((img: any) => img.url || img)
        : item.display_img_urls || [],
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

  // ---------- Close (works in BOTH dialog + routed mode) ----------
  closeProductDetailDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // change this to your "back" route
      this.router.navigate(['/content']);
    }
  }

  // ---------- Chat open (still dialog) ----------
  openMessageDialog(product: any) {
    this.dialog.open(UnifiedChatComponent, {
      position: { top: '0', left: '0' },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'chat-dialog-fullscreen',
      autoFocus: false,
      data: { product },
    });
  }

  // ---------- Cart ----------
  addToCart() {
    this.subscription = this.mycartService.isAddNewProduct$.subscribe((res) => {
      this.mycartService.showMessage('Product listed Successfully');
      this.closeProductDetailDialog();
      this.router.navigate(['/content']);
      this.subscription.unsubscribe();
    });

    if (this.productDetails && this.productDetails.pk) {
      if (this.mycartService.itemExistsInCart(this.productDetails.pk)) {
        this.mycartService.showMessage('Item already in cart');
      } else {
        this.mycartService.addToCart(this.productDetails);
        this.mycartService.showMessage('Product successfully added in cart');
        this.closeProductDetailDialog();
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

  // ---------- Rating ----------
  onRatingChange(newRating: number, reward: any) {
    if (!reward) return;
    reward.rating = newRating;
    this.userService.updateRating(reward.pk, newRating, reward.userId).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  // ---------- Images ----------
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImg;
  }

  nextImage() {
    const products = this.getProductDetails();
    const product = Array.isArray(products) ? products[0] : products;
    if (!product) return;

    if (product.images?.length > 0) {
      product.currentImageIndex ??= 0;
      product.currentImageIndex =
        (product.currentImageIndex + 1) % product.images.length;
    } else if (product.display_img_urls?.length > 0) {
      product.currentImageIndex ??= 0;
      product.currentImageIndex =
        (product.currentImageIndex + 1) % product.display_img_urls.length;
    }
  }

  prevImage() {
    const products = this.getProductDetails();
    const product = Array.isArray(products) ? products[0] : products;
    if (!product) return;

    if (product.images?.length > 0) {
      product.currentImageIndex ??= 0;
      product.currentImageIndex =
        (product.currentImageIndex - 1 + product.images.length) %
        product.images.length;
    } else if (product.display_img_urls?.length > 0) {
      product.currentImageIndex ??= 0;
      product.currentImageIndex =
        (product.currentImageIndex - 1 + product.display_img_urls.length) %
        product.display_img_urls.length;
    }
  }

  selectImage(idx: number): void {
    const products = this.getProductDetails();
    const product = Array.isArray(products) ? products[0] : products;
    if (!product) return;

    if (product.display_img_urls?.length > 0) {
      product.currentImageIndex = idx;
    } else if (product.images?.length > 0) {
      product.currentImageIndex = idx;
    }
  }

  // ---------- Zoom ----------
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

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    this.zoomPreview.x = x;
    this.zoomPreview.y = y;
    this.zoomPreview.bgPos = `${xPercent}% ${yPercent}%`;
  }

  setZoomImageUrl(): void {
    const pd = this.getProductDetails();
    const product = Array.isArray(pd) ? pd[0] : pd;

    const idx = product?.currentImageIndex ?? 0;

    this.zoomPreview.imgUrl =
      product?.display_img_urls?.[idx] ||
      product?.images?.[idx]?.url ||
      'assets/placeholder.png';
  }

  // ---------- Share ----------
  shareProduct(product: any) {
    const shareUrl = `${window.location.origin}/#/product-details/${product.pk || product.id}`;

    const shareData = {
      title: product.name || 'Product',
      text: `Check out this product: ${product.name}`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error('Share cancelled or failed', err);
      });
      return;
    }

    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Product link copied to clipboard!');
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

