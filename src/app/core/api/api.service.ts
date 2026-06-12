import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { API_CONFIG } from './api.config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = this.baseUrl + endpoint;
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http
      .get<T>(url, { params: httpParams })
      .pipe(timeout(API_CONFIG.timeout), catchError((error) => this.handleError(error)));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any): Observable<T> {
    const url = this.baseUrl + endpoint;
    return this.http
      .post<T>(url, body || {})
      .pipe(timeout(API_CONFIG.timeout), catchError((error) => this.handleError(error)));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any): Observable<T> {
    const url = this.baseUrl + endpoint;
    return this.http
      .put<T>(url, body || {})
      .pipe(timeout(API_CONFIG.timeout), catchError((error) => this.handleError(error)));
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: any): Observable<T> {
    const url = this.baseUrl + endpoint;
    return this.http
      .patch<T>(url, body || {})
      .pipe(timeout(API_CONFIG.timeout), catchError((error) => this.handleError(error)));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = this.baseUrl + endpoint;
    return this.http
      .delete<T>(url)
      .pipe(timeout(API_CONFIG.timeout), catchError((error) => this.handleError(error)));
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message ||
        error.error?.error ||
        `Server Error: ${error.status}`;
    }

    if (!this.isExpectedMissingAgencyProfile(error)) {
      console.error('API Error:', errorMessage);
    }

    const apiError = new Error(errorMessage) as Error & {
      status?: number;
      details?: any;
    };
    apiError.status = error.status;
    apiError.details = error.error;

    return throwError(() => apiError);
  }

  private isExpectedMissingAgencyProfile(error: HttpErrorResponse): boolean {
    return error.status === 404 && !!error.url?.endsWith('/api/agency/profile');
  }
}
