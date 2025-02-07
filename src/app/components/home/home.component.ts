import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

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

  constructor(
    public router: Router,
    public myCartSercvice: MyCartServiceService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
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
    if (this.loginForm.valid) {
      // Implement login logic here
      console.log(this.loginForm.value);
      this.isLoggedIn = true;
      this.showLogin = false;
    }
  }

  signUp() {
    console.log(this.signUpForm.value,'test');
    if (this.signUpForm.valid) {
      // Implement sign-up logic here
      console.log(this.signUpForm.value);
      this.isLoggedIn = true;
      this.showSignUp = false;
      this.showRentOptions = true;
    }
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
}
