import { Component, HostListener, OnInit } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../core/services/favorites.service';
import { AuthService } from '../core/services/auth.service';
import { ListingsService } from '../core/services/listings.service';
import { ListingDto } from '../core/models/api.dtos';

interface Car {
  id: number;
  name: string;
  price: number;
  miles: number;
  transmission: string;
  location: string;
  isFavorited: boolean;
  badge?: string;
  brand: string;
  condition: string;
  imageUrl?: string;
  matchScore?: number;
  searchableText: string;
  numericYear: number;
}

@Component({
  selector: 'app-cars',
  imports: [NgForOf, NgIf, FormsModule, DecimalPipe, RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit {
  showMobileFilters = false;
  isLargeScreen = window.innerWidth >= 1024;
  currentUserId = '';
  searchQuery = '';
  brandSearch = '';
  selectedBrands: { [key: string]: boolean } = {};
  filteredBrands: string[] = [];
  minPricePercent = 0;
  maxPricePercent = 100;
  selectedCondition = '';
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  totalCars = 0;
  isLoading = false;
  isAiSearching = false;
  isAiResultMode = false;
  errorMessage = '';
  currentPage = 1;
  sortBy = 'Recommended';
  allBrands: string[] = [];
  maxAvailablePrice = 100000;

  get activeFilterCount(): number {
    const brandCount = Object.values(this.selectedBrands).filter(Boolean).length;
    const hasPriceFilter = this.minPricePercent > 0 || this.maxPricePercent < 100 ? 1 : 0;
    const hasConditionFilter = this.selectedCondition ? 1 : 0;
    return brandCount + hasPriceFilter + hasConditionFilter;
  }

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private listingsService: ListingsService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadUserFavorites();
    }

    this.loadCarsFromApi();
  }

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.showMobileFilters = false;
    }
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
    document.body.style.overflow = this.showMobileFilters && !this.isLargeScreen ? 'hidden' : 'auto';
  }

  initializeBrands() {
    this.filteredBrands = [...this.allBrands];
    this.allBrands.forEach((brand) => {
      this.selectedBrands[brand] = false;
    });
  }

  filterBrands() {
    this.filteredBrands = this.allBrands.filter((brand) =>
      brand.toLowerCase().includes(this.brandSearch.toLowerCase())
    );
  }

  applyFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    const selectedBrandsList = Object.keys(this.selectedBrands).filter((brand) => this.selectedBrands[brand]);
    const minPrice = (this.minPricePercent / 100) * this.maxAvailablePrice;
    const maxPrice = (this.maxPricePercent / 100) * this.maxAvailablePrice;

    this.filteredCars = this.allCars.filter((car) => {
      if (selectedBrandsList.length > 0 && !selectedBrandsList.includes(car.brand)) return false;
      if (car.price < minPrice || car.price > maxPrice) return false;
      if (this.selectedCondition && car.condition !== this.selectedCondition) return false;
      if (query && !this.isAiResultMode) {
        return car.searchableText.includes(this.normalizeSearchText(query));
      }
      return true;
    });

    this.currentPage = 1;
  }

  resetFilters() {
    this.searchQuery = '';
    this.brandSearch = '';
    this.selectedBrands = {};
    this.selectedCondition = '';
    this.minPricePercent = 0;
    this.maxPricePercent = 100;
    this.currentPage = 1;
    this.loadCarsFromApi();
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.isAiResultMode) {
      this.loadCarsFromApi();
      return;
    }
    this.applyFilters();
  }

  runSemanticSearch() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.loadCarsFromApi();
      return;
    }

    this.isAiSearching = true;
    this.errorMessage = '';

    this.listingsService.semanticSearch(query, 25).subscribe({
      next: (listings: ListingDto[]) => {
        this.isAiResultMode = true;
        this.sortBy = 'AI semantic match';
        const rankedListings = this.rankListingsForQuery(listings, query);
        this.setCarsFromListings(rankedListings);
        this.errorMessage = rankedListings.length ? '' : 'Semantic search did not return real approved cars for this query.';
        this.isAiSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not run semantic search.';
        this.isAiSearching = false;
      },
    });
  }

  runVisualSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.isAiSearching = true;
    this.errorMessage = '';

    this.listingsService.visualSearch(file, 'Car', 20).subscribe({
      next: (listings: ListingDto[]) => {
        this.searchQuery = '';
        this.isAiResultMode = true;
        this.sortBy = 'Image match';
        this.setCarsFromListings(listings);
        this.errorMessage = listings.length
          ? ''
          : 'Image search did not return any real approved cars. The backend image index may still contain demo listings only.';
        this.isAiSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not run image search.';
        this.isAiSearching = false;
      },
    });
  }

  toggleFavorite(carId: number) {
    if (!this.currentUserId) {
      alert('Please sign in to add favorites');
      return;
    }

    const car = this.filteredCars.find((c) => c.id === carId);
    if (!car) return;

    const favoriteCar = {
      id: car.id,
      name: car.name,
      price: car.price,
      image: car.imageUrl || '',
      addedAt: new Date(),
    };

    if (car.isFavorited) {
      this.favoritesService.removeFavoriteCar(this.currentUserId, car.id);
      car.isFavorited = false;
      const originalCar = this.allCars.find((c) => c.id === carId);
      if (originalCar) originalCar.isFavorited = false;
      return;
    }

    const success = this.favoritesService.addFavoriteCar(this.currentUserId, favoriteCar);
    if (success) {
      car.isFavorited = true;
      const originalCar = this.allCars.find((c) => c.id === carId);
      if (originalCar) originalCar.isFavorited = true;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < 12) {
      this.currentPage++;
    }
  }

  private loadUserFavorites() {
    if (!this.currentUserId) return;

    const userFavorites = this.favoritesService.getFavorites(this.currentUserId);
    this.allCars.forEach((car) => {
      car.isFavorited = userFavorites.cars.some((fav: any) => fav.id === car.id);
    });

    this.filteredCars = [...this.allCars];
  }

  private loadCarsFromApi() {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingsService.getPublicListings().subscribe({
      next: (listings: ListingDto[]) => {
        this.isAiResultMode = false;
        this.sortBy = 'Recommended';
        this.setCarsFromListings(listings);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not load cars from API';
        this.allCars = [];
        this.totalCars = 0;
        this.applyFilters();
        this.isLoading = false;
      },
    });
  }

  private setCarsFromListings(listings: ListingDto[]) {
    const cars = listings
      .filter((listing) => listing.type?.toLowerCase() === 'car')
      .map((listing) => this.mapListingToCar(listing));

    this.allCars = cars;
    this.totalCars = cars.length;
    this.maxAvailablePrice = Math.max(100000, ...cars.map((car) => car.price || 0));
    this.allBrands = Array.from(new Set(cars.map((car) => car.brand).filter(Boolean))).sort();
    this.initializeBrands();
    this.loadUserFavorites();
    this.applyFilters();
  }

  private mapListingToCar(listing: ListingDto): Car {
    return {
      id: listing.id,
      name: listing.title || `${listing.brand || 'Car'} ${listing.modelOrPartName || ''}`.trim(),
      price: listing.price || 0,
      miles: listing.kmsDriven || 0,
      transmission: listing.transmission || 'N/A',
      location: [listing.city, listing.area].filter(Boolean).join(', ') || 'N/A',
      isFavorited: false,
      brand: listing.brand || 'Other',
      condition: (listing.condition || '').toLowerCase(),
      badge: listing.status || undefined,
      imageUrl: this.firstImageUrl(listing.imagesUrlsText),
      matchScore: (listing as any).score,
      searchableText: this.searchableListingText(listing),
      numericYear: listing.year || 0,
    };
  }

  private firstImageUrl(imagesUrlsText?: string): string {
    return this.parseImageUrls(imagesUrlsText)[0] || '';
  }

  private parseImageUrls(imagesUrlsText?: string): string[] {
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

  private rankListingsForQuery(listings: ListingDto[], query: string): ListingDto[] {
    const normalizedQuery = this.normalizeSearchText(query);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    if (!tokens.length) return listings;

    const wantsCheap = /\b(cheap|budget|low|affordable|economic|economy)\b/.test(normalizedQuery) || normalizedQuery.includes('رخيص') || normalizedQuery.includes('اقتصاد');
    const wantsNew = /\b(new|zero)\b/.test(normalizedQuery) || normalizedQuery.includes('زيرو') || normalizedQuery.includes('جديد');
    const wantsUsed = /\b(used)\b/.test(normalizedQuery) || normalizedQuery.includes('مستعمل');

    return listings
      .map((listing) => ({ listing, score: this.scoreListing(listing, normalizedQuery, tokens, wantsCheap, wantsNew, wantsUsed) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (wantsCheap) return (a.listing.price || 0) - (b.listing.price || 0);
        return (b.listing.createdAtUtc || '').localeCompare(a.listing.createdAtUtc || '');
      })
      .map((result) => result.listing);
  }

  private scoreListing(
    listing: ListingDto,
    normalizedQuery: string,
    tokens: string[],
    wantsCheap: boolean,
    wantsNew: boolean,
    wantsUsed: boolean
  ): number {
    if (listing.type?.toLowerCase() !== 'car') return 0;

    const title = this.normalizeSearchText(listing.title);
    const brand = this.normalizeSearchText(listing.brand);
    const model = this.normalizeSearchText(listing.modelOrPartName);
    const description = this.normalizeSearchText(listing.description);
    const location = this.normalizeSearchText([listing.city, listing.area].filter(Boolean).join(' '));
    const specs = this.normalizeSearchText([listing.condition, listing.fuel, listing.transmission, listing.assembly, listing.year].filter(Boolean).join(' '));
    const combined = [title, brand, model, description, location, specs].join(' ');

    let score = 0;
    if (brand && brand === normalizedQuery) score += 120;
    if (model && model === normalizedQuery) score += 95;
    if (title.includes(normalizedQuery)) score += 70;
    if (brand.includes(normalizedQuery)) score += 55;
    if (model.includes(normalizedQuery)) score += 45;
    if (description.includes(normalizedQuery)) score += 18;

    for (const token of tokens) {
      if (brand === token) score += 26;
      else if (brand.includes(token)) score += 18;
      if (model.includes(token)) score += 15;
      if (title.includes(token)) score += 12;
      if (description.includes(token)) score += 5;
      if (location.includes(token) || specs.includes(token)) score += 4;
    }

    if (wantsCheap && listing.price) score += Math.max(1, 30 - Math.min(listing.price / 100000, 30));
    if (wantsNew && this.normalizeSearchText(listing.condition).includes('new')) score += 28;
    if (wantsUsed && this.normalizeSearchText(listing.condition).includes('used')) score += 28;

    return combined.includes(normalizedQuery) || score >= 8 ? score : 0;
  }

  private searchableListingText(listing: ListingDto): string {
    return this.normalizeSearchText(
      [
        listing.title,
        listing.brand,
        listing.modelOrPartName,
        listing.description,
        listing.condition,
        listing.city,
        listing.area,
        listing.year,
        listing.kmsDriven,
        listing.fuel,
        listing.transmission,
        listing.assembly,
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  private normalizeSearchText(value: unknown): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
