import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component';
import { ProductDetailsPopupComponent } from '../components/product-details-popup/product-details-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MyCartServiceService {
  private readonly cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  isUser: string = '';
  myCartValue = signal(0);
  public isAddNewProductSubject = new BehaviorSubject<boolean>(false);
  isAddNewProduct$ = this.isAddNewProductSubject.asObservable();

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly httpClient: HttpClient,
    private readonly dialog: MatDialog
   
  ) {}

  setIsAddNewProduct(value: boolean): void {
    this.isAddNewProductSubject.next(value);
  }

  addToCart(item: any): void {
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
  }

  openCart(): void {
    this.dialog.open(MyCartComponent);
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
