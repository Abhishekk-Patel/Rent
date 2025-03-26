import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { DataService } from 'src/app/service/data.service';
import { OrderService } from 'src/app/service/order.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.css'],
})
export class MyCartComponent implements OnInit {
  cartItems: any[] = [];
  favoriteItems: any[] = []; // List of favorite items
  showStepper: boolean = false; // Controls which view is displayed
  selectedHeader: string = 'Cart'; // Dynamic header text
  productFormGroup: FormGroup;
  deliveryFormGroup: FormGroup;
  paymentFormGroup: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly myCartService: MyCartServiceService,
    private readonly dataService: DataService,
    private readonly orderService: OrderService
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
        end: [today, Validators.required],
      }),
      orderDate: [today, Validators.required],
    });

    this.paymentFormGroup = this.fb.group({
      paymentMode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.myCartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Fetch favorite items
  }

  selectHeader(header: string): void {
    this.selectedHeader = header;
    this.showStepper = false; // Reset stepper view when switching
  }

  removeFromCart(item: any): void {
    this.myCartService.removeFromCart(item);
    if (!this.cartItems.length) {
      this.showStepper = false; // Ensure we reset back to the cart layout if empty
    }
  }

  removeFromFavorites(item: any): void {
    this.myCartService.removeFromFavorites(item);
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Update favorite items
  }

  placeOrder(): void {
    this.showStepper = true; // Switch to stepper mode
  }

  confirmOrder(): void {
    if (this.deliveryFormGroup.valid) {
      const orderData = [[...this.cartItems], [this.deliveryFormGroup.value]];
      this.orderService.sendOrder(orderData);
      this.myCartService.showMessage('Order placed successfully');
      this.showStepper = false; // Return to cart after placing order
    } else {
      this.myCartService.showMessage('Error! Please fill all the details');
    }
  }
}
