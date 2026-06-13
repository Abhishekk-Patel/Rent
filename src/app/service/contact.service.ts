
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  preferred: 'email' | 'phone';
  agree: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  // TODO: Replace with real HTTP call (HttpClient) to your API endpoint
  submit(payload: ContactPayload): Observable<{ ok: boolean }> {
    console.log('Contact payload:', payload);
    // simulate success
    return of({ ok: true });
  }
}
