import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Send OTP to user's email
  sendOtpToEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.url}/users/send-otp`, { email: email });
  }

  // Verify OTP for user's email
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.url}/users/verify-otp`, { email: email, otp: otp });
  }
  public user: any = null;
  private userHistory: any[] = [];
  public googleProfilePicture: string = '';

  private isLoggedInSubject = new BehaviorSubject<boolean>(!!this.getUserFromStorage());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Use localhost by default, switch to apiBaseUrl for production or as needed
  private baseUrl = environment.apiBaseUrl;
  // private baseUrl = environment.apiBaseUrl; // Uncomment to use hosted
  private loginApiUrl = this.baseUrl + '/users/login';
  signUpApiUrl = this.baseUrl + '/users/register';
  url = this.baseUrl;
  constructor(private http: HttpClient) {
    this.loadUserDetails();
    this.loadUserHistory(); // Fix: Load user history in the constructor
    this.isLoggedInSubject.next(!!this.user);
  }

  login(loginForm: FormGroup): Observable<boolean> {
    if (loginForm.valid) {
      return this.http.post<any>(this.loginApiUrl, loginForm.value).pipe(
        map((response) => {
          if (response && response.User) {
          localStorage.setItem('userToken', response.token);

            this.user = response.User;
            this.saveUserDetails();
            this.isLoggedInSubject.next(true);
            return true;
          }
          this.isLoggedInSubject.next(false);
          return false;
        })
      );
    }
    this.isLoggedInSubject.next(false);
    return new Observable((observer) => observer.next(false));
  }

  signUp(signUpForm: FormGroup): Observable<boolean> {
    if (signUpForm.valid) {
      return this.http.post<any>(this.signUpApiUrl, signUpForm.value).pipe(
        map((response) => {
          if (response && response.User) {
      localStorage.setItem('userToken',response.token);

            this.user = response.User;
            this.saveUserDetails();
            this.isLoggedInSubject.next(true);
            return true;
          }
          this.isLoggedInSubject.next(false);
          return false;
        })
      );
    }
    this.isLoggedInSubject.next(false);
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

   saveUserDetails(user?: any ) {
    localStorage.setItem('userDetails', JSON.stringify(user || this.user));
  }

  editUser(userId: string, userData: any) {
    return this.http.put(`${this.url}/users/edit/${userId}`, userData);
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
    this.isLoggedInSubject.next(true);
  }

  /**
   * Handle Google login backend response
   */
  loginWithGoogleBackendResponse(backendResponse: any): boolean {
    if (backendResponse && backendResponse.user) {
      localStorage.setItem('userDetails', JSON.stringify(backendResponse.user));
      localStorage.setItem('userToken', backendResponse.token);
      this.handleLoginSuccess(backendResponse.user);
      return true;
    }
    return false;
  }

  private getUserFromStorage() {
    const user = localStorage.getItem('userDetails');
    return user ? JSON.parse(user) : null;
  }
}
