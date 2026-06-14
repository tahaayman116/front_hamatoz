import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';

export interface CustomerRequest {
  id: number;
  listingId: number;
  customerUserId: number;
  status: string;
  message?: string;
  adminMessage?: string;
  createdAtUtc: string;
}

@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  private requests = signal<CustomerRequest[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  /**
   * Create a new request
   */
  createRequest(data: { listingId: number; message?: string }): Observable<CustomerRequest> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.post<any>(API_CONFIG.endpoints.requests.create, data).subscribe({
        next: (response: any) => {
          const request = response.data || response;
          this.requests.update((requests) => [...requests, request]);
          this.error.set(null);
          this.loading.set(false);
          observer.next(request);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Get my requests
   */
  getMyRequests(): Observable<CustomerRequest[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.requests.mine).subscribe({
        next: (response: any) => {
          const requestsArray = this.normalizeRequests(response);
          this.requests.set(requestsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(requestsArray);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Get all requests (admin)
   */
  getAllRequests(): Observable<CustomerRequest[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.requests.mine).subscribe({
        next: (response: any) => {
          const requestsArray = this.normalizeRequests(response);
          this.requests.set(requestsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(requestsArray);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Get signals
   */
  getRequests$() {
    return this.requests;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }

  private normalizeRequests(response: any): CustomerRequest[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.result)) return response.result;
    if (Array.isArray(response.$values)) return response.$values;
    if (Array.isArray(response.data?.$values)) return response.data.$values;
    if (Array.isArray(response.data?.items)) return response.data.items;
    if (Array.isArray(response.requests)) return response.requests;
    return [response.data || response];
  }
}
