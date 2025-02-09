import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
})
export class MyAccountComponent implements OnInit {
  user: any;
  userHistory: any[] = [];

  constructor(
    private userService: UserService,
    public router: Router,
    public dataService: DataService
  ) {
    // Ensure user is logged in, otherwise redirect to home
    if (!this.userService.getUserDetails()) {
      this.router.navigate(['']);
    }
  }

  ngOnInit(): void {
    // Get user details when the component initializes
    this.user = this.userService.getUserDetails();
    console.log(this.user, 'user');

    // Check if the user is available and fetch user history
    if (this.user && this.user.email) {
      this.getUserHistoryByEmail(this.user.email);
    }
  }

  // Get user history by email
  getUserHistoryByEmail(email: string) {
    this.dataService.getDataByEmail(email).subscribe(
      (response) => {
        if (response && Array.isArray(response)) {
          this.userHistory = response;
        } else {
          this.userHistory = []; // If no history is returned, reset the array
        }
        console.log(this.userHistory, 'user history response'); // Optional: Log user history
      },
      (error) => {
        console.error('Error fetching user history:', error);
        this.userHistory = []; // Handle any errors and reset the history
      }
    );
  }
}
