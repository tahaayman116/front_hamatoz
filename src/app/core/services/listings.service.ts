import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';
import { ListingDto, CreateListingDto, UpdateListingDto } from '../models/api.dtos';

export interface Listing extends ListingDto {}

@Injectable({
  providedIn: 'root',
})
export class ListingsService {
  private listings = signal<Listing[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  allListings = computed(() => this.listings());
  isLoading = computed(() => this.loading());
  errorMessage = computed(() => this.error());

  constructor(private apiService: ApiService) {}

  /**
   * Get all public listings
   */
  getPublicListings(page: number = 1, limit: number = 20): Observable<any> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService
        .get<any>(API_CONFIG.endpoints.listings.all, { page, limit })
        .subscribe({
          next: (response: any) => {
            const listingsArray = this.extractListings(response);
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
   * Get listing details
   */
  getListingDetail(id: string | number): Observable<Listing> {
    return new Observable((observer) => {
      const endpoint = API_CONFIG.endpoints.listings.detail.replace('{id}', String(id));
      this.apiService.get<any>(endpoint).subscribe({
        next: (response: any) => {
          const listing = this.normalizeListing(response?.data || response);
          if (!listing || this.isDemoListing(listing)) {
            observer.error(new Error('Listing not found.'));
            return;
          }
          observer.next(listing);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Create new listing with all required fields
   */
  createListing(data: CreateListingDto): Observable<Listing> {
    return new Observable((observer) => {
      this.apiService.post<any>(API_CONFIG.endpoints.listings.create, data).subscribe({
        next: (response: any) => {
          observer.next(response.data || response);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Update existing listing
   */
  updateListing(id: string | number, data: UpdateListingDto): Observable<Listing> {
    return new Observable((observer) => {
      const endpoint = API_CONFIG.endpoints.listings.update.replace('{listingId}', String(id));
      this.apiService.put<any>(endpoint, data).subscribe({
        next: (response: any) => {
          observer.next(response.data || response);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Delete listing
   */
  deleteListing(id: string | number): Observable<any> {
    return new Observable((observer) => {
      observer.error(new Error('Delete listing is not available in the current Hamatoz API.'));
    });
  }

  /**
   * Get similar listings
   */
  getSimilarListings(id: string | number): Observable<Listing[]> {
    return new Observable((observer) => {
      const endpoint = API_CONFIG.endpoints.listings.similar.replace('{id}', String(id));
      this.apiService.get<any>(endpoint).subscribe({
        next: (response: any) => {
          observer.next(this.extractListings(response));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Search listings with image (visual search)
   */
  visualSearch(image: File, listingType: 'Car' | 'Part' | 0 | 1, count: number = 10): Observable<Listing[]> {
    return new Observable((observer) => {
      const formData = new FormData();
      formData.append('Image', image);
      formData.append('ListingType', String(this.toListingTypeEnum(listingType)));
      formData.append('Count', String(count));
      
      this.apiService.post<any>(API_CONFIG.endpoints.listings.searchVisual, formData).subscribe({
        next: (response: any) => {
          observer.next(this.extractListings(response));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Search listings with text query (text search - legacy)
   */
  searchListings(query: string, filters?: any): Observable<Listing[]> {
    return new Observable((observer) => {
      this.apiService.get<any>(API_CONFIG.endpoints.listings.semanticSearch, { query, ...filters }).subscribe({
        next: (response: any) => {
          observer.next(this.extractListings(response));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Semantic search with text query
   */
  semanticSearch(query: string, topK: number = 10): Observable<Listing[]> {
    return new Observable((observer) => {
      this.apiService
        .get<any>(API_CONFIG.endpoints.listings.semanticSearch, { query, topK })
        .subscribe({
          next: (response: any) => {
            observer.next(this.extractListings(response));
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
    });
  }

  getForYou(userId: number): Observable<Listing[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService
        .get<any>(API_CONFIG.endpoints.listings.forYou, { userId })
        .subscribe({
          next: (response: any) => {
            const listingsArray = this.extractListings(response);
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
   * Get local listings array
   */
  getListingsArray(): Listing[] {
    return this.listings();
  }

  /**
   * Set listings locally (useful for caching)
   */
  setListings(listings: Listing[]): void {
    this.listings.set(listings);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  private extractListings(response: any): Listing[] {
    const rawResults = this.normalizeListingsArray(response);
    return rawResults
      .map((item: any) => this.normalizeListing(item))
      .filter((listing: Listing | null): listing is Listing => !!listing && !this.isDemoListing(listing));
  }

  private normalizeListingsArray(response: any): any[] {
    if (Array.isArray(response)) return response;

    const nested = response?.data || response?.listings || response?.results || response?.recommendations;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === 'object') return [nested];
    if (response && typeof response === 'object' && response.id !== undefined) return [response];

    return [];
  }

  private normalizeListing(item: any): Listing | null {
    if (!item) return null;
    if (item?.listing) {
      return { ...item.listing, score: item.score };
    }
    return item;
  }

  private toListingTypeEnum(listingType: 'Car' | 'Part' | 0 | 1): 0 | 1 {
    if (listingType === 0 || listingType === 1) return listingType;
    return listingType === 'Part' ? 1 : 0;
  }

  private isDemoListing(listing: Listing): boolean {
    return Number(listing.ownerUserId) === 2;
  }
}
