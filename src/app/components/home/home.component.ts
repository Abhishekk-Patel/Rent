import { environment } from '../../../environments/environment';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

declare let google: any;

type Stage = 'choose' | 'rent';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleBtn', { static: false }) googleBtn?: ElementRef<HTMLElement>;

  authTabIndex = 0;
  stage: Stage = 'choose';

  loginForm!: FormGroup;
  signUpForm!: FormGroup;

  isLoggedIn = false;
  isLoading = false;

  hidePassword = true;
  hideConfirmPassword = true;

  loginError = '';
  signUpError = '';

  user: SocialUser | null = null;
  loggedIn = false;
  googleProviderId = GoogleLoginProvider.PROVIDER_ID;

  private googleRendered = false;
  private sub = new Subscription();

  private googleClientId =
    '204670204818-b33g0rdegov9g9tae1j5c30ikdumi2hr.apps.googleusercontent.com';

  // OTP STATE
  otpSent = false;
  otpVerified = false;
  otpLoading = false;
  otpError = '';
  resendCooldown = 0;
  private resendTimer?: ReturnType<typeof setInterval>;

  constructor(
    public router: Router,
    public myCartSercvice: MyCartServiceService,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: SocialAuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.signUpForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
          ],
        ],
        mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        otp: ['', [Validators.pattern(/^[0-9]{4,8}$/)]],
      },
      { validators: [this.passwordMatchValidator] }
    );

    // lowercase login email
    this.sub.add(
      this.loginForm.get('email')?.valueChanges.subscribe((value) => {
        if (value && value !== value.toLowerCase()) {
          this.loginForm.get('email')?.setValue(value.toLowerCase(), { emitEvent: false });
        }
      }) || new Subscription()
    );

    // lowercase signup email + reset OTP on change
    this.sub.add(
      this.signUpForm.get('email')?.valueChanges.subscribe((value) => {
        if (value && value !== value.toLowerCase()) {
          this.signUpForm.get('email')?.setValue(value.toLowerCase(), { emitEvent: false });
        }
        this.resetOtpState(); // any email change invalidates OTP
      }) || new Subscription()
    );

    this.sub.add(
      this.authService.authState.subscribe((user) => {
        this.user = user;
        this.loggedIn = !!user;
      })
    );
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.tryRenderGoogleButton());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  onAuthTabChange(index: number): void {
    this.authTabIndex = index;
    if (this.authTabIndex === 0) queueMicrotask(() => this.tryRenderGoogleButton(true));
    this.loginError = '';
    this.signUpError = '';
  }

  private tryRenderGoogleButton(force = false): void {
    if (this.authTabIndex !== 0) return;
    if (!this.googleBtn?.nativeElement) return;

    if (force) {
      this.googleBtn.nativeElement.innerHTML = '';
      this.googleRendered = false;
    }
    if (this.googleRendered) return;

    if (typeof google === 'undefined' || !google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
    });

    google.accounts.id.prompt();
    this.googleRendered = true;
  }

  // =========================
  // OTP Helpers
  // =========================
  private getSignupEmail(ctrl: AbstractControl | null): string {
    return (ctrl?.value || '').toString().trim().toLowerCase();
  }

  resetOtpState(): void {
    // re-enable in case previously verified
    this.signUpForm.get('email')?.enable({ emitEvent: false });
    this.signUpForm.get('otp')?.enable({ emitEvent: false });

    this.otpSent = false;
    this.otpVerified = false;
    this.otpError = '';
    this.signUpForm.get('otp')?.setValue('', { emitEvent: false });
    this.signUpForm.get('otp')?.markAsUntouched();
  }

  sendOtp(): void {
    const emailCtrl = this.signUpForm.get('email');
    const email = this.getSignupEmail(emailCtrl);

    if (!emailCtrl || emailCtrl.invalid) {
      emailCtrl?.markAsTouched();
      return;
    }

    this.otpLoading = true;
    this.otpError = '';

    // IMPORTANT: make sure your service points to correct route (with /api or /user prefix if needed)
    this.userService.sendSignupOtpToVerifyNewuserEmail(email).subscribe({
      next: () => {
        this.otpLoading = false;
        this.otpSent = true;
        this.otpVerified = false;
        this.startResendCooldown(30);
      },
      error: (err: any) => {
        this.otpLoading = false;
        this.otpError = err?.error?.message || err?.error?.error || 'Failed to send OTP. Try again.';
      },
    });
  }

  verifyOtp(): void {
    const email = this.getSignupEmail(this.signUpForm.get('email'));
    const otpCtrl = this.signUpForm.get('otp');
    const otp = (otpCtrl?.value || '').toString().trim();

    if (!this.otpSent) {
      this.otpError = 'Please send OTP first.';
      return;
    }

    if (!otp || otpCtrl?.invalid) {
      otpCtrl?.markAsTouched();
      this.otpError = 'Enter a valid OTP.';
      return;
    }

    this.otpLoading = true;
    this.otpError = '';

    this.userService.verifySignupOtpToVerifyNewuserEmail(email, otp).subscribe({
      next: () => {
        this.otpLoading = false;
        this.otpVerified = true;

        // ✅ lock fields + hide verify UI
        this.signUpForm.get('email')?.disable({ emitEvent: false });
        this.signUpForm.get('otp')?.disable({ emitEvent: false });

        this.otpSent = false;
        this.otpError = '';
      },
      error: (err: any) => {
        this.otpLoading = false;
        this.otpVerified = false;
        this.otpError = err?.error?.message || err?.error?.error || 'Invalid OTP.';
      },
    });
  }

  private startResendCooldown(seconds: number): void {
    this.resendCooldown = seconds;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
        this.resendCooldown = 0;
      }
    }, 1000);
  }

  // Password match validator
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword');

    if (!confirm) return null;

    if (password !== confirm.value) {
      const existing = confirm.errors || {};
      confirm.setErrors({ ...existing, mustMatch: true });
      return { mustMatch: true };
    } else {
      const errors = confirm.errors;
      if (errors && errors['mustMatch']) {
        delete errors['mustMatch'];
        confirm.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }
  get signUpFormControl() {
    return this.signUpForm.controls;
  }

  // Navigation
  navigateTo(user: string): void {
    this.myCartSercvice.setUser(user);
    this.router.navigate(['/content']);
  }

  navigateToRent(): void {
    this.stage = 'rent';
  }

  navigateToSell(): void {
    this.router.navigate(['/add-product']);
  }

  goBack(): void {
    this.stage = 'choose';
  }

  // Login
  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    this.userService.login(this.loginForm).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response === true) {
          this.user = this.userService.getUserDetails?.() ?? null;
          this.isLoggedIn = true;
          this.stage = 'choose';
          return;
        }

        if (response?.error) {
          this.loginError = response.error;
          return;
        }

        this.loginError = 'Login failed. Please check your credentials.';
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err?.error?.error || 'Login failed. Please try again later.';
      },
    });
  }

  // Signup
  signUp(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    if (!this.otpVerified) {
      this.signUpError = 'Please verify your email using OTP before creating account.';
      return;
    }

    this.isLoading = true;
    this.signUpError = '';

    // ✅ IMPORTANT: use getRawValue so disabled email is included
    const payload = this.signUpForm.getRawValue();

    this.userService.signUp(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response === true) {
          this.isLoggedIn = true;
          this.stage = 'rent';
          return;
        }

        if (response?.error) {
          this.signUpError = response.error;
          if (response?.details?.includes('duplicate key')) {
            this.signUpError += ': Email already exists.';
          }
          return;
        }

        this.signUpError = 'Sign up failed. Please check your details.';
      },
      error: (err) => {
        this.isLoading = false;
        this.signUpError = err?.error?.error || 'Sign up failed. Please try again later.';
        if (err?.error?.details?.includes('duplicate key')) {
          this.signUpError += ': Email already exists.';
        }
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private handleCredentialResponse(response: any): void {
    this.isLoading = true;
    this.loginError = '';

    this.http
      .post(environment.apiBaseUrl + '/auth/google/token', { token: response.credential })
      .subscribe({
        next: (backendResponse: any) => {
          const loginSuccess = this.userService.loginWithGoogleBackendResponse?.(backendResponse);

          this.isLoading = false;
          if (loginSuccess) {
            this.user = this.userService.getUserDetails?.() ?? null;
            this.isLoggedIn = true;
            this.stage = 'choose';
          } else {
            this.loginError = 'Google login failed.';
          }
        },
        error: () => {
          this.isLoading = false;
          this.loginError = 'Google login failed';
        },
      });
  }
}
