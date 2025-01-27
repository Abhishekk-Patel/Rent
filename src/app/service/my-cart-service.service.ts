import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyCartComponent } from '../components/my-cart/my-cart.component'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class MyCartServiceService {

  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  constructor(private readonly router: Router, private readonly dialog: MatDialog) { }
 
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
}

