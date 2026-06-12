import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';
import { AgencyProfileDto, CreateListingDto, CreateOrUpdateAgencyProfileDto, ListingDto, UpdateListingDto } from '../models/api.dtos';

export interface AgencyProfile extends AgencyProfileDto {}
export interface AgencyListing extends ListingDto {}

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  private profile = signal<AgencyProfile | null>(null);
  private listings = signal<AgencyListing[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  /**
   * Get agency profile
   */
  getProfile(): Observable<AgencyProfile> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.agency.profile).subscribe({
        next: (response: any) => {
          const profile = response.data || response;
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
   * Update agency profile with all required fields:
   * agencyName, branchAddress, city, area, commercialRegistrationNumber, taxCardNumber
   */
  updateProfile(data: CreateOrUpdateAgencyProfileDto): Observable<AgencyProfile> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.post<any>(API_CONFIG.endpoints.agency.profile, data).subscribe({
        next: (response: any) => {
          const profile = response.data || response;
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
   * Get agency listings
   */
  getListings(): Observable<AgencyListing[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.agency.myListings).subscribe({
        next: (response: any) => {
          const listingsArray = this.normalizeListings(response);
          this.listings.set(listingsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(listingsArray);
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
   * Get my listings
   */
  getMyListings(): Observable<AgencyListing[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.agency.myListings).subscribe({
        next: (response: any) => {
          const listingsArray = this.normalizeListings(response);
          this.listings.set(listingsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(listingsArray);
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
   * Create listing
   */
  createListing(data: CreateListingDto): Observable<AgencyListing> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.post<any>(API_CONFIG.endpoints.agency.createListing, data).subscribe({
        next: (response: any) => {
          const listing = response.data || response;
          this.listings.update((listings) => [...listings, listing]);
          this.error.set(null);
          this.loading.set(false);
          observer.next(listing);
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
   * Update listing
   */
  updateListing(id: string | number, data: UpdateListingDto): Observable<AgencyListing> {
    return new Observable((observer) => {
      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.agency.updateListing.replace('{listingId}', String(id));
      this.apiService.put<any>(endpoint, data).subscribe({
        next: (response: any) => {
          const listing = response.data || response;
          this.listings.update((listings) =>
            listings.map((l) => (String(l.id) === String(id) ? listing : l))
          );
          this.error.set(null);
          this.loading.set(false);
          observer.next(listing);
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
   * Get signal values
   */
  getProfile$() {
    return this.profile;
  }

  getListings$() {
    return this.listings;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }

  private normalizeListings(response: any): AgencyListing[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    return response.data || response.listings || [];
  }
}
