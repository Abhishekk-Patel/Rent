import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from './service/user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RentiT';
  isLoggedIn = false;


  /** Controls header/footer visibility */
  showHeaderFooter = true;

  /** True when device is handset/mobile */
  isMobileScreen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
   
  ) {}

  ngOnInit() {
    // Detect mobile screens (Handset)
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobileScreen = result.matches;
      });

    // Track login status
    this.userService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn;
      });

    // Hide header/footer on:
    // 1) Home route '/'
    // 2) Forgot password route '/forgot-password' (hash routing also supported)
    this.router.events
      .pipe(
        filter(
          (event: RouterEvent): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || '';

        const isHome = url === '/' || url === '/#/' || url === '/#';
       
        const isForgotPassword =
  url.includes('forgot-password');


        this.showHeaderFooter = !(isHome || isForgotPassword);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
