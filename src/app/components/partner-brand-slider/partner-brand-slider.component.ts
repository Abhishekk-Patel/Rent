import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-partner-brand-slider',
  templateUrl: './partner-brand-slider.component.html',
  styleUrls: ['./partner-brand-slider.component.css'],
})
export class PartnerBrandSliderComponent implements OnInit, OnDestroy {

  brands = [
    { name: 'Brannd10', imageUrl: './assets/CTALow2.png' },
  ];

  currentIndex = 0;
  isMobileView = false;

  private breakpointSub?: Subscription;
  private sliderIntervalId?: any;

  constructor(
    public readonly router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    // ✅ Reliable breakpoint check (instead of Handset/Tablet which can miss matches)
    this.breakpointSub = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(state => {
        this.isMobileView = state.matches;

        // Debug (remove if you want)
        console.log('isMobileView:', this.isMobileView, 'width:', window.innerWidth);
      });
  }

  ngOnInit(): void {
    // Auto-slide every 5 seconds
    this.sliderIntervalId = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy(): void {
    // ✅ Prevent memory leaks
    if (this.breakpointSub) this.breakpointSub.unsubscribe();
    if (this.sliderIntervalId) clearInterval(this.sliderIntervalId);
  }

  scrollToCatalog(): void {
    setTimeout(() => {
      const catalogEl = document.querySelector('.catalog');
      if (catalogEl) {
        (catalogEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.brands.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.brands.length) % this.brands.length;
  }

  addNewProduct(): void {
    this.router.navigate(['/add-product']);
  }

  scrollToContent(): void {
    const contentSection = document.querySelector('.catalog');
    if (contentSection) {
      (contentSection as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  }
}
