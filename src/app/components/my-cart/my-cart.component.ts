import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { DataService } from 'src/app/service/data.service';
import { OrderService } from 'src/app/service/order.service';
import { interval, Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.css'],
  animations: [
    trigger('fadeOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition('in => out', [animate('0.5s ease-out')]),
    ]),
  ],
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
  private orderSubscription!: Subscription; // Subscription for order updates
  isOwner: Boolean = false;
  user: string = ''; // User email for socket connection


  constructor(
    private readonly fb: FormBuilder,
    private readonly myCartService: MyCartServiceService,
    private readonly dataService: DataService,
    private readonly orderService: OrderService,
    private readonly userService: UserService
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
    // Always fetch cart items from API on init
    this.myCartService.fetchCartItems();
    this.myCartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      console.log('Cart items updated:', this.cartItems);
      this.generateSuggestions(); // Generate suggestions whenever cart items change
    });
    this.favoriteItems = this.myCartService.getFavoriteItems(); // Fetch favorite items
    this.generateSuggestions(); // Generate suggestions on initialization
    this.startAutoSlider(); // Start the automatic slider
     this.user = this.userService.getUserDetails().email;
    console.log('Connecting to socket with user:', this.user);
    this.orderService.connectToSocket(this.user);

    this.orderSubscription = this.orderService
      .receiveOrder()
      .subscribe((order) => {
        console.log('Order received:', order);

        const productEmails = order.product.map(
          (res: any) =>res.productOwnerEmail
        );

        // Check if the current user matches any product owner email
        if (productEmails.includes(this.user)) {
          this.isOwner = true;
          this.myCartService.showMessage(order.message);
         
        } else {
          this.isOwner = false; // Set to false if no match
          this.myCartService.showMessage('No new orders');
        }

        // If the order was placed by this user (customer), clear cart and show message
        if (order.customer && order.customer.email === this.user) {
          order.product.forEach((item: any) => {
            console.log('Removing item from cart:', item);
            this.myCartService.removeFromCart(item);
          });
          this.cartItems = []; // Clear local cart items
          this.closeCartModel();
          this.myCartService.showMessage(order.message);

        }
      });


      this.orderService.orderError().subscribe((error) => {
        this.myCartService.showMessage(error.message); // or handle as needed
        console.error('Order error:', error);
      });
  }

  ngOnDestroy(): void {
    if (this.sliderSubscription) {
      this.sliderSubscription.unsubscribe(); // Unsubscribe from the slider on destroy
    }
    this.orderSubscription.unsubscribe(); // Unsubscribe from the order updates
    this.orderService.disconnect(); // Clean up socket connection
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
    this.confirmOrder();
  }

  closeCartModel(){
    this.myCartService.closeCartModel(); // Call the service to close the cart model
  }
  confirmOrder(): void {
     const userId = this.userService.getUserDetails().userId || this.userService.getUserDetails().googleId;
    if (this.deliveryFormGroup.valid) {
      const orderData = {
        product: [...this.cartItems],
        customer: this.deliveryFormGroup.value,
        userId: userId
      };

      this.orderService.sendOrder(orderData);
      // this.myCartService.showMessage('Order placed successfully');
     
      this.showStepper = false; // Return to cart after placing order
    } else {
      this.myCartService.showMessage('Error! Please fill all the details');
    }
  }

  addToCard(item: any): void {
    // Determine the unique identifier (pk or _id)
    const itemId = item.pk || item._id;
    if (!itemId) {
      this.myCartService.showMessage('Invalid item');
      return;
    }
    if (this.myCartService.itemExistsInCart(itemId)) {
      this.myCartService.showMessage('Item already in cart');
      return;
    }
    // Normalize item for cart (ensure productName and productRent are set)
    const normalizedItem = {
      ...item,
      pk: item.pk || item._id,
      productName: item.productName || item.name,
      productRent: item.productRent || item.Rent,
      display_img_urls: item.display_img_urls || (item.images ? item.images.map((img: any) => img.url) : []),
    };
    this.myCartService.addToCart(normalizedItem);
    this.myCartService.removeFromFavorites(normalizedItem);
    // No need to manually update cartItems/favoriteItems, as subscriptions will update them
  }

  generateSuggestions(): void {
    // Improved: Exclude both cart and favorite items, rank by category frequency
    const cartCategories = this.cartItems.map((item) => item.category);
    const favoriteCategories = this.favoriteItems.map((item) => item.category);
    const allCategories = [...cartCategories, ...favoriteCategories];
    const categoryFrequency: { [key: string]: number } = {};
    allCategories.forEach((cat) => {
      if (cat) categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
    });

    // Collect all product IDs to exclude (cart + favorites)
    const excludeIds = new Set([
      ...this.cartItems.map((item) => item.pk || item._id),
      ...this.favoriteItems.map((item) => item.pk || item._id),
    ]);

    this.dataService.getAllProductData().subscribe((products) => {
      // Exclude products already in cart or favorites
      let filtered = products.filter((product: any) => !excludeIds.has(product._id));

      // If there are relevant categories, rank by frequency
      if (Object.keys(categoryFrequency).length > 0) {
        filtered = filtered
          .map((product: any) => ({
            ...product,
            _score: categoryFrequency[product.category] || 0,
          }))
          .filter((product: any) => product._score > 0)
          .sort((a: any, b: any) => b._score - a._score);
      } else {
        // If no related categories, shuffle and pick top 5
        filtered = filtered.sort(() => Math.random() - 0.5);
      }

      // Limit to top 5 suggestions
      this.suggestedProducts = filtered.slice(0, 5).map((product: any) => ({
        ...product,
        display_img_urls: product.images.map((img: any) => img.url),
      }));
    });
  }

  nextSuggestion(): void {
    if (!this.suggestedProducts || this.suggestedProducts.length === 0) return;
    const suggestionDetails = document.querySelector('.suggestion-details');
    if (suggestionDetails) {
      suggestionDetails.classList.add('hidden');
      setTimeout(() => {
        this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % this.suggestedProducts.length;
        suggestionDetails.classList.remove('hidden');
      }, 500);
    } else {
      this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % this.suggestedProducts.length;
    }
  }

  prevSuggestion(): void {
    if (!this.suggestedProducts || this.suggestedProducts.length === 0) return;
    const suggestionDetails = document.querySelector('.suggestion-details');
    if (suggestionDetails) {
      suggestionDetails.classList.add('hidden');
      setTimeout(() => {
        this.currentSuggestionIndex = (this.currentSuggestionIndex - 1 + this.suggestedProducts.length) % this.suggestedProducts.length;
        suggestionDetails.classList.remove('hidden');
      }, 500);
    } else {
      this.currentSuggestionIndex = (this.currentSuggestionIndex - 1 + this.suggestedProducts.length) % this.suggestedProducts.length;
    }
  }

  pauseAutoSlider(): void {
    if (this.sliderSubscription) {
      this.sliderSubscription.unsubscribe();
      this.sliderSubscription = undefined as any;
    }
  }

  resumeAutoSlider(): void {
    if (!this.sliderSubscription) {
      this.startAutoSlider();
    }
  }

  startAutoSlider(): void {
    this.sliderSubscription = interval(3000).subscribe(() => {
      const suggestionDetails = document.querySelector('.suggestion-details');
      if (suggestionDetails) {
        suggestionDetails.classList.add('hidden'); // Add hidden class to start transition
        setTimeout(() => {
          this.nextSuggestion(); // Change the suggestion after the transition
          suggestionDetails.classList.remove('hidden'); // Remove hidden class to reveal new content
        }, 500); // Match the duration of the CSS transition
      }
    });
  }
}
