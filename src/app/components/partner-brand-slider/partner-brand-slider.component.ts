import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
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
    { name: 'Brannd10', imageUrl: './assets/gpt.png' },
    { name: 'Brand2', imageUrl: './assets/hero_section_img.png' },
    { name: 'Brand3', imageUrl: './assets/hero_section_bg.png' },


  ];

  @Output() howItWorksClick = new EventEmitter<void>();

  currentIndex = 0;
  isMobileView = false;

  private breakpointSub?: Subscription;
  private sliderIntervalId?: ReturnType<typeof setInterval>;
  private paused = false;

  constructor(
    public readonly router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointSub = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state) => (this.isMobileView = state.matches));
  }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
    this.stopAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.sliderIntervalId = setInterval(() => {
      if (!this.paused) this.nextSlide();
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.sliderIntervalId) clearInterval(this.sliderIntervalId);
  }

  pauseSlider(): void {
    this.paused = true;
  }

  resumeSlider(): void {
    this.paused = false;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.brands.length;
  }

  prevSlide(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.brands.length) % this.brands.length;
  }

  scrollToCatalog(): void {
    setTimeout(() => {
      document.querySelector('.catalog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  addNewProduct(): void {
    this.router.navigate(['/add-product']);
  }
}
