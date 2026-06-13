// src/app/components/ai/ai.component.ts
import { Component } from '@angular/core';
import { AiService, AiResponse } from 'src/app/service/ai.service';

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.css']
})
export class AIComponent {
  prompt = '';
  responseData: AiResponse | null = null;
  loading = false;
  error = '';

  constructor(private ai: AiService) {}

  submit() {
    if (!this.prompt.trim()) return;
    this.loading = true;
    this.error = '';
    this.responseData = null;

    this.ai.searchAiProdcuts(this.prompt.trim()).subscribe({
      next: (res) => {
        this.responseData = res;
        this.loading = false;
      },
      error: (err) => {
        // try to derive a friendly message
        const serverMsg = err?.error?.detail || err?.error?.error || err?.message;
        this.error = typeof serverMsg === 'string' ? serverMsg : 'Request failed. Try again.';
        this.loading = false;
      }
    });
  }

  clear() {
    this.prompt = '';
    this.responseData = null;
    this.error = '';
  }
}
