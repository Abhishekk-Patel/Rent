import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component'; // Adjust the path as necessary
import { ProductDetailsPopupComponent } from '../components/product-details-popup/product-details-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { signal } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MyCartServiceService {

  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  // private _isMsg: string = '';
  // isProductAddedInCart: boolean = false;
  isUser:string = '';
// myCartValue = signal(0);
  constructor(private readonly router: Router, private readonly dialog: MatDialog,private snackBar: MatSnackBar) {
   }
 
  addToCart(item: any): void {
    const currentItems = this.cartItems.value;
    this.cartItems.next([...currentItems, item]);
  }

  getCartItems(): any[] {
    return this.cartItems.value;
  }

  removeFromCart(item: any): void {
    const currentItems = this.cartItems.value;
    const index = currentItems.indexOf(item);
    if (index > -1) {
      currentItems.splice(index, 1);
      this.cartItems.next([...currentItems]);
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
}

