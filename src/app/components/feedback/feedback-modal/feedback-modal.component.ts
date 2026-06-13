import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeedbackService, FeedbackType } from 'src/app/service/feedback-service.service';

type Step = 'TYPE' | 'FORM' | 'THANKS';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  step: Step = 'TYPE';
  loading = false;
  error = '';

  type: FeedbackType | null = null;
  rating = 5;
  message = '';
  allowPublic = false;
  displayName = '';

  constructor(private feedback: FeedbackService) {}

  close() {
    this.reset();
    this.closed.emit();
  }

  chooseType(t: FeedbackType) {
    this.type = t;
    this.step = 'FORM';
    this.error = '';
    // Bugs should never be public
    if (t === 'BUG') {
      this.allowPublic = false;
      this.displayName = '';
    }
  }

  back() {
    this.step = 'TYPE';
    this.type = null;
    this.error = '';
  }

  async submit() {
    if (!this.type) return;

    const trimmed = this.message.trim();
    if (trimmed.length < 5) {
      this.error = 'Please describe your feedback (min 5 characters).';
      return;
    }

    this.loading = true;
    this.error = '';

    this.feedback.create({
      type: this.type,
      message: trimmed,
      rating: this.type === 'RATING' ? this.rating : undefined,
      screen: this.getScreenName(),
      allowPublic: this.type === 'BUG' ? false : this.allowPublic,
      displayName: (this.type === 'BUG' || !this.allowPublic) ? '' : this.displayName.trim(),
      platform: 'web',
      userAgent: navigator.userAgent
    }).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'THANKS';
      },
      error: () => {
        this.loading = false;
        this.error = 'Something went wrong. Please try again.';
      }
    });
  }

  private getScreenName(): string {
    // simple default; later you can inject Router and use url
    return document.title || 'Unknown';
  }

  private reset() {
    this.step = 'TYPE';
    this.loading = false;
    this.error = '';
    this.type = null;
    this.rating = 5;
    this.message = '';
    this.allowPublic = false;
    this.displayName = '';
  }
}
