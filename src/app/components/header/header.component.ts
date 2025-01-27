import { Component } from '@angular/core';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  cartItemCount: number = 0;
  constructor(private readonly cartService: MyCartServiceService) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe((items: any[]) => {
      this.cartItemCount = items.length;
    });
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  openMyCard() {
    this.cartService.openCart();
  }
}
