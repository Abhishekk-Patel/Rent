// src/app/service/ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AiResponse {
  intro: string;
  points: string[];
  followup: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ask(prompt: string): Observable<AiResponse> {
    console.log(prompt, 'promt');
    return this.http.post<AiResponse>(`${this.baseUrl}/api/ai/ask`, { prompt });
  }

  searchAiProdcuts(prompt: string): Observable<AiResponse> {
    console.log(prompt, 'promt');
    return this.http.post<AiResponse>(`${this.baseUrl}/api/ai/search-products`, { prompt });
  }
}
