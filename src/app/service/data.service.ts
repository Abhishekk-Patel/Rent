import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'https://rent-be.onrender.com'; // Web service URL
 // private apiUrl = 'http://localhost:3000'

  constructor(private http: HttpClient) {}

  // Fetch all products data
  getAllProductData(): Observable<any[]> {

    return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      catchError((error) => {
        console.error('Error fetching product data:', error); // Debug log
        return of([]);
      })
    );
  }

  // Get product data by email
  getDataByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/${email}`);
  }

  // Get product by ID
  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  // Delete product by ID
  deleteProductById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/${id}`);
  }
}
