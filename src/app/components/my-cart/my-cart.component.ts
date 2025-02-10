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
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    this.deliveryFormGroup = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      rentalPeriod: this.fb.group({
      start: [today, Validators.required],
      end: [today, Validators.required]
      })
    });
    this.paymentFormGroup = this.fb.group({
      paymentMode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.myCartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.fetchCartItems(); // Ensure cart items are fetched on init
  }

  removeFromCart(item: any): void {
    this.myCartService.removeFromCart(item);
    this.fetchCartItems(); // Update cart items after removal

    if (!this.cartItems.length) {
      this.dialogRef.close();
    }
  }

  placeOrder(): void {
  //  console.log(this.deliveryFormGroup.value);
   // console.log(this.paymentFormGroup.value);
    if (this.deliveryFormGroup.valid) {
      // Handle order placement logic here
     
      this.myCartService.showMessage('Order placed successfully');
      this.dialogRef.close();
    }
    else{
     
      this.myCartService.showMessage('Error! Please fill all the details');

    }
  }

  fetchCartItems(): void {
    this.cartItems = this.myCartService.getCartItems().map(cartItem => {
      const productDetail = this.productDetails.find(product => product.pk === cartItem.pk);
      console.log("productDetail", productDetail);
      return { ...cartItem, ...productDetail };
    });
  }
}
