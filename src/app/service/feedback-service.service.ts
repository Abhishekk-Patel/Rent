import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export type FeedbackType = 'BUG' | 'UX' | 'SUGGESTION' | 'RATING';

export interface FeedbackServiceService {
  type: FeedbackType;
  message: string;
  rating?: number;       // 1-5
  screen?: string;       // "Home", "Explore", etc.
  allowPublic?: boolean; // show publicly (only for non-bug)
  displayName?: string;  // optional
  city?: string;         // optional
  appVersion?: string;   // optional
  platform?: string;     // "web"
  device?: string;       // optional
  userAgent?: string;    // optional
  userId?: string;       // optional if you have auth
}


export interface CreateFeedbackResponse {
  ok: boolean;
  id: string;
}

export interface PublicFeedbackItem {
  _id?: string;
  displayName?: string;
  city?: string;
  rating?: number;
  message: string;
  createdAt: string;
}

export interface PublicFeedbackResponse {
  items: PublicFeedbackItem[];
}
export interface AdminFeedbackItem {
  _id: string;
  type: FeedbackType;
  rating?: number;
  message: string;
  screen?: string;
  allowPublic?: boolean;
  displayName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  platform?: string;
  appVersion?: string;
  userAgent?: string;
}
export interface AdminFeedbackResponse {
  items: AdminFeedbackItem[];
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private base = `${environment.apiBaseUrl}/api/feedback`;
  

  constructor(private http: HttpClient) {}

  create(payload: FeedbackServiceService): Observable<CreateFeedbackResponse> {
    return this.http.post<CreateFeedbackResponse>(`${this.base}`, payload);
  }

  getPublic(limit: number = 10): Observable<PublicFeedbackResponse> {
    return this.http.get<PublicFeedbackResponse>(`${this.base}/public?limit=${limit}`);
  }
  getAdmin(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const q = status ? `?status=${status}` : '';
  return this.http.get<AdminFeedbackResponse>(`${this.base}/admin${q}`);
}

setStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', adminNote: string = '') {
  return this.http.patch<{ ok: boolean }>(`${this.base}/admin/${id}/status`, { status, adminNote });
}

setPublic(id: string, allowPublic: boolean, displayName: string = '') {
  return this.http.patch<{ ok: boolean }>(`${this.base}/admin/${id}/public`, { allowPublic, displayName });
}
}
