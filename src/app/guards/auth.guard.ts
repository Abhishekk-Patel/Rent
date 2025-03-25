import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.checkAuthentication(); // Replace with actual authentication logic
    if (!isAuthenticated) {
      this.router.navigate(['/']); // Redirect to home if not authenticated
      return false;
    }
    return true;
  }

  private checkAuthentication(): boolean {
    // Implement your authentication check logic here
    return !!localStorage.getItem('authToken'); // Example: Check for a token in localStorage
  }
}
