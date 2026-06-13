import { Component } from '@angular/core';
import { AiService } from 'src/app/service/ai.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';

import { Router } from '@angular/router';


@Component({
  selector: 'app-product-search-ai',
  templateUrl: './product-search-ai.component.html',
  styleUrls: ['./product-search-ai.component.css']
})
export class ProductSearchAiComponent {


  prompt = '';
  loading = false;
  error = '';
  isOpen = false;

  message = '';
  products: any[] = [];

  // Confirmation state
  confirmationToken = '';
  confirmMessage = '';
  confirmProduct: any = null;

  constructor(
    private ai: AiService,
    public userService: UserService,
    private myCartService: MyCartServiceService,
    private router: Router
  ) {}

  toggle() {
    this.isOpen = !this.isOpen;
    this.error = '';

    // ✅ If closing, clear confirm state
    if (!this.isOpen) this.cancelConfirm();
  }

  searchProducts() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.error = '';
    this.message = '';
    this.products = [];
    this.cancelConfirm();

    this.ai.searchAiProdcuts(this.prompt).subscribe({
      next: (res:any) => {
        this.message = res?.message || '';
        this.products = res?.products || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || err?.error?.error || 'Search failed';
        this.loading = false;
      }
    });
  }

  viewProduct(p: any) {
    // Use your existing details navigation
    // If you have route like /product-details/:id
    this.router.navigate(['/product-details', p._id], { state: { response: p } });
  }

  prepareAddToCart(productId: string) {
    const userId =
      this.userService.getUserDetails()?.userId ||
      this.userService.getUserDetails()?.googleId ||
      '';

    if (!userId) {
      this.error = 'Please login to add items to cart';
      return;
    }

    this.loading = true;
    this.error = '';

    this.ai.prepareAddToCart(userId, productId, 1).subscribe({
      next: (res) => {
        this.confirmationToken = res?.confirmationToken || '';
        this.confirmMessage = res?.message || 'Confirm add to cart?';
        this.confirmProduct = res?.summary || null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || err?.error?.error || 'Failed to prepare add to cart';
        this.loading = false;
      }
    });
  }

  confirmAddToCart() {
    if (!this.confirmationToken) return;

    this.loading = true;
    this.error = '';

    this.ai.confirmAddToCart(this.confirmationToken).subscribe({
      next: (res) => {
        this.message = res?.message || 'Added to cart ✅';

        // ✅ refresh cart in app (navbar/cart page updates)
        this.myCartService.fetchCartItems();

        // clear confirm state
        this.cancelConfirm();

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || err?.error?.error || 'Confirmation failed';
        this.loading = false;
      }
    });
  }

  cancelConfirm() {
    this.confirmationToken = '';
    this.confirmMessage = '';
    this.confirmProduct = null;
  }

  isOwner(p: any): boolean {
    const email = this.userService.getUserDetails()?.email || '';
    return !!email && p?.productOwnerEmail === email;
  }
}
