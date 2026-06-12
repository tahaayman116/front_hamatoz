import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { API_CONFIG } from './api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const isApiRequest = request.url.startsWith(API_CONFIG.baseUrl);
    const isFormData = request.body instanceof FormData;

    if (isApiRequest) {
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      request = request.clone({
        setHeaders: headers,
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        if (!(error.status === 404 && error.url?.endsWith('/api/agency/profile'))) {
          console.error(errorMessage);
        }
        return throwError(() => error);
      })
    );
  }
}
