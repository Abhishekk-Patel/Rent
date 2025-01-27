import { Component, inject, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alert-msgs',
  templateUrl: './alert-msgs.component.html',
  styleUrls: ['./alert-msgs.component.css']
})
export class AlertMsgsComponent implements OnInit {
  private readonly _snackBar = inject(MatSnackBar);

@Input() message: string = '';
  ngOnInit(): void {
    this.openSnackBar(this.message);
    
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'close', { duration: 2000 });
  }

}
