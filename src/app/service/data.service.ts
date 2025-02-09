import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getDataByEmail(Email: string) {
    const url = `http://localhost:3000/upload/products/${Email}`;

    return this.http.get(url).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          return null; // Or any fallback value you want
        }
      })
    );
  }
}
