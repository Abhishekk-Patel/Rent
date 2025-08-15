import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  countryCode: string = '';
  isAddNewProduct: boolean = false;
  orderSubscription!: Subscription;
  orderReceived = '';

  isOwner: Boolean = false;
  showMobileMenu: boolean = false; // Added for mobile menu toggle

  constructor(
    public userService: UserService,
    public cartService: MyCartServiceService,
    public readonly router: Router,
    public orderService: OrderService
  ) {}

  ngOnInit() {
    this.cartService.fetchCartItems();
    this.openLanguageDialog();
    this.cartService.isAddNewProduct$.subscribe((res) => {
      this.isAddNewProduct = res;
    });

    const user = this.userService.getUserDetails().email;

    // this.orderService.connectToSocket(user);

    // this.orderSubscription = this.orderService
    //   .receiveOrder()
    //   .subscribe((order) => {
    //     const productEmails = order.product.map(
    //       (res: any) => res.ProductOwnerEmail
    //     );

    //     // Check if the current user matches any product owner email
    //     if (productEmails.includes(user)) {
    //       this.isOwner = true;
    //       this.orderReceived = order.message; // Set the order message
    //     } else {
    //       this.isOwner = false; // Set to false if no match
    //       this.orderReceived = ''; // Optionally clear the orderReceived message
    //     }
    //   });
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  openMyCard() {
    this.cartService.openCart();
  }

  openLanguageDialog(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
          .then((response) => response.json())
          .then((data) => {
            this.countryCode = data.countryCode;
          })
          .catch((error) => {
            console.error('Error fetching location data:', error);
          });
      },
      (error) => {
        console.error('Error getting geolocation:', error);
      }
    );
  }

  openAddProductDialog() {
    this.router.navigate(['/add-product']);
  }

  ngOnDestroy(): void {
    // this.orderSubscription.unsubscribe();
  }
}
