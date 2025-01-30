import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { REWARD_LIST } from 'src/mock-data';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.css']
})
export class MyCartComponent implements OnInit {
  cartItems: any[] = [];
  productFormGroup: FormGroup;
  deliveryFormGroup: FormGroup;
  paymentFormGroup: FormGroup;
 public productDetails = REWARD_LIST;


  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<MyCartComponent>,
    private readonly myCartService: MyCartServiceService
  ) {
    
    this.productFormGroup = this.fb.group({});
    this.deliveryFormGroup = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required]
    });
    this.paymentFormGroup = this.fb.group({
      paymentMode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log("ngOnInit called");
    this.myCartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
   // this.cartItems = this.myCartService.getCartItems(); // Ensure cart items are fetched on init
  
   this.fetchCartItems();
  }

  removeFromCart(item: any): void {
    this.myCartService.removeFromCart(item);
    this.cartItems = this.myCartService.getCartItems();
    
  }

  placeOrder(): void {
    if (this.deliveryFormGroup.valid && this.paymentFormGroup.valid) {
      // Handle order placement logic here
      console.log('Order placed successfully');
      this.dialogRef.close();
    }
  }

  fetchCartItems(): void {
    this.cartItems = this.myCartService.getCartItems().map(cartItem => {
      const productDetail = this.productDetails.find(product => product.pk === cartItem);
      console.log("productDetail",productDetail);
      return { ...cartItem, ...productDetail };
    });
  }
}
