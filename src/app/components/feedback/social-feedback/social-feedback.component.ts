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
          this.startAutoSlide();
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
  startAutoSlide() {
    this.stopAutoSlide();
    this.timer = setInterval(() => this.next(), 3500);
  }

  stopAutoSlide() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  next() {
    if (!this.items.length || this.isMobile) return;
    this.activeIndex = (this.activeIndex + 1) % this.items.length;
    this.scrollToActive();
  }

  prev() {
    if (!this.items.length || this.isMobile) return;
    this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
    this.scrollToActive();
    this.startAutoSlide(); // reset timer
  }

  goTo(index: number) {
    if (this.isMobile) return;
    this.activeIndex = index;
    this.scrollToActive();
    this.startAutoSlide(); // reset timer
  }

  // Pause on hover (desktop only)
  pause() {
    if (!this.isMobile) this.stopAutoSlide();
  }

  resume() {
    if (!this.isMobile && this.items.length > 1) this.startAutoSlide();
  }

  private scrollToActive() {
    const track = this.trackRef?.nativeElement;
    if (!track) return;

    const card = track.children.item(this.activeIndex) as HTMLElement | null;
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
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
