
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactPayload, ContactService } from 'src/app/service/contact.service';


@Component({
  selector: 'app-contact',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  loading = false;

  topics = [
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    topic: ['support', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
    preferred: ['email', Validators.required],
    agree: [false, Validators.requiredTrue]
  });

  constructor(
    private fb: FormBuilder,
    private contact: ContactService,
    private snack: MatSnackBar
  ) {}

  get f() { return this.form.controls; }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fix the errors highlighted in the form.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const payload = this.form.value as ContactPayload;

    this.contact.submit(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.ok) {
          this.snack.open('Thanks! We’ll get back to you shortly.', 'Close', { duration: 3000 });
          this.form.reset({ topic: 'support', preferred: 'email', agree: false });
        } else {
          this.snack.open('Something went wrong. Please try again.', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.loading = false;
        this.snack.open('Network error. Please try again later.', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
