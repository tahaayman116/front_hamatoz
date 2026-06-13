import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';
import { AuthService } from './auth.service';

export interface PendingAgency {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  description?: string;
  branchAddress?: string;
  city?: string;
  area?: string;
  commercialRegistrationNumber?: string;
  taxCardNumber?: string;
  rejectionReason?: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface PendingListing {
  id: number;
  title: string;
  description: string;
  type: string;
  ownerUserId?: number;
  status: string;
  price?: number;
  brand?: string;
  modelOrPartName?: string;
  condition?: string;
  city?: string;
  area?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface PendingRequest {
  id: number;
  listingId?: number;
  customerUserId?: number;
  status: string;
  message?: string;
  adminMessage?: string | null;
  createdAt: Date;
}

export interface ReviewDecision {
  approved?: boolean;
  approve?: boolean;
  reason?: string;
  rejectionReason?: string;
  adminMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private pendingAgencies = signal<PendingAgency[]>([]);
  private pendingListings = signal<PendingListing[]>([]);
  private pendingRequests = signal<any[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Get pending agencies
   */
  getPendingAgencies(): Observable<PendingAgency[]> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.admin.agencies.pending).subscribe({
        next: (response: any) => {
          const agencies = this.normalizeArray(response).map((agency) => this.mapAgency(agency));
          this.pendingAgencies.set(agencies);
          this.error.set(null);
          this.loading.set(false);
          observer.next(agencies);
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
   * Review agency
   */
  reviewAgency(agencyId: string, decision: ReviewDecision): Observable<any> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.admin.agencies.review.replace('{agencyProfileId}', String(agencyId));
      this.apiService.post<any>(endpoint, this.toAgencyDecision(decision)).subscribe({
        next: (response: any) => {
          this.pendingAgencies.update((agencies) =>
            agencies.filter((a) => String(a.id) !== String(agencyId))
          );
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
   * Get pending listings
   */
  getPendingListings(): Observable<PendingListing[]> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.admin.listings.pending).subscribe({
        next: (response: any) => {
          const listings = this.normalizeArray(response).map((listing) => this.mapListing(listing));
          this.pendingListings.set(listings);
          this.error.set(null);
          this.loading.set(false);
          observer.next(listings);
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
   * Review listing
   */
  reviewListing(listingId: string, decision: ReviewDecision): Observable<any> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.admin.listings.review.replace('{listingId}', listingId);
      this.apiService.post<any>(endpoint, this.toListingDecision(decision)).subscribe({
        next: (response: any) => {
          this.pendingListings.update((listings) =>
            listings.filter((l) => String(l.id) !== String(listingId))
          );
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
   * Get pending requests
   */
  getPendingRequests(): Observable<any[]> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.admin.requests.pending).subscribe({
        next: (response: any) => {
          const requests = this.normalizeArray(response).map((request) => this.mapRequest(request));
          this.pendingRequests.set(requests);
          this.error.set(null);
          this.loading.set(false);
          observer.next(requests);
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
   * Review request
   */
  reviewRequest(requestId: string, decision: ReviewDecision): Observable<any> {
    return new Observable((observer) => {
      if (!this.hasAdminApiToken(observer)) return;

      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.admin.requests.review.replace('{requestId}', requestId);
      this.apiService.post<any>(endpoint, this.toRequestDecision(decision)).subscribe({
        next: (response: any) => {
          this.pendingRequests.update((requests) =>
            requests.filter((r) => r.id !== requestId)
          );
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
  getPendingAgencies$() {
    return this.pendingAgencies;
  }

  getPendingListings$() {
    return this.pendingListings;
  }

  getPendingRequests$() {
    return this.pendingRequests;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }

  private toAgencyDecision(decision: ReviewDecision) {
    return {
      approve: decision.approve ?? decision.approved ?? false,
      rejectionReason: decision.rejectionReason ?? decision.reason,
    };
  }

  private toListingDecision(decision: ReviewDecision) {
    return {
      approve: decision.approve ?? decision.approved ?? false,
      rejectionReason: decision.rejectionReason ?? decision.reason,
    };
  }

  private toRequestDecision(decision: ReviewDecision) {
    return {
      approve: decision.approve ?? decision.approved ?? false,
      adminMessage: decision.adminMessage ?? decision.reason,
    };
  }

  private normalizeArray(response: any): any[] {
    if (Array.isArray(response)) return response;

    const nested = response?.data || response?.items || response?.agencies || response?.listings || response?.requests;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === 'object') return [nested];

    if (response && typeof response === 'object' && response.id !== undefined) {
      return [response];
    }

    return [];
  }

  private hasAdminApiToken(observer: any): boolean {
    if (this.authService.getToken()) {
      return true;
    }

    const error = new Error('Please sign in with an admin account to load dashboard data.');
    this.loading.set(false);
    this.error.set(error.message);
    observer.error(error);
    return false;
  }

  private mapAgency(source: any): PendingAgency {
    return {
      id: Number(source.id),
      userId: source.userId,
      name: source.agencyName || source.name || `Agency #${source.id}`,
      email: source.email,
      description: source.description,
      branchAddress: source.branchAddress,
      city: source.city,
      area: source.area,
      commercialRegistrationNumber: source.commercialRegistrationNumber,
      taxCardNumber: source.taxCardNumber,
      rejectionReason: source.rejectionReason,
      status: source.verificationStatus || source.status || 'Pending',
      createdAt: source.createdAtUtc ? new Date(source.createdAtUtc) : new Date(),
      updatedAt: source.updatedAtUtc ? new Date(source.updatedAtUtc) : null,
    };
  }

  private mapListing(source: any): PendingListing {
    return {
      id: Number(source.id),
      ownerUserId: source.ownerUserId,
      title: source.title || `Listing #${source.id}`,
      description: source.description || '',
      type: source.type || '',
      status: source.status || 'Pending',
      price: source.price,
      brand: source.brand,
      modelOrPartName: source.modelOrPartName,
      condition: source.condition,
      city: source.city,
      area: source.area,
      rejectionReason: source.rejectionReason,
      createdAt: source.createdAtUtc ? new Date(source.createdAtUtc) : new Date(),
      updatedAt: source.updatedAtUtc ? new Date(source.updatedAtUtc) : null,
    };
  }

  private mapRequest(source: any): PendingRequest {
    return {
      id: Number(source.id),
      listingId: source.listingId,
      customerUserId: source.customerUserId,
      status: source.status || 'Pending',
      message: source.message,
      adminMessage: source.adminMessage,
      createdAt: source.createdAtUtc ? new Date(source.createdAtUtc) : new Date(),
    };
  }
}
