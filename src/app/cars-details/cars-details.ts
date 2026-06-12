import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListingDto } from '../core/models/api.dtos';
import { ListingsService } from '../core/services/listings.service';

@Component({
  selector: 'app-cars-details',
  imports: [CommonModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './cars-details.html',
  styleUrl: './cars-details.css',
})
export class CarsDetails implements OnInit, OnDestroy {
  listing: ListingDto | null = null;
  similarCars: ListingDto[] = [];
  selectedImage = '';
  images: string[] = [];
  isLoading = true;
  errorMessage = '';

  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private listingsService: ListingsService
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.errorMessage = 'Listing id is missing.';
        this.isLoading = false;
        return;
      }
      this.loadListing(id);
    });
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  get location(): string {
    if (!this.listing) return 'N/A';
    return [this.listing.city, this.listing.area].filter(Boolean).join(', ') || 'N/A';
  }

  get title(): string {
    if (!this.listing) return 'Car details';
    return this.listing.title || `${this.listing.brand || 'Car'} ${this.listing.modelOrPartName || ''}`.trim();
  }

  private loadListing(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.listing = null;
    this.images = [];
    this.selectedImage = '';
    this.similarCars = [];

    this.listingsService.getListingDetail(id).subscribe({
      next: (listing) => {
        if (listing.type?.toLowerCase() !== 'car') {
          this.errorMessage = 'This listing is not a car.';
          this.isLoading = false;
          return;
        }

        this.listing = listing;
        this.images = this.parseImages(listing.imagesUrlsText);
        this.selectedImage = this.images[0] || '';
        this.loadSimilar(listing.id);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not load car details.';
        this.isLoading = false;
      },
    });
  }

  private loadSimilar(id: number) {
    this.listingsService.getSimilarListings(id).subscribe({
      next: (listings) => {
        this.similarCars = listings
          .filter((listing) => listing.type?.toLowerCase() === 'car' && listing.id !== id)
          .slice(0, 3);
      },
      error: () => {
        this.similarCars = [];
      },
    });
  }

  private parseImages(imagesUrlsText?: string): string[] {
    const value = imagesUrlsText?.trim();
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((url) => String(url).trim()).filter(Boolean);
      }
    } catch {
      // The API usually sends plain text, not JSON.
    }

    const dataUrls = value.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+/g);
    if (dataUrls?.length) return dataUrls;

    const httpUrls = value.match(/https?:\/\/[^\s,;]+/g);
    if (httpUrls?.length) return httpUrls;

    return value
      .split(/\r?\n|[,;]/)
      .map((url) => url.trim())
      .filter(Boolean);
  }
}
