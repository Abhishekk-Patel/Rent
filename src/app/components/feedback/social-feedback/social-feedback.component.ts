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

  // ✅ mobile "view all" state
  mobileExpanded = false;

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

  // ===== Mobile CTA actions =====
  openAllFeedback(): void {
    this.mobileExpanded = true;
    this.stopAutoSlide();
  }

  closeAllFeedback(): void {
    this.mobileExpanded = false;

    // optional: reset carousel index when going back
    this.activeIndex = 0;
    setTimeout(() => {
      // scroll carousel back to first card (only if track exists)
      const track = this.trackRef?.nativeElement;
      if (track) track.scrollTo({ left: 0, behavior: 'smooth' });
    }, 0);
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
