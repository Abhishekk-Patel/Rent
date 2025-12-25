
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from './service/user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RentiT';
  isLoggedIn = false;

  /** Controls header visibility (hidden on home route '/') */
  showHeaderFooter = true;

  /** True when device is handset/mobile */
  isMobileScreen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    // Detect mobile screens (Handset)
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobileScreen = result.matches;
      });

    // Track login status
    this.userService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      });

    // Hide header on home route only, and use a type predicate to narrow to NavigationEnd
    this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.showHeaderFooter = event.urlAfterRedirects !== '/';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Optional: viewport-based helper if you want to use strictly width checks
  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  // Optional: manual check method (not needed when using BreakpointObserver)
  checkMobileView() {
    this.isMobileScreen = this.isMobile();
  }
}
