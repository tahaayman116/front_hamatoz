import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';
import { User } from '../models/user.model';
import { CurrentUserDto, LoginRequestDto, RegisterRequestDto } from '../models/api.dtos';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly legacyAdminToken = 'demo-admin-session';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  token = signal<string | null>(null);

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.restoreSession();
  }

  /**
   * Restore session from storage on app initialization
   */
  private restoreSession(): void {
    try {
      const savedToken = this.storageService.getItem('auth_token');
      const savedUser = this.storageService.getItem('current_user');

      if (savedToken === this.legacyAdminToken) {
        this.logout();
        return;
      }

      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(savedUser);
        this.isAuthenticated.set(true);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }

  /**
   * Login with email and password.
   */
  login(email: string, password: string): Observable<any> {
    const normalizedEmail = email.trim();
    const loginData: LoginRequestDto = { email: normalizedEmail, password };
    return new Observable((observer) => {
      this.apiService
        .post<any>(API_CONFIG.endpoints.auth.login, loginData)
        .subscribe({
          next: (response: any) => {
            const token = this.extractToken(response);

            if (!token) {
              observer.error(new Error('No token in response'));
              return;
            }

            this.token.set(token);
            this.isAuthenticated.set(true);
            this.storageService.setItem('auth_token', token);
            this.storageService.setItem('last_login', new Date());

            this.apiService.get<CurrentUserDto>(API_CONFIG.endpoints.auth.me).subscribe({
              next: (currentUser) => {
                const user = this.mapCurrentUser(currentUser, normalizedEmail);
                this.currentUser.set(user);
                this.storageService.setItem('current_user', user);
                observer.next({ token, user, raw: response });
                observer.complete();
              },
              error: () => {
                const user = this.mapCurrentUser(response.user || response, normalizedEmail);
                this.currentUser.set(user);
                this.storageService.setItem('current_user', user);
                observer.next({ token, user, raw: response });
                observer.complete();
              },
            });
          },
          error: (err) => {
            console.error('Login error:', err);
            observer.error(err);
          },
        });
    });
  }

  /**
   * Register new user with correct API fields
   */
  register(data: RegisterRequestDto): Observable<any> {
    return new Observable((observer) => {
      this.apiService.post<any>(API_CONFIG.endpoints.auth.register, data).subscribe({
        next: (response: any) => {
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  /**
   * Get current user from API
   */
  getCurrentUserFromAPI(): Observable<User> {
    return new Observable((observer) => {
      this.apiService.get<any>(API_CONFIG.endpoints.auth.me).subscribe({
        next: (response: any) => {
          const user = response.user || response.data || response;
          this.currentUser.set(user);
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  /**
   * Logout - clear session
   */
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.storageService.removeItem('auth_token');
    this.storageService.removeItem('current_user');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.currentUser()?.role?.toLowerCase() === 'admin';
  }

  /**
   * Check if user is agency
   */
  isAgency(): boolean {
    return this.currentUser()?.role?.toLowerCase() === 'agency';
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.token();
  }

  isDemoAdminSession(): boolean {
    return false;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Check if authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private extractToken(response: any): string | null {
    if (typeof response === 'string') {
      return response;
    }

    return (
      response?.token ||
      response?.accessToken ||
      response?.access_token ||
      response?.jwt ||
      response?.data?.token ||
      null
    );
  }

  private mapCurrentUser(source: any, email: string): User {
    const id = source?.id ?? source?.userId ?? '';
    const role = source?.role ?? 'Customer';

    return {
      id: String(id),
      name: source?.name ?? source?.fullName ?? email,
      email: source?.email ?? email,
      phone: source?.phone,
      role,
      status: source?.isVerified === false && String(role).toLowerCase() === 'agency' ? 'pending' : 'active',
      createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
      updatedAt: source?.updatedAt ? new Date(source.updatedAt) : new Date(),
    };
  }
}
