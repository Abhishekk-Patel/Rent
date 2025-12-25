
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllProductData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      catchError((error) => {
        console.error('Error fetching product data:', error);
        return of([]);
      })
    );
  }

  getDataByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/${email}`);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/products/${id}`);
  }

  deleteProductById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/${id}`);
  }

  editProduct(id: string, productData: any) {
    return this.http.put(`${this.apiUrl}/products/${id}`, productData);
  }
}
