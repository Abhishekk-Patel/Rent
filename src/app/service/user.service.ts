import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: any = null;
  private userHistory: any[] = [];

  constructor() { }

  login(loginForm: FormGroup): boolean {
    if (loginForm.valid) {
      // Implement login logic here
      console.log(loginForm.value);
      this.user = {
        username: loginForm.value.username,
        email: 'user@example.com', // Replace with actual email
        mobileNumber: '1234567890' // Replace with actual mobile number
      };
      return true;
    }
    return false;
  }

  signUp(signUpForm: FormGroup): boolean {
    if (signUpForm.valid) {
      // Implement sign-up logic here
      console.log(signUpForm.value);
      this.user = {
        username: signUpForm.value.username,
        email: signUpForm.value.email,
        mobileNumber: signUpForm.value.mobileNumber
      };
      return true;
    }
    return false;
  }

  getUserDetails() {
    return this.user;
  }

  getUserHistory() {
    return this.userHistory;
  }

  addUserHistory(item: any) {
    this.userHistory.push(item);
  }
}
