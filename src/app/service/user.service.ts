import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: any = null;
  private userHistory: any[] = [];

  private loginApiUrl = 'https://rent-be.onrender.com/users/login';
  //  private loginApiUrl = 'http://localhost:3000/users/login';    // local url
  private signUpApiUrl = 'https://rent-be.onrender.com/users/register';
  //       signUpApiUrl = 'http://localhost:3000/users/register';   // local url
  url = 'https://rent-be.onrender.com';
  constructor(private http: HttpClient) {
    this.loadUserDetails();
    this.loadUserHistory(); // Fix: Load user history in the constructor
  }

  login(loginForm: FormGroup): Observable<boolean> {
    if (loginForm.valid) {
      return this.http.post<any>(this.loginApiUrl, loginForm.value).pipe(
        map((response) => {
          if (response && response.User) {
            this.user = response.User;
            this.saveUserDetails();
            return true;
          }
          return false;
        })
      );
    }
    return new Observable((observer) => observer.next(false));
  }

  signUp(signUpForm: FormGroup): Observable<boolean> {
    if (signUpForm.valid) {
      return this.http.post<any>(this.signUpApiUrl, signUpForm.value).pipe(
        map((response) => {
          if (response && response.User) {
            this.user = response.User;
            this.saveUserDetails();
            return true;
          }
          return false;
        })
      );
    }
    return new Observable((observer) => observer.next(false));
  }

  getUserDetails() {
    return this.user;
  }

  getUserHistory() {
    return this.userHistory;
  }

  addUserHistory(item: any) {
    this.userHistory.push(item);
    this.saveUserHistory();
  }

  private saveUserDetails() {
    localStorage.setItem('userDetails', JSON.stringify(this.user));
  }

  private loadUserDetails() {
    const user = localStorage.getItem('userDetails');
    if (user) {
      this.user = JSON.parse(user);
    }
  }

  private saveUserHistory() {
    localStorage.setItem('userHistory', JSON.stringify(this.userHistory));
  }

  private loadUserHistory() {
    const history = localStorage.getItem('userHistory');
    if (history) {
      this.userHistory = JSON.parse(history);
    }
  }
  updateRating(
    productId: string,
    rating: number,
    userId: number
  ): Observable<any> {
    const url = `${this.url}/productRating`;
    return this.http.post<any>(url, { productId, rating, userId });
  }
  /**
   * Store user info after successful login (Google or email/password)
   */
  handleLoginSuccess(user: any) {
    this.user = user;
    this.saveUserDetails();
  }

  /**
   * Handle Google login backend response
   */
  loginWithGoogleBackendResponse(backendResponse: any): boolean {
    if (backendResponse && backendResponse.user) {
      this.handleLoginSuccess(backendResponse.user);
      return true;
    }
    return false;
  }
}
