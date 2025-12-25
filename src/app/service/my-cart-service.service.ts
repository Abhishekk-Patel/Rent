
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component';
import { ProductDetailsPopupComponent } from '../components/product-details-popup/product-details-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { UserService } from './user.service';
import { EmailValidator } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MyCartServiceService {
  /**
   * Clears the cart for the current user (both backend and local state)
   */
  // clearCart(): void {
  //   const userId = this.userService.getUserDetails().userId || this.userService.getUserDetails().googleId;
  //   this.httpClient
  //     .delete<any>(`${this.url}/api/cart/clear`, { body: { userId } })
  //     .subscribe(
  //       (response) => {
  //         this.cartItems.next([]);
  //         this.myCartValue.set(0);
  //         this.showMessage('Cart cleared');
  //       },
  //       (error) => {
  //         this.showMessage('Error clearing cart');
  //         console.error('Error clearing cart:', error);
  //       }
  //     );
  // }
  private readonly cartItems = new BehaviorSubject<any[]>([]);
  private readonly favoriteItems = new BehaviorSubject<any[]>([]); // Add favorite items BehaviorSubject
  cartItems$ = this.cartItems.asObservable();
  favoriteItems$ = this.favoriteItems.asObservable(); // Observable for favorite items
  isUser: string = '';
  myCartValue = signal(0);
  public isAddNewProductSubject = new BehaviorSubject<boolean>(false);
  isAddNewProduct$ = this.isAddNewProductSubject.asObservable();

  // Use localhost by default, switch to apiBaseUrl for production or as needed
  url = environment.apiBaseUrl;

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly httpClient: HttpClient,
    private readonly dialog: MatDialog,
    private readonly userService: UserService
  ) {}

  setIsAddNewProduct(value: boolean): void {
    this.isAddNewProductSubject.next(value);
  }

  addToCart(item: any): void {
    const userId = this.userService.getUserDetails().userId;
    const currentItems = this.cartItems.value;
    // Prevent adding if already in cart
    if (currentItems.some((cartItem) => cartItem.pk === (item.pk || item._id))) {
      this.showMessage('Item already in cart');
      return;
    }
    // Normalize item for backend contract
    const productToAdd: any = {
      userId: userId || this.userService.getUserDetails().googleId,
      pk: item.pk || item._id,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      productName: item.productName || item.name,
      productRent: item.productRent || item.price || item.Rent,
      city: item.city || '',
      display_img_urls: item.display_img_urls || (item.images ? item.images.map((img: any) => img.url) : []),
      category: item.category || item.productCategory || '',
    };
    this.httpClient
      .post<any>(`${this.url}/api/cart/add`, productToAdd)
      .subscribe(
        (response) => {
          // After successful add, fetch cart from backend to ensure sync
          this.fetchCartItems();
          this.myCartValue.update((value) => value + 1);
          this.showMessage('Product successfully added in cart');
        },
        (error) => {
          this.showMessage('Error adding item to cart');
          console.error('Error adding item to cart:', error);
        }
      );
  }

  getCartItems(): any[] {
    // Always return the latest cart items from BehaviorSubject, normalized for UI/suggestions
    return this.cartItems.value.map((item) => ({
      pk: item.pk || item._id,
      productName: item.productName || item.name,
      productRent: item.productRent || item.price || item.Rent,
      city: item.city || '',
      display_img_urls: item.display_img_urls || (item.images ? item.images.map((img: any) => img.url) : []),
      quantity: item.quantity || 1,
      category: item.category || item.productCategory || '',
    }));
  }
  fetchCartItems(): void {
    const userId = this.userService.getUserDetails().userId || this.userService.getUserDetails().googleId;
    this.httpClient
      .get<any>(`${this.url}/api/cart/${userId}`)
      .subscribe(
        (res) => {
          // Map API response: each item has { product, quantity }
          if (res && Array.isArray(res.items)) {
            const mapped = res.items.map((item: any) => {
              const prod = item.product || item;
              return {
                pk: prod.pk || prod._id,
                productName: prod.productName || prod.name,
                productRent: prod.productRent || prod.price || prod.Rent,
                city: prod.city || '',
                display_img_urls: prod.display_img_urls || (prod.images ? prod.images.map((img: any) => img.url) : []),
                quantity: item.quantity || 1,
                category: prod.category || prod.productCategory || '',
              };
            });
            this.cartItems.next(mapped);
            this.myCartValue.set(mapped.length);
          } else {
            this.cartItems.next([]);
            this.myCartValue.set(0);
          }
        },
        (error) => {
          this.cartItems.next([]);
          this.myCartValue.set(0);
        }
      );
  }

  removeFromCart(item: any): void {
    const userId = this.userService.getUserDetails().userId || this.userService.getUserDetails().googleId;
    const pk = item.pk || item.product?.pk;
  
    this.httpClient
      .delete<any>(`${this.url}/api/cart/remove`, { body: {userId,pk } })
      .subscribe(
        (response) => {
          this.showMessage('Item removed from cart');
          this.fetchCartItems(); // Refresh cart from backend
        },
        (error) => {
          this.showMessage('Error removing item from cart');
          console.error('Error removing item from cart:', error);
        }
      );
  }

  addToFavorites(item: any): void {
    const currentFavorites = this.favoriteItems.value;
    const itemExists = currentFavorites.some(
      (favItem) => favItem.pk === item.pk
    );

    if (!itemExists) {
      this.favoriteItems.next([...currentFavorites, item]);
      this.showMessage('Product successfully added to favorites');
    } else {
      this.showMessage('Item already in favorites');
    }
  }

  getFavoriteItems(): any[] {
    // Always return normalized favorite items for UI/suggestions
    return this.favoriteItems.value.map((item) => ({
      pk: item.pk || item._id,
      productName: item.productName || item.name,
      productRent: item.productRent || item.price || item.Rent,
      city: item.city || '',
      display_img_urls: item.display_img_urls || (item.images ? item.images.map((img: any) => img.url) : []),
      quantity: item.quantity || 1,
      category: item.category || item.productCategory || '',
    }));
  }

  removeFromFavorites(item: any): void {
    const currentFavorites = this.favoriteItems.value;
    const updatedFavorites = currentFavorites.filter(
      (favItem) => favItem.pk !== item.pk
    );

    if (updatedFavorites.length !== currentFavorites.length) {
      this.favoriteItems.next(updatedFavorites); // Update the BehaviorSubject with the new list
      this.showMessage('Item removed from favorites');
    } else {
      this.showMessage('Item not found in favorites');
    }
  }

  openCart(): void {
    // this.dialog.open(MyCartComponent);
    this.router.navigate(['/MyCart']);
  }

  closeCartModel(): void {
    this.dialog.closeAll();
  }


  /**
   * Upload product details and images. Returns observable for component to handle loader and response.
   */
  public uploadProduct(formData: FormData) {
    return this.httpClient.post(`${this.url}/upload`, formData);
  }

  openProductDetails(response: any): void {
    this.dialog.open(ProductDetailsPopupComponent, {
      data: { response },
    });
  }

  addProductDetailsApi(formData: FormData) {
    this.httpClient.post(`${this.url}/upload`, formData).subscribe(
      (response) => {
        this.dialog.open(ProductDetailsPopupComponent, {
          data: { response },
        });
      },
      (error) => {
        console.error('Error submitting product details', error);
        // Handle error here
      }
    );
  }
 

  itemExistsInCart(pk: number): boolean {
    return this.cartItems.value.some((cartItem) => cartItem.pk === pk);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  setUser(user: string): void {
    this.isUser = user;
    localStorage.setItem('user', user);
  }

  getUser(): string {
    return localStorage.getItem('user') || this.isUser;
  }

  getCartValue(): number {
    return this.myCartValue();
  }


}
