import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private searchValueSubject = new BehaviorSubject<string>('');
  searchValue$ = this.searchValueSubject.asObservable();

  setSearchValue(value: string) {
    this.searchValueSubject.next(value);
  }

  private userRoleSubject = new BehaviorSubject<string>('Bride');
  userRole$ = this.userRoleSubject.asObservable();

  private activeCategorySubject = new BehaviorSubject<string>('All');
  activeCategory$ = this.activeCategorySubject.asObservable();
  public user: any = null;
  private userHistory: any[] = [];
  public googleProfilePicture: string = '';

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    !!this.getUserFromStorage(),
  );
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private baseUrl = environment.apiBaseUrl;
  private loginApiUrl = this.baseUrl + '/users/login';
  signUpApiUrl = this.baseUrl + '/users/register';
  url = this.baseUrl;

  constructor(private http: HttpClient) {
    this.loadUserDetails();
    this.loadUserHistory();
    this.isLoggedInSubject.next(!!this.user);
  }

  login(loginForm: FormGroup): Observable<boolean> {
    if (loginForm.valid) {
      return this.http.post<any>(this.loginApiUrl, loginForm.value).pipe(
        map((response) => {
          if (response && response.User) {
            try {
              localStorage.setItem('userToken', response.token);
            } catch (e) {
              console.error('localStorage not available:', e);
            }
            this.user = response.User;
            this.saveUserDetails();
            this.isLoggedInSubject.next(true);
            return true;
          }
          this.isLoggedInSubject.next(false);
          return false;
        }),
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
            try {
              localStorage.setItem('userToken', response.token);
            } catch (e) {
              console.error('localStorage not available:', e);
            }
            this.user = response.User;
            this.saveUserDetails();
            this.isLoggedInSubject.next(true);
            return true;
          }
          this.isLoggedInSubject.next(false);
          return false;
        }),
      );
    }
    this.isLoggedInSubject.next(false);
    return new Observable((observer) => observer.next(false));
  }
  setActiveCategory(category: string) {
    this.activeCategorySubject.next(category);
  }

  setUserRole(role: string) {
    this.userRoleSubject.next(role);
  }

  // Send OTP to user's email
  sendOtpToEmail(email: string | any): Observable<any> {
    return this.http.post<any>(`${this.url}/users/send-otp`, { email });
  }

  // Verify OTP for user's email
  verifyOtp(email: string | any, otp: string | any): Observable<any> {
    return this.http.post<any>(`${this.url}/users/verify-otp`, { email, otp });
  }
  resetPassword(
    email: string | any,
    newPassword: string | any,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/reset-password`, {
      email,
      newPassword,
    });
  }


   // =========================
  // ✅ SIGNUP OTP (EMAIL VERIFY)
  // =========================
  sendSignupOtpToVerifyNewuserEmail(email: string | any, username?: string | any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/auth/signup/send-otp`, {
      email: (email || '').trim().toLowerCase(),
      username: username || '',
    });
  }

  verifySignupOtpToVerifyNewuserEmail(email: string | any, otp: string | any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/auth/signup/verify-otp`, {
      email: (email || '').trim().toLowerCase(),
      otp: (otp || '').trim(),
    });
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

  saveUserDetails(user?: any) {
    try {
      localStorage.setItem('userDetails', JSON.stringify(user || this.user));
    } catch (e) {
      console.error('localStorage not available:', e);
    }
  }

  editUser(userId: string, userData: any) {
    return this.http.put(`${this.url}/users/edit/${userId}`, userData);
  }

  private loadUserDetails() {
    try {
      const user = localStorage.getItem('userDetails');
      if (user) {
        this.user = JSON.parse(user);
      }
    } catch (e) {
      console.error('localStorage not available:', e);
    }
  }

  private saveUserHistory() {
    try {
      localStorage.setItem('userHistory', JSON.stringify(this.userHistory));
    } catch (e) {
      console.error('localStorage not available:', e);
    }
  }

  private loadUserHistory() {
    try {
      const history = localStorage.getItem('userHistory');
      if (history) {
        this.userHistory = JSON.parse(history);
      }
    } catch (e) {
      console.error('localStorage not available:', e);
    }
  }

  updateRating(
    productId: string,
    rating: number,
    userId: number,
  ): Observable<any> {
    const url = `${this.url}/productRating`;
    return this.http.post<any>(url, { productId, rating, userId });
  }

  handleLoginSuccess(user: any) {
    this.user = user;
    this.saveUserDetails();
    this.isLoggedInSubject.next(true);
  }

  loginWithGoogleBackendResponse(backendResponse: any): boolean {
    if (backendResponse && backendResponse.user) {
      try {
        localStorage.setItem('userDetails', JSON.stringify(backendResponse.user));
        localStorage.setItem('userToken', backendResponse.token);
      } catch (e) {
        console.error('localStorage not available:', e);
      }
      this.handleLoginSuccess(backendResponse.user);
      return true;
    }
    return false;
  }

  private getUserFromStorage() {
    try {
      const user = localStorage.getItem('userDetails');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('localStorage not available:', e);
      return null;
    }
  }
}
