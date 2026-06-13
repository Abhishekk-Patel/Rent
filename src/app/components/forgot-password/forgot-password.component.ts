import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';

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

  constructor(private fb: FormBuilder,private userService: UserService) {}

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
     this.userService.sendOtpToEmail(this.emailForm.value.email).subscribe(res=> console.log(res,"sent otp"))
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

  const email = (this.emailForm.value.email || '').toLowerCase().trim();
  const otp = (this.otpForm.value.otp || '').trim();

  this.userService.verifyOtp(email, otp).subscribe({
    next: (res) => {
      this.isLoading = false;

      // ✅ backend should return resetToken
      // if (!res?.resetToken) {
      //   this.otpError = 'OTP verified but reset session is invalid.';
      //   return;
      // }



      // move to reset password step
      this.step = 'reset';
    },
    error: (err) => {
      this.isLoading = false;
      this.otpError = err?.error?.error || 'Invalid or expired OTP';
    },
  });
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

  // if (!this.resetToken) {
  //   this.resetError = 'Reset session expired. Please request OTP again.';
  //   this.step = 'email';
  //   return;
  // }

  this.isLoading = true;

  const newPassword = this.resetForm.value.password!;

  this.userService.resetPassword(this.emailForm.value.email,newPassword).subscribe({
    next: () => {
      this.isLoading = false;
      this.step = 'done'; // ✅ only move on success
    },
    error: (err) => {
      this.isLoading = false;
      this.resetError = err?.error?.error || 'Failed to reset password';
    },
  });
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
