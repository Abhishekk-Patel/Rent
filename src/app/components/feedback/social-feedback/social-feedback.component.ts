import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FeedbackService, PublicFeedbackItem } from 'src/app/service/feedback-service.service';

@Component({
  selector: 'app-social-feedback',
  templateUrl: './social-feedback.component.html',
  styleUrls: ['./social-feedback.component.css']
})
export class SocialFeedbackComponent implements OnInit, OnDestroy {
  items: PublicFeedbackItem[] = [];
  loading = true;
  error = '';

  isMobile = false;
  activeIndex = 0;
  avgRating = 0;

  // ✅ Feedback modal state
  showFeedbackModal = false;

  private timer: any;

  @ViewChild('track', { static: false })
  trackRef?: ElementRef<HTMLDivElement>;

  constructor(private feedback: FeedbackService) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;

    this.feedback.getPublic(10).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.loading = false;

        // Calculate average rating
        if (this.items.length > 0) {
          const totalRating = this.items.reduce((sum, item) => sum + (item.rating || 0), 0);
          this.avgRating = parseFloat((totalRating / this.items.length).toFixed(1));
        }

        // Start slideshow only on desktop
        if (!this.isMobile && this.items.length > 1) {
          setTimeout(() => this.startAutoSlide(), 0);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load feedback.';
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // ===== Slideshow controls =====
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.timer = setInterval(() => this.next(), 3500);
  }

  stopAutoSlide(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  next(): void {
    if (!this.items.length || this.isMobile) return;
    this.activeIndex = (this.activeIndex + 1) % this.items.length;
    this.scrollTrackToActive();
  }

  prev(): void {
    if (!this.items.length || this.isMobile) return;
    this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
    this.scrollTrackToActive();
    this.startAutoSlide(); // reset timer
  }

  goTo(index: number): void {
    if (this.isMobile) return;
    this.activeIndex = index;
    this.scrollTrackToActive();
    this.startAutoSlide(); // reset timer
  }

  // Pause on hover (desktop only)
  pause(): void {
    if (!this.isMobile) this.stopAutoSlide();
  }

  resume(): void {
    if (!this.isMobile && this.items.length > 1) this.startAutoSlide();
  }

  /**
   * ✅ FIX: never use card.scrollIntoView()
   * It scrolls the PAGE. We scroll only inside the horizontal track.
   */
  private scrollTrackToActive(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) return;

    const card = track.children.item(this.activeIndex) as HTMLElement | null;
    if (!card) return;

    const left = card.offsetLeft - track.offsetLeft;

    track.scrollTo({
      left,
      behavior: 'smooth'
    });
  }

  // ===== Feedback modal =====
  openFeedbackModal(): void {
    this.showFeedbackModal = true;
    this.stopAutoSlide();
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    // Reload testimonials after modal closes in case user submitted
    this.reloadTestimonials();
  }

  private reloadTestimonials(): void {
    this.feedback.getPublic(10).subscribe({
      next: (res) => {
        this.items = res.items || [];
        if (this.items.length > 0) {
          const totalRating = this.items.reduce((sum, item) => sum + (item.rating || 0), 0);
          this.avgRating = parseFloat((totalRating / this.items.length).toFixed(1));
        }
        if (!this.isMobile && this.items.length > 1) {
          this.startAutoSlide();
        }
      }
    });
  }

  // ===== UI helpers =====
  initials(name?: string): string {
    const n = (name || 'User').trim();
    return n.charAt(0).toUpperCase();
  }

  stars(rating?: number): number[] {
    const r = Math.max(0, Math.min(5, rating || 0));
    return Array.from({ length: r }, (_, i) => i);
  }
}
