import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

type Step = 'email' | 'otp' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  
})
export class ForgotPasswordComponent {
  step: Step = 'email';
  isLoading = false;

  // UI state
  otpError = '';
  resetError = '';
  hidePass = true;
  hideConfirm = true;

  // Forms
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
  });

  resetForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: this.passwordMatchValidator }
  );

  constructor(private fb: FormBuilder) {}

  // --------- validators ----------
  private passwordMatchValidator(group: any) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p === c ? null : { passwordMismatch: true };
  }

  // --------- actions (API later) ----------
  sendOtp() {
    this.otpError = '';
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // TODO: call your API
    // this.userService.sendOtp(this.emailForm.value.email).subscribe(...)
    setTimeout(() => {
      this.isLoading = false;
      this.step = 'otp';
    }, 700);
  }

  verifyOtp() {
    this.otpError = '';
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // TODO: call your API
    setTimeout(() => {
      this.isLoading = false;

      // Demo: treat 0000 as invalid
      if (this.otpForm.value.otp === '0000') {
        this.otpError = 'Invalid OTP. Please try again.';
        return;
      }

      this.step = 'reset';
    }, 700);
  }

  resetPassword() {
    this.resetError = '';
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    if (this.resetForm.errors?.['passwordMismatch']) {
      this.resetError = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    // TODO: call your API
    setTimeout(() => {
      this.isLoading = false;
      this.step = 'done';
    }, 800);
  }

  resendOtp() {
    this.otpError = '';
    this.isLoading = true;

    // TODO: call API again
    setTimeout(() => {
      this.isLoading = false;
    }, 600);
  }

  back() {
    if (this.step === 'otp') this.step = 'email';
    else if (this.step === 'reset') this.step = 'otp';
  }

  // helper
  get email() {
    return this.emailForm.get('email');
  }
  get otp() {
    return this.otpForm.get('otp');
  }
  get password() {
    return this.resetForm.get('password');
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

}
