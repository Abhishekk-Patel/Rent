import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { DataService } from 'src/app/service/data.service';
import { OrderService } from 'src/app/service/order.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.css'],
})
export class MyCartComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  favoriteItems: any[] = []; // List of favorite items
  suggestedProducts: any[] = []; // List of suggested products
  showStepper: boolean = false; // Controls which view is displayed
  selectedHeader: string = 'Cart'; // Dynamic header text
  productFormGroup: FormGroup;
  deliveryFormGroup: FormGroup;
  paymentFormGroup: FormGroup;
  currentSuggestionIndex: number = 0; // Track the current suggestion index
  private sliderSubscription!: Subscription; // Subscription for the automatic slider

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
      this.generateSuggestions(); // Generate suggestions whenever cart items change
    });
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Fetch favorite items
    this.generateSuggestions(); // Generate suggestions on initialization
    this.startAutoSlider(); // Start the automatic slider
  }

  ngOnDestroy(): void {
    if (this.sliderSubscription) {
      this.sliderSubscription.unsubscribe(); // Unsubscribe from the slider on destroy
    }
  }

  selectHeader(header: string): void {
    this.selectedHeader = header;
    this.showStepper = false; // Reset stepper view when switching
  }

  removeFromCart(item: any, index: number): void {
    item.removing = true; // Add the removing class to trigger the animation
    setTimeout(() => {
      this.myCartService.removeFromCart(item); // Use service function to remove item
      this.cartItems = this.myCartService.getCartItems(); // Update cart items after animation
    }, 500); // Delay matches the animation duration (1.5s)
  }

  removeFromFavorites(item: any): void {
    this.myCartService.removeFromFavorites(item); // Call the service to remove the item
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Update the local favoriteItems list
  }

  placeOrder(): void {
    this.showStepper = true; 
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

  addToCard(item: any): void {
    this.myCartService.addToCart(item); // Add the item to the cart
    this.myCartService.removeFromFavorites(item); // Remove the item from favorites
    this.cartItems = this.myCartService.getCartItems(); // Update the cart items list
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Update the favorite items list
  }

  generateSuggestions(): void {
    if (this.cartItems.length > 0 || this.favoriteItems.length > 0) {
      // Fetch related products based on cart or favorite items
      const relatedCategories = [
        ...new Set([
          ...this.cartItems.map((item) => item.category),
          ...this.favoriteItems.map((item) => item.category),
        ]),
      ];
      this.dataService.getAllProductData().subscribe((products) => {
        this.suggestedProducts = products
          .filter((product) => relatedCategories.includes(product.category))
          .map((product) => ({
            ...product,
            display_img_urls: product.images.map((img: any) => img.url), // Transform product data
          }));
      });
    } else {
      // Fetch random products if cart and favorite lists are empty
      this.dataService.getAllProductData().subscribe((products) => {
        this.suggestedProducts = products
          .slice(0, 5) // Limit to 5 random products
          .map((product) => ({
            ...product,
            display_img_urls: product.images.map((img: any) => img.url), // Transform product data
          }));
      });
    }
  }

  nextSuggestion(): void {
    this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % this.suggestedProducts.length;
  }

  prevSuggestion(): void {
    this.currentSuggestionIndex =
      (this.currentSuggestionIndex - 1 + this.suggestedProducts.length) % this.suggestedProducts.length;
  }

  startAutoSlider(): void {
    this.sliderSubscription = interval(3000).subscribe(() => {
      this.nextSuggestion(); // Automatically move to the next suggestion every 5 seconds
    });
  }
}
