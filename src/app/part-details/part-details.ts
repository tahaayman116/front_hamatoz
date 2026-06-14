import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListingDto } from '../core/models/api.dtos';
import { AuthService } from '../core/services/auth.service';
import { ChatService, Conversation } from '../core/services/chat.service';
import { ListingsService } from '../core/services/listings.service';
import { CustomerRequest, RequestsService } from '../core/services/requests.service';

@Component({
  selector: 'app-part-details',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './part-details.html',
  styleUrl: './part-details.css',
})
export class PartDetails implements OnInit, OnDestroy {
  listing: ListingDto | null = null;
  similarParts: ListingDto[] = [];
  selectedImage = '';
  images: string[] = [];
  isLoading = true;
  errorMessage = '';
  requestFeedback = '';
  requestError = '';
  isRequesting = false;
  listingRequest: CustomerRequest | null = null;
  listingConversation: Conversation | null = null;
  isLoadingRequestState = false;

  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private listingsService: ListingsService,
    private requestsService: RequestsService
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.errorMessage = 'Part id is missing.';
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

  submitPurchaseRequest() {
    if (!this.listing || this.isRequesting) return;

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

    this.isRequesting = true;
    this.requestError = '';
    this.requestFeedback = '';

    this.requestsService
      .createRequest({
        listingId: this.listing.id,
        message: 'Customer requested to open a chat for this listing.',
      })
      .subscribe({
        next: () => {
          this.requestFeedback = 'Request sent to admin. Chat will open after approval.';
          this.isRequesting = false;
          this.loadRequestState(this.listing!.id);
        },
        error: (err) => {
          this.requestError = this.readableApiError(err, 'Could not send request.');
          this.isRequesting = false;
        },
      });
  }

  get location(): string {
    if (!this.listing) return 'N/A';
    return [this.listing.city, this.listing.area].filter(Boolean).join(', ') || 'N/A';
  }

  get title(): string {
    if (!this.listing) return 'Part details';
    return this.listing.title || `${this.listing.brand || 'Part'} ${this.listing.modelOrPartName || ''}`.trim();
  }

  get requestStatus(): string {
    return this.listingRequest?.status?.toLowerCase() || '';
  }

  get canOpenChat(): boolean {
    return Boolean(this.listingConversation);
  }

  get canSendRequest(): boolean {
    return !this.listingRequest || ['rejected', 'denied'].includes(this.requestStatus);
  }

  openChat() {
    if (!this.listingConversation) return;
    this.router.navigate(['/messages'], {
      queryParams: { conversationId: this.listingConversation.id },
    });
  }

  private loadListing(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.listing = null;
    this.images = [];
    this.selectedImage = '';
    this.similarParts = [];

    this.listingsService.getListingDetail(id).subscribe({
      next: (listing) => {
        if (!this.isPartListing(listing)) {
          this.errorMessage = 'This listing is not a spare part.';
          this.isLoading = false;
          return;
        }

        this.listing = listing;
        this.images = this.parseImages(listing.imagesUrlsText);
        this.selectedImage = this.images[0] || '';
        this.loadSimilar(listing.id);
        this.loadRequestState(listing.id);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Could not load part details.';
        this.isLoading = false;
      },
    });
  }

  private loadSimilar(id: number) {
    this.listingsService.getSimilarListings(id).subscribe({
      next: (listings) => {
        this.similarParts = listings
          .filter((listing) => this.isPartListing(listing) && listing.id !== id)
          .slice(0, 3);
      },
      error: () => {
        this.similarParts = [];
      },
    });
  }

  private loadRequestState(listingId: number) {
    const user = this.authService.getCurrentUser();
    if (!user || !['customer', 'user'].includes(user.role?.toLowerCase())) return;

    this.isLoadingRequestState = true;
    this.requestsService.getMyRequests().subscribe({
      next: (requests) => {
        this.listingRequest =
          [...requests]
            .filter((request) => Number(request.listingId) === listingId)
            .sort((a, b) => String(b.createdAtUtc || '').localeCompare(String(a.createdAtUtc || '')))[0] || null;
        this.loadConversationForRequest();
      },
      error: () => {
        this.isLoadingRequestState = false;
      },
    });
  }

  private loadConversationForRequest() {
    if (!this.listingRequest) {
      this.listingConversation = null;
      this.isLoadingRequestState = false;
      return;
    }

    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.listingConversation =
          conversations.find((conversation) => String(conversation.requestId) === String(this.listingRequest?.id)) || null;
        this.isLoadingRequestState = false;
      },
      error: () => {
        this.isLoadingRequestState = false;
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

  private isPartListing(listing: ListingDto): boolean {
    const type = listing.type?.toLowerCase();
    return type === 'part' || type === 'sparepart';
  }

  private readableApiError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again before sending a request.';
    if (err?.details?.errors) return Object.values(err.details.errors).flat().join(' ');
    return err?.details?.message || err?.message || fallback;
  }
}
