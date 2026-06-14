import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FavoritesService } from '../core/services/favorites.service';
import { AuthService } from '../core/services/auth.service';
import { ChatService, Conversation } from '../core/services/chat.service';
import { ListingsService } from '../core/services/listings.service';
import { CustomerRequest, RequestsService } from '../core/services/requests.service';
import { ListingDto } from '../core/models/api.dtos';

interface Part {
  id: number;
  name: string;
  category: string;
  location: string;
  badge1: string | null;
  price: number;
  brand: string;
  condition: string;
  isFavorited: boolean;
  imageUrl?: string;
  matchScore?: number;
  searchableText: string;
}

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './parts.html',
  styleUrls: ['./parts.css'],
})
export class Parts {
  showMobileFilters = false;
  isLargeScreen = window.innerWidth >= 1024;
  searchQuery = '';
  brandSearch = '';
  selectedBrands: { [key: string]: boolean } = {};
  filteredBrands: string[] = [];
  minPricePercent = 0;
  maxPricePercent = 100;
  selectedCondition = '';
  maxAvailablePrice = 100000;
  sortBy = 'Recommended';
  currentUserId = '';
  isLoading = false;
  isAiSearching = false;
  isAiResultMode = false;
  isForYouMode = false;
  requestedForYouMode = false;
  errorMessage = '';
  allParts: Part[] = [];
  filteredParts: Part[] = [];
  totalParts = 0;
  allBrands: string[] = [];
  requestLoadingId: number | null = null;
  requestFeedback = '';
  requestError = '';
  requestsByListing: Record<number, CustomerRequest> = {};
  conversationsByRequest: Record<number, Conversation> = {};

  get activeFilterCount(): number {
    const brandCount = Object.values(this.selectedBrands).filter(Boolean).length;
    const hasPriceFilter = this.minPricePercent > 0 || this.maxPricePercent < 100 ? 1 : 0;
    const hasConditionFilter = this.selectedCondition ? 1 : 0;
    return brandCount + hasPriceFilter + hasConditionFilter;
  }

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private listingsService: ListingsService,
    private requestsService: RequestsService,
    private chatService: ChatService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadUserFavorites();
    }

    this.loadPartsFromApi();
  }

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) this.showMobileFilters = false;
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
    document.body.style.overflow = this.showMobileFilters && !this.isLargeScreen ? 'hidden' : 'auto';
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

    this.filteredParts = this.allParts.filter((part) => {
      if (selectedBrandsList.length > 0 && !selectedBrandsList.includes(part.brand)) return false;
      if (part.price < minPrice || part.price > maxPrice) return false;
      if (this.selectedCondition && part.condition !== this.selectedCondition) return false;
      if (query && !this.isAiResultMode) {
        return part.searchableText.includes(this.normalizeSearchText(query));
      }
      return true;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.brandSearch = '';
    this.selectedBrands = {};
    this.selectedCondition = '';
    this.minPricePercent = 0;
    this.maxPricePercent = 100;
    this.loadPartsFromApi();
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.isAiResultMode) {
      this.loadPartsFromApi();
      return;
    }
    this.applyFilters();
  }

  showAllParts() {
    this.requestedForYouMode = false;
    this.loadPartsFromApi();
  }

  showForYouParts() {
    this.requestedForYouMode = true;
    this.loadForYouParts();
  }

  runSemanticSearch() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.loadPartsFromApi();
      return;
    }

    this.isAiSearching = true;
    this.errorMessage = '';

    this.listingsService.semanticSearch(query, 25).subscribe({
      next: (listings: ListingDto[]) => {
        this.isForYouMode = false;
        this.requestedForYouMode = false;
        this.isAiResultMode = true;
        this.sortBy = 'AI semantic match';
        const rankedListings = this.rankListingsForQuery(listings, query);
        this.setPartsFromListings(rankedListings);
        this.errorMessage = rankedListings.length
          ? ''
          : 'Smart search did not find approved parts for this query.';
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

    this.listingsService.visualSearch(file, 'Part', 20).subscribe({
      next: (listings: ListingDto[]) => {
        this.searchQuery = '';
        this.isForYouMode = false;
        this.requestedForYouMode = false;
        this.isAiResultMode = true;
        this.sortBy = 'Image match';
        this.setPartsFromListings(listings);
        this.errorMessage = listings.length
          ? ''
          : 'Image search did not return approved parts for this image.';
        this.isAiSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not run image search.';
        this.isAiSearching = false;
      },
    });
  }

  toggleFavorite(partId: number) {
    if (!this.currentUserId) {
      alert('Please sign in to add favorites');
      return;
    }

    const part = this.filteredParts.find((p) => p.id === partId);
    if (!part) return;

    const favoritePart = {
      id: part.id,
      name: part.name,
      price: part.price,
      image: part.imageUrl || '',
      addedAt: new Date(),
    };

    if (part.isFavorited) {
      this.favoritesService.removeFavoritePart(this.currentUserId, part.id);
      part.isFavorited = false;
      const originalPart = this.allParts.find((p) => p.id === partId);
      if (originalPart) originalPart.isFavorited = false;
      return;
    }

    if (this.favoritesService.addFavoritePart(this.currentUserId, favoritePart)) {
      part.isFavorited = true;
      const originalPart = this.allParts.find((p) => p.id === partId);
      if (originalPart) originalPart.isFavorited = true;
    }
  }

  submitPartRequest(part: Part) {
    if (this.requestLoadingId) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/sign-in']);
      return;
    }

    if (!['customer', 'user'].includes(user.role?.toLowerCase())) {
      this.requestError = 'Only customer accounts can send purchase requests.';
      this.requestFeedback = '';
      return;
    }

    this.requestLoadingId = part.id;
    this.requestError = '';
    this.requestFeedback = '';

    this.requestsService.createRequest({
      listingId: part.id,
      message: 'Customer requested to open a chat for this listing.',
    }).subscribe({
      next: () => {
        this.requestFeedback = `Request for listing #${part.id} was sent to admin. Chat will open after approval.`;
        this.requestLoadingId = null;
        this.loadRequestState();
      },
      error: (err) => {
        this.requestError = this.readableApiError(err, 'Could not send request.');
        this.requestLoadingId = null;
      },
    });
  }

  getPartRequest(partId: number): CustomerRequest | null {
    return this.requestsByListing[partId] || null;
  }

  getPartConversation(partId: number): Conversation | null {
    const request = this.getPartRequest(partId);
    return request ? this.conversationsByRequest[request.id] || null : null;
  }

  canRequestPartChat(partId: number): boolean {
    const status = this.getPartRequest(partId)?.status?.toLowerCase() || '';
    return !this.getPartRequest(partId) || ['rejected', 'denied'].includes(status);
  }

  openPartChat(partId: number) {
    const conversation = this.getPartConversation(partId);
    if (!conversation) return;
    this.router.navigate(['/messages'], { queryParams: { conversationId: conversation.id } });
  }

  private loadUserFavorites() {
    if (!this.currentUserId) return;

    const userFavorites = this.favoritesService.getFavorites(this.currentUserId);
    this.allParts.forEach((part) => {
      part.isFavorited = userFavorites.parts.some((fav: any) => fav.id === part.id);
    });

    this.filteredParts = [...this.allParts];
  }

  private loadPartsFromApi(message = '', keepForYouTab = false) {
    this.isLoading = true;
    this.errorMessage = message;

    this.listingsService.getPublicListings().subscribe({
      next: (listings: ListingDto[]) => {
        this.isForYouMode = false;
        this.requestedForYouMode = keepForYouTab;
        this.isAiResultMode = false;
        this.sortBy = 'Recommended';
        this.setPartsFromListings(listings);
        this.loadRequestState();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not load parts.';
        this.allParts = [];
        this.filteredParts = [];
        this.totalParts = 0;
        this.isLoading = false;
      },
    });
  }

  private loadForYouParts() {
    const userId = Number(this.authService.currentUser()?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.loadPartsFromApi('Sign in and complete onboarding to unlock AI part recommendations.', true);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.listingsService.getForYou(userId).subscribe({
      next: (listings: ListingDto[]) => {
        const partListings = listings.filter((listing) => this.isPartListing(listing));
        if (!partListings.length) {
          this.loadPartsFromApi('The AI did not return part recommendations for your choices yet, so we are showing approved parts.', true);
          return;
        }

        this.isForYouMode = true;
        this.requestedForYouMode = true;
        this.isAiResultMode = true;
        this.sortBy = 'Recommended for you';
        this.setPartsFromListings(partListings);
        this.loadRequestState();
        this.isLoading = false;
      },
      error: (error) => {
        this.loadPartsFromApi(error.message || 'Could not load AI part recommendations, so we are showing approved parts.', true);
      },
    });
  }

  private setPartsFromListings(listings: ListingDto[]) {
    const parts = listings
      .filter((listing) => this.isPartListing(listing))
      .map((listing) => this.mapListingToPart(listing));

    this.allParts = parts;
    this.totalParts = parts.length;
    this.maxAvailablePrice = Math.max(100000, ...parts.map((part) => part.price || 0));
    this.allBrands = Array.from(new Set(parts.map((part) => part.brand).filter(Boolean))).sort();
    this.filteredBrands = [...this.allBrands];
    this.allBrands.forEach((brand) => (this.selectedBrands[brand] = false));
    this.loadUserFavorites();
    this.applyFilters();
  }

  private loadRequestState() {
    const user = this.authService.getCurrentUser();
    if (!user || !['customer', 'user'].includes(user.role?.toLowerCase())) return;

    this.requestsService.getMyRequests().subscribe({
      next: (requests) => {
        this.requestsByListing = requests.reduce<Record<number, CustomerRequest>>((acc, request) => {
          const listingId = Number(request.listingId);
          if (!listingId) return acc;
          const existing = acc[listingId];
          if (!existing || String(request.createdAtUtc || '').localeCompare(String(existing.createdAtUtc || '')) > 0) {
            acc[listingId] = request;
          }
          return acc;
        }, {});
        this.loadConversationsForRequests();
      },
      error: () => {},
    });
  }

  private loadConversationsForRequests() {
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversationsByRequest = conversations.reduce<Record<number, Conversation>>((acc, conversation) => {
          if (conversation.requestId) acc[conversation.requestId] = conversation;
          return acc;
        }, {});
      },
      error: () => {},
    });
  }

  private mapListingToPart(listing: ListingDto): Part {
    return {
      id: listing.id,
      name: listing.title || listing.modelOrPartName || 'Auto Part',
      category: listing.modelOrPartName || listing.brand || 'Spare Part',
      location: [listing.city, listing.area].filter(Boolean).join(', ') || 'N/A',
      badge1: listing.condition || listing.status || null,
      price: listing.price || 0,
      brand: listing.brand || 'Other',
      condition: (listing.condition || '').toLowerCase(),
      isFavorited: false,
      imageUrl: this.firstImageUrl(listing.imagesUrlsText),
      matchScore: (listing as any).score,
      searchableText: this.searchableListingText(listing),
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
    if (!this.isPartListing(listing)) return 0;

    const title = this.normalizeSearchText(listing.title);
    const brand = this.normalizeSearchText(listing.brand);
    const partName = this.normalizeSearchText(listing.modelOrPartName);
    const description = this.normalizeSearchText(listing.description);
    const location = this.normalizeSearchText([listing.city, listing.area].filter(Boolean).join(' '));
    const condition = this.normalizeSearchText(listing.condition);
    const combined = [title, brand, partName, description, location, condition].join(' ');

    let score = 0;
    if (brand && brand === normalizedQuery) score += 100;
    if (partName && partName === normalizedQuery) score += 95;
    if (title.includes(normalizedQuery)) score += 70;
    if (brand.includes(normalizedQuery)) score += 45;
    if (partName.includes(normalizedQuery)) score += 45;
    if (description.includes(normalizedQuery)) score += 18;

    for (const token of tokens) {
      if (brand === token) score += 24;
      else if (brand.includes(token)) score += 16;
      if (partName.includes(token)) score += 16;
      if (title.includes(token)) score += 12;
      if (description.includes(token)) score += 5;
      if (location.includes(token) || condition.includes(token)) score += 4;
    }

    if (wantsCheap && listing.price) score += Math.max(1, 30 - Math.min(listing.price / 100000, 30));
    if (wantsNew && condition.includes('new')) score += 28;
    if (wantsUsed && condition.includes('used')) score += 28;

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
        listing.price,
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

  private readableApiError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again before sending a request.';
    if (err?.details?.errors) return Object.values(err.details.errors).flat().join(' ');
    return err?.details?.message || err?.message || fallback;
  }

  private isPartListing(listing: ListingDto): boolean {
    const type = listing.type?.toLowerCase();
    return type === 'part' || type === 'sparepart';
  }
}
