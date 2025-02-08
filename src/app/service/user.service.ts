import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  login(loginForm: FormGroup): boolean {
    if (loginForm.valid) {
      // Implement login logic here
      console.log(loginForm.value);
      return true;
    }
    return false;
  }

  signUp(signUpForm: FormGroup): boolean {
    if (signUpForm.valid) {
      // Implement sign-up logic here
      console.log(signUpForm.value);
      return true;
    }
    return false;
  }
}
