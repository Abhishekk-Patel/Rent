import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  constructor(public router: Router,public myCartSercvice: MyCartServiceService  ){}
  navigateTo(user: string){
    this.myCartSercvice.setUser(user);
    this.router.navigate(['/content']);
  }
}
