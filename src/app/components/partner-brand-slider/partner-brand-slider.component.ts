import { Component } from '@angular/core';

@Component({
  selector: 'app-partner-brand-slider',
  templateUrl: './partner-brand-slider.component.html',
  styleUrls: ['./partner-brand-slider.component.css']
})
export class PartnerBrandSliderComponent {

  brands = [
    { name: 'Brand 1', imageUrl: 'https://zariin.com/cdn/shop/files/Bridal_jewelry_banner_mobile.jpg?v=1680588337&width=3840' },
    { name: 'Brand 2', imageUrl: 'https://image-marketing.s3.ap-south-1.amazonaws.com/wp-content/uploads/2023/10/06122735/0.jpg' },
    { name: 'Brand 3', imageUrl: 'https://scontent.fknu1-4.fna.fbcdn.net/v/t39.30808-6/279437443_5139380052774131_5574484461183380972_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=FOeYa-4F3ocQ7kNvgGRY0MQ&_nc_oc=AdhTVXXJWFgwtMWFKAoGnge-KirH7At3tTEXSpCuAkv2ELTKPfntB4ZUqG8-xqD8MDcusArCz7XPrBinOqiBDIPf&_nc_zt=23&_nc_ht=scontent.fknu1-4.fna&_nc_gid=AAVoa5fiMwi8-ZHzPDhks13&oh=00_AYDwN5n4_uUhZRZpz_AdcR18FiMXvBs8ShpTZdbG1NdHnw&oe=67AFE9E3' },
    // Add more brands as needed
  ];

  currentIndex = 0;

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.brands.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.brands.length) % this.brands.length;
  }

  ngOnInit() {
    setInterval(() => this.nextSlide(), 5000); // Auto-slide every 3 seconds
  }

}
