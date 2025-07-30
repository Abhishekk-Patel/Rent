import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component';
import { ProductDetailsPopupComponent } from '../components/product-details-popup/product-details-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class MyCartServiceService {
  private readonly cartItems = new BehaviorSubject<any[]>([]);
  private readonly favoriteItems = new BehaviorSubject<any[]>([]); // Add favorite items BehaviorSubject
  cartItems$ = this.cartItems.asObservable();
  favoriteItems$ = this.favoriteItems.asObservable(); // Observable for favorite items
  isUser: string = '';
  myCartValue = signal(0);
  public isAddNewProductSubject = new BehaviorSubject<boolean>(false);
  isAddNewProduct$ = this.isAddNewProductSubject.asObservable();

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
    console.log(this.userService.getUserDetails().userId,"user frim my cart service");
   const userId = this.userService.getUserDetails().userId;
 this.httpClient.post<any>(`http://localhost:3000/api/cart/add`, { ...item, userId }).subscribe(   response => {

        console.log('Item added to cart:', response);
      },
      error => {
        console.error('Error adding item to cart:', error);
      }
    );

    const currentItems = this.cartItems.value;
    const itemExists = currentItems.some((cartItem) => cartItem.pk === item.pk);

    if (!itemExists) {
      this.cartItems.next([...currentItems, item]);
      this.myCartValue.update((value) => value + 1);
      this.showMessage('Product successfully added in cart');
    } else {
      this.showMessage('Item already in cart');
    }
  }

  getCartItems(): any[] {
    return this.cartItems.value;
  }
 fetchCartItems(): void {
    this.httpClient.get<any>(`http://localhost:3000/api/cart/${this.userService.getUserDetails().userId}`).subscribe(res => {
      console.log('Cart items fetched:', res);
      
    //  this.cartItems.next(res.items);
    });
  } 


  removeFromCart(item: any): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter((cartItem) => cartItem.pk !== item.pk);

    if (updatedItems.length !== currentItems.length) {
      this.cartItems.next(updatedItems);
      this.myCartValue.update((value) => value - 1);
      this.showMessage('Item removed from cart');
    } else {
      this.showMessage('Item not found in cart');
    }

    this.httpClient.post('http://localhost:3000/api/cart/remove', { userId: this.userService.getUserDetails().userId, pk: item.pk }).subscribe(
      response => {
        console.log('Item removed from cart:', response);
      },
      error => {
        console.error('Error removing item from cart:', error);
      }
    );
  }

  addToFavorites(item: any): void {
    const currentFavorites = this.favoriteItems.value;
    const itemExists = currentFavorites.some((favItem) => favItem.pk === item.pk);

    if (!itemExists) {
      this.favoriteItems.next([...currentFavorites, item]);
      this.showMessage('Product successfully added to favorites');
    } else {
      this.showMessage('Item already in favorites');
    }
  }

  getFavoriteItems(): any[] {
    return this.favoriteItems.value; // Return the current list of favorite items
  }

  removeFromFavorites(item: any): void {
    const currentFavorites = this.favoriteItems.value;
    const updatedFavorites = currentFavorites.filter((favItem) => favItem.pk !== item.pk);

    if (updatedFavorites.length !== currentFavorites.length) {
      this.favoriteItems.next(updatedFavorites); // Update the BehaviorSubject with the new list
      this.showMessage('Item removed from favorites');
    } else {
      this.showMessage('Item not found in favorites');
    }
  }

  openCart(): void {
    this.dialog.open(MyCartComponent);
  }

  closeCartModel(): void {
    this.dialog.closeAll();
  }

  openProductDetails(primaryKey: number): void {
    this.dialog.open(ProductDetailsPopupComponent, {
      data: { primaryKey },
    });
  }

  addProductDetailsApi(formData: FormData) {
    this.httpClient.post('http://localhost:3000/upload', formData).subscribe(response => {
      this.dialog.open(ProductDetailsPopupComponent, {
        data: {response},
      });
    }, error => {
      console.error("Error submitting product details", error);
      // Handle error here
    });
  }
  
  itemExistsInCart(pk: number): boolean {
    return this.cartItems.value.some((cartItem) => cartItem === pk);
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
