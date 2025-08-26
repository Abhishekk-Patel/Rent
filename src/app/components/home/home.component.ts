import { environment } from '../../../environments/environment';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';

declare let google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  showRentOptions: boolean = false;
  showLogin: boolean = true;
  showSignUp: boolean = false;
  loginForm!: FormGroup;
  signUpForm!: FormGroup;
  isLoggedIn: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  loginError: string = '';
  signUpError: string = '';

   user: SocialUser | null = null;
  loggedIn: boolean = false;
  googleProviderId = GoogleLoginProvider.PROVIDER_ID;

  constructor(
    public router: Router,
    public myCartSercvice: MyCartServiceService,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: SocialAuthService,
    private http: HttpClient,

  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = !!user;
    });
  }

  // ngAfterViewInit handled below, only one implementation needed

  ngAfterViewChecked(): void {
    if (this.showLogin) {
      this.renderGoogleButton();
    }
  }

  renderGoogleButton(): void {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      const buttonDiv = document.getElementById('buttonDiv');
      if (buttonDiv && buttonDiv.childElementCount === 0) {
        google.accounts.id.initialize({
          client_id: '204670204818-b33g0rdegov9g9tae1j5c30ikdumi2hr.apps.googleusercontent.com',
          callback: (response: any) => this.handleCredentialResponse(response)
        });
        google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            text: 'signin_with'
          }
        );
        google.accounts.id.prompt();
      }
    }
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
    } else {
      if (confirmPassword) {
        confirmPassword.setErrors(null);
      }
    }
  }

  navigateTo(user: string) {
    this.myCartSercvice.setUser(user);
    this.router.navigate(['/content']);
  }

  navigateToRent() {
    this.showRentOptions = true;
  }

  navigateToSell() {
    this.router.navigate(['/add-product']);
  }

  goBack() {
    this.showRentOptions = false;
  }

  toggleLogin() {
    this.showLogin = !this.showLogin;
    this.showSignUp = false;
    setTimeout(() => this.renderGoogleButton(), 0);
  }

  toggleSignUp() {
    this.showSignUp = !this.showSignUp;
    this.showLogin = false;
  }

  login() {
    this.isLoading = true;
    this.loginError = '';
    this.userService.login(this.loginForm).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response === true) {
          this.user = this.userService.getUserDetails();
          this.loginError = '';
          this.isLoggedIn = true;
          this.showLogin = false;
          this.loggedIn = true;
        } else if (response && response.error) {
          this.loginError = response.error;
        } else {
          this.loginError = 'Login failed. Please check your credentials.';
        }
      },
      err => {
        this.isLoading = false;
        if (err && err.error && err.error.error) {
          this.loginError = err.error.error;
        } else {
          this.loginError = 'Login failed. Please try again later.';
        }
      }
    );
  }

  signUp() {
    this.isLoading = true;
    this.signUpError = '';
    this.userService.signUp(this.signUpForm).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response === true) {
          this.isLoggedIn = true;
          this.showSignUp = false;
          this.showRentOptions = true;
        } else if (response && response.error) {
          this.signUpError = response.error;
          if (response.details && response.details.includes('duplicate key')) {
            this.signUpError += ': Email already exists.';
          }
        } else {
          this.signUpError = 'Sign up failed. Please check your details.';
        }
      },
      err => {
        this.isLoading = false;
        if (err && err.error && err.error.error) {
          this.signUpError = err.error.error;
          if (err.error.details && err.error.details.includes('duplicate key')) {
            this.signUpError += ': Email already exists.';
          }
        } else {
          this.signUpError = 'Sign up failed. Please try again later.';
        }
      }
    );
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }

  get signUpFormControl() {
    return this.signUpForm.controls;
  }

  loginWithGoogle() {
    // Use the recommended Google sign-in button rendering
    // This will only work if the Google Identity Services script is loaded in index.html
    // and the button is rendered with google.accounts.id.renderButton()
    // For now, fallback to signInWithGoogle() method
    this.signInWithGoogle();
  }

  onGoogleSignIn(event: any) {
    // Handle Google sign-in success
    this.user = event;
    this.loggedIn = true;
    this.isLoggedIn = true;
    this.showLogin = false;
  }

  onGoogleSignInError(event: any) {
    // Handle Google sign-in error
    this.loginError = 'Google sign-in failed.';
  }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '204670204818-b33g0rdegov9g9tae1j5c30ikdumi2hr.apps.googleusercontent.com',
        callback: (response: any) => this.handleCredentialResponse(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with'
        }
      );
      google.accounts.id.prompt();
    }
  }

  handleCredentialResponse(response: any): void {
    console.log(response,'response login ')
    this.isLoading = true;
    // Send the token to your backend
    // https://rent-be.onrender.com/
    //'http://localhost:3000
    this.http.post(environment.apiBaseUrl + '/auth/google/token', { token: response.credential })
      .subscribe(
        (backendResponse: any) => {
          // Use UserService to handle Google login backend response
          const loginSuccess = this.userService.loginWithGoogleBackendResponse(backendResponse);
         
          this.isLoading = false;
          if (loginSuccess) {
            this.user = this.userService.getUserDetails();
            this.loginError = '';
            this.isLoggedIn = true;
            this.showLogin = false;
            this.loggedIn = true;
          }
        },
        (error) => {
          this.isLoading = false;
          this.loginError = 'Google login failed';
          console.error('Backend login error:', error);
        }
      );
  }
}
