import { Component, OnInit } from '@angular/core';
import { AdminFeedbackItem, FeedbackService } from 'src/app/service/feedback-service.service';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

@Component({
  selector: 'app-feedback-dashboard',
  templateUrl: './feedback-dashboard.component.html',
  styleUrls: ['./feedback-dashboard.component.css']
})
export class FeedbackDashboardComponent implements OnInit {
  tab: Tab = 'PENDING';
  items: AdminFeedbackItem[] = [];
  loading = false;
  error = '';

  // inline edit buffers (simple)
  noteById: Record<string, string> = {};
  publicById: Record<string, boolean> = {};
  nameById: Record<string, string> = {};

  constructor(private feedback: FeedbackService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.feedback.getAdmin(this.tab).subscribe({
      next: (res) => {
        this.items = res.items || [];

        // init buffers
        this.noteById = {};
        this.publicById = {};
        this.nameById = {};
        for (const it of this.items) {
          this.noteById[it._id] = it.adminNote || '';
          this.publicById[it._id] = !!it.allowPublic;
          this.nameById[it._id] = it.displayName || '';
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load feedback.';
      }
    });
  }

  switchTab(t: Tab) {
    this.tab = t;
    this.load();
  }

  approve(it: AdminFeedbackItem) {
    this.feedback.setStatus(it._id, 'APPROVED', this.noteById[it._id] || '').subscribe({
      next: () => this.load(),
      error: () => alert('Failed to approve')
    });
  }

  reject(it: AdminFeedbackItem) {
    this.feedback.setStatus(it._id, 'REJECTED', this.noteById[it._id] || '').subscribe({
      next: () => this.load(),
      error: () => alert('Failed to reject')
    });
  }

  savePublic(it: AdminFeedbackItem) {
    // don’t allow BUG to be public
    const allow = it.type === 'BUG' ? false : !!this.publicById[it._id];
    const name = allow ? (this.nameById[it._id] || '') : '';

    this.feedback.setPublic(it._id, allow, name).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to update public settings')
    });
  }
}
