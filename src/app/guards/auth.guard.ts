import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  // canActivate(): boolean {
  //   const isAuthenticated = this.checkAuthentication(); // Replace with actual authentication logic
  //   if (!isAuthenticated) {
  //     this.router.navigate(['/']); // Redirect to home if not authenticated
  //     return false;
  //   }
  //   return true;
  // }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  const token = this.checkAuthentication();

  if (!token) {
    this.router.navigate(['/']);
    return false;
  }
  return true;
}


  private checkAuthentication(): boolean {

    console.log(!!localStorage.getItem('userToken'),'local storage auth token');
    // Implement your authentication check logic here
    return !!localStorage.getItem('userToken'); // Example: Check for a token in localStorage
  }
}
