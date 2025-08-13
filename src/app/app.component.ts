import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'RentiT';
  isLoggedIn = false;
  showHeaderFooter = true;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header/footer on home route only
      this.showHeaderFooter = event.urlAfterRedirects !== '/';
    });
  }
}
