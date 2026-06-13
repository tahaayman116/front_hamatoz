import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';
import { UserProfileDto, UpdateProfileRequestDto, UserOnboardingDto } from '../models/api.dtos';

export interface UserProfile extends UserProfileDto {}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private profile = signal<UserProfile | null>(null);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.users.me).subscribe({
        next: (response: any) => {
          const profile = response?.data || response;
          this.profile.set(profile);
          this.error.set(null);
          this.loading.set(false);
          observer.next(profile);
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
   * Update user profile with required fields: name, phone, email
   */
  updateProfile(data: UpdateProfileRequestDto): Observable<UserProfile> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.put<any>(API_CONFIG.endpoints.users.profile, data).subscribe({
        next: (response: any) => {
          const profile = response?.data || response || data;
          this.profile.set(profile);
          this.error.set(null);
          this.loading.set(false);
          observer.next(profile);
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

  submitOnboarding(data: UserOnboardingDto): Observable<any> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.post<any>(API_CONFIG.endpoints.users.submitOnboarding, data).subscribe({
        next: (response: any) => {
          this.error.set(null);
          this.loading.set(false);
          observer.next(response);
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
  getProfile$() {
    return this.profile;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }
}
