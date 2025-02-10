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

  sortUserHistory() {
    this.userHistory = [...this.userHistory].sort((a, b) => {
      return (
        new Date(b.productListedDate).getTime() -
        new Date(a.productListedDate).getTime()
      );
    });
    console.log(this.userHistory, 'sorted user history'); // Optional: Log sorted user history
  }

  editHistoryItem(item: any) {
    // Navigate to the edit page with the item details
    // this.router.navigate(['/edit-product', item.pk]);
  }

  deleteHistoryItem(item: any) {
    console.log('Deleting item:', item._id
    );
    // Remove the item from the user history
    this.userHistory = this.userHistory.filter(
      (historyItem) => historyItem._id !== item._id
    );
   // Optionally, call a service to delete the item from the backend
    this.dataService.deleteProductById(item._id).subscribe(
      () => {
        console.log('Item deleted successfully');
      },
      (error:Error) => {
        console.error('Error deleting item:', error);
      }
    );
  }
}
