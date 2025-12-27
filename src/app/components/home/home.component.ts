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
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
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

  // UI State
  authTabIndex = 0; // 0 = login, 1 = register
  stage: Stage = 'choose';

  // Forms
  loginForm!: FormGroup;
  signUpForm!: FormGroup;

  // Auth flags
  isLoggedIn = false;
  isLoading = false;

  // Password toggles
  hidePassword = true;
  hideConfirmPassword = true;

  // Errors
  loginError = '';
  signUpError = '';

  // Social
  user: SocialUser | null = null;
  loggedIn = false;
  googleProviderId = GoogleLoginProvider.PROVIDER_ID;

  private googleRendered = false;
  private sub = new Subscription();

  // Use environment or config for this ideally
  private googleClientId =
    '204670204818-b33g0rdegov9g9tae1j5c30ikdumi2hr.apps.googleusercontent.com';

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
        email: ['', [Validators.required, Validators.email]],
        mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.passwordMatchValidator] }
    );

    this.sub.add(
      this.authService.authState.subscribe((user) => {
        this.user = user;
        this.loggedIn = !!user;
      })
    );
  }

  ngAfterViewInit(): void {
    // Render google button initially if login tab is selected
    queueMicrotask(() => this.tryRenderGoogleButton());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onAuthTabChange(index: number): void {
    this.authTabIndex = index;
    // Google button is only on Login tab
    if (this.authTabIndex === 0) {
      queueMicrotask(() => this.tryRenderGoogleButton(true));
    }
    // Reset any errors when tab changes
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

  // Custom password match validator
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword');

    if (!confirm) return null;

    if (password !== confirm.value) {
      const existing = confirm.errors || {};
      confirm.setErrors({ ...existing, mustMatch: true });
      return { mustMatch: true };
    } else {
      // remove mustMatch error only
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

  // ---- Navigation ----
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

  // ---- Actions ----
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
          this.user = this.userService.getUserDetails();
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

  signUp(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.signUpError = '';

    this.userService.signUp(this.signUpForm).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response === true) {
          this.isLoggedIn = true;
          this.stage = 'rent'; // after signup show rent
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

  // ---- UI helpers ----
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // ---- Google Login (GIS -> backend) ----
  private handleCredentialResponse(response: any): void {
    this.isLoading = true;
    this.loginError = '';

    this.http
      .post(environment.apiBaseUrl + '/auth/google/token', { token: response.credential })
      .subscribe({
        next: (backendResponse: any) => {
          const loginSuccess = this.userService.loginWithGoogleBackendResponse(backendResponse);

          this.isLoading = false;
          if (loginSuccess) {
            this.user = this.userService.getUserDetails();
            this.isLoggedIn = true;
            this.stage = 'choose';
          } else {
            this.loginError = 'Google login failed.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = 'Google login failed';
          console.error('Backend login error:', error);
        },
      });
  }
}