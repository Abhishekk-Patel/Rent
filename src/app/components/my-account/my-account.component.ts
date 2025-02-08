import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  user: any;
  userHistory: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.user = this.userService.getUserDetails();
    this.userHistory = this.userService.getUserHistory();
  }
}
