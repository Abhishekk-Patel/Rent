import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  constructor(
    public router: Router,
    public myCartSercvice: MyCartServiceService,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Updated to use email
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
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
          this.isLoggedIn = true;
          this.showLogin = false;
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
    // TODO: Implement Google login logic here
    window.alert('Google login is not yet implemented.');
  }
}
