import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  countryCode: string = '';
  constructor(public cartService: MyCartServiceService,public readonly router: Router) {}

  ngOnInit() {
    this.openLanguageDialog();
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  openMyCard() {
    this.cartService.openCart();
  }

  openLanguageDialog(): void {

    // Logic to open the language dialog
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        .then(response => response.json())
        .then(data => {
           this.countryCode = data.countryCode;
          // Logic to open the language dialog with the country code
          console.log(`Country Code: ${this.countryCode}`);
          // You can now use the countryCode to set the language or open a dialog
        })
        .catch(error => {
          console.error('Error fetching location data:', error);
        });
    }, (error) => {
      console.error('Error getting geolocation:', error);
    });

  }
}
