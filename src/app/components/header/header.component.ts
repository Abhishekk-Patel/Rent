import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  countryCode: string = '';
  isAddNewProduct: boolean = false;

  constructor(public cartService: MyCartServiceService, public readonly router: Router) {}

  ngOnInit() {
    this.openLanguageDialog();
    this.cartService.isAddNewProduct$.subscribe(res => {
      this.isAddNewProduct = res;
      console.log(res, "res");
    });
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  openMyCard() {
    this.cartService.openCart();
  }

  openLanguageDialog(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        .then(response => response.json())
        .then(data => {
          this.countryCode = data.countryCode;
          console.log(`Country Code: ${this.countryCode}`);
        })
        .catch(error => {
          console.error('Error fetching location data:', error);
        });
    }, (error) => {
      console.error('Error getting geolocation:', error);
    });
  }

  openAddProductDialog(){
    this.router.navigate(['/add-product']);
  }
}
