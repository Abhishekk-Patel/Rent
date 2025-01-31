import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component'; // Adjust the path as necessary
import { ProductDetailsPopupComponent } from '../components/product-details-popup/product-details-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
 import { signal } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MyCartServiceService {

  private readonly cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  isUser:string = '';
 myCartValue = signal(0);
  constructor(private readonly router: Router, private readonly dialog: MatDialog,private readonly snackBar: MatSnackBar) {
   }
 
  addToCart(item: any): void {
    const currentItems = this.cartItems.value;
    const itemExists = currentItems.some(cartItem => cartItem == item ); // Check for duplicate
   if (!itemExists) {
      this.cartItems.next([...currentItems, item]);
      this.myCartValue.update(value => value + 1); // Update cart value
    } else {
      this.showMessage('Item already in cart'); // Show message if item exists
    }
  }

  getCartItems(): any[] {
    return this.cartItems.value;
  }

  removeFromCart(item: any): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(cartItem => cartItem !== item.pk);

    if (updatedItems.length !== currentItems.length) {
      this.cartItems.next(updatedItems);
      this.myCartValue.update(value => value - 1); // Update cart value
    } else {
      this.showMessage('Item not found in cart'); // Show message if item not found
      
    }
  }

  openCart(): void {
   
      this.dialog.open(MyCartComponent);
    
  }
  openProductDetails(primaryKey: number): void {
    this.dialog.open(ProductDetailsPopupComponent, {
      data: { primaryKey }
    });
}

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds
    });
  }

  setUser(user: string): void {
    this.isUser = user;
  }

  getUser(): string {
    return this.isUser;
  }

  getCartValue(): number {
    return this.myCartValue();
  }
}

