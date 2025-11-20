import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-partner-brand-slider',
  templateUrl: './partner-brand-slider.component.html',
  styleUrls: ['./partner-brand-slider.component.css'],
})
export class PartnerBrandSliderComponent {


  scrollToCatalog(): void {
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) {
        (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  brands = [
    // { name: 'Brand 3', imageUrl: './assets/22.webp' },
    // { name: 'Brand 2', imageUrl: './assets/16.png' },
    // { name: 'Brand 1', imageUrl: './assets/20.webp' },

    // { name: 'Brand 4', imageUrl: './assets/23.webp' },
    // { name: 'Brand 5', imageUrl: './assets/24.webp' },
    // { name: 'Brand 6', imageUrl: './assets/25.webp' },
    // { name: 'Brand 7', imageUrl: './assets/26.webp' },
    // { name: 'Brand 8', imageUrl: './assets/27.webp' },
    // { name: 'Brand 9', imageUrl: './assets/28.webp' },

  {name:'Brannd10', imageUrl: './assets/CTALow2.png'},
  //{name:'Brannd10', imageUrl: './assets/CTA22.jpg'},


  ];

  currentIndex = 0;
  isMobileView = false;

  constructor(
      public readonly router: Router,
      private breakpointObserver: BreakpointObserver
    ) {
      this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result => {
        this.isMobileView = result.matches;
      });
    }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  ngOnInit() {
    setInterval(() => this.nextSlide(), 5000); // Auto-slide every 5 seconds
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.brands.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.brands.length) % this.brands.length;
  }
  addNewProduct() {
    this.router.navigate(['/add-product']);
  }

  scrollToContent() {
    const contentSection = document.querySelector('.catalog');
    if (contentSection) {
      (contentSection as HTMLElement).scrollIntoView({ behavior: 'smooth', });
    }
  }
}
