import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000'; // Replace with your actual API URL

  // Use BehaviorSubject to cache data
  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  public products$: Observable<any[]> = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch all products data and store it in the BehaviorSubject
  getAllProductData(): void {
    if (this.productsSubject.value.length > 0) {
      // If data is already available, don't call the API again
      return;
    }

    this.http
      .get<any[]>(`${this.apiUrl}/products`)
      .pipe(
        tap((data) => {
          // Store the fetched data in the BehaviorSubject
          this.productsSubject.next(data);
        }),
        catchError((error) => {
          console.error('Error fetching product data', error);
          throw error;
        })
      )
      .subscribe();
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
