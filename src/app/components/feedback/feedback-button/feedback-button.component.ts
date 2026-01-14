import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback-button',
  templateUrl: './feedback-button.component.html',
  styleUrls: ['./feedback-button.component.css']
})
export class FeedbackButtonComponent {
   isOpen = false;

  open() { this.isOpen = true; }
  close() { this.isOpen = false; }

}
