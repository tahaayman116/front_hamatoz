# Hamatoz API Integration Guide

## Overview
This document outlines the complete API integration for the Hamatoz Angular frontend. All services are connected to the backend API at `https://ref3y-hamatoz-api.hf.space`.

## Architecture

### 1. **API Service** (`api.service.ts`)
Base HTTP service for all API calls. Handles GET, POST, PUT, PATCH, DELETE requests with:
- Automatic timeout handling
- Error handling and logging
- Request/response transformation

### 2. **Auth Interceptor** (`auth.interceptor.ts`)
Automatically adds:
- Authorization Bearer token to all API requests
- Content-Type headers
- Error handling for 401 (Unauthorized) responses
- Automatic retry logic

### 3. **API Configuration** (`api.config.ts`)
Centralized configuration containing:
- Base URL
- All endpoint paths
- Timeout settings
- Retry configuration

## Services

### Authentication Service (`auth.service.ts`)
```typescript
// Login
this.authService.login(email, password).subscribe({
  next: (response) => { /* user logged in */ },
  error: (err) => { /* handle error */ }
});

// Register
this.authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user' // or 'agency'
}).subscribe({
  next: (response) => { /* user registered */ },
  error: (err) => { /* handle error */ }
});

// Get current user info
this.authService.getCurrentUserFromAPI().subscribe({
  next: (user) => { /* user data */ },
  error: (err) => { /* handle error */ }
});

// Check auth status
const isLoggedIn = this.authService.isLoggedIn();
const currentUser = this.authService.getCurrentUser();
const token = this.authService.getToken();
```

### Listings Service (`listings.service.ts`)
```typescript
// Get all public listings
this.listingsService.getPublicListings(page, limit).subscribe({
  next: (response) => { /* listings data */ }
});

// Get listing details
this.listingsService.getListingDetail(id).subscribe({
  next: (listing) => { /* listing details */ }
});

// Search listings
this.listingsService.searchListings('query', { filters }).subscribe({
  next: (results) => { /* search results */ }
});

// Semantic search
this.listingsService.semanticSearch('query').subscribe({
  next: (results) => { /* semantic results */ }
});

// Get similar listings
this.listingsService.getSimilarListings(id).subscribe({
  next: (listings) => { /* similar items */ }
});
```

### Agency Service (`agency.service.ts`)
```typescript
// Get agency profile
this.agencyService.getProfile().subscribe({
  next: (profile) => { /* agency profile */ }
});

// Update agency profile
this.agencyService.updateProfile({
  description: 'Updated description',
  phone: '+1234567890'
}).subscribe({
  next: (profile) => { /* updated profile */ }
});

// Get agency listings
this.agencyService.getListings().subscribe({
  next: (listings) => { /* all agency listings */ }
});

// Get my listings
this.agencyService.getMyListings().subscribe({
  next: (listings) => { /* current user's listings */ }
});

// Create listing
this.agencyService.createListing({
  title: 'New Car',
  description: 'Description',
  type: 'car',
  price: 50000,
  images: []
}).subscribe({
  next: (listing) => { /* created listing */ }
});

// Update listing
this.agencyService.updateListing(listingId, {
  title: 'Updated Title',
  price: 55000
}).subscribe({
  next: (listing) => { /* updated listing */ }
});
```

### Chat Service (`chat.service.ts`)
```typescript
// Get conversations
this.chatService.getConversations().subscribe({
  next: (conversations) => { /* user conversations */ }
});

// Get messages from conversation
this.chatService.getMessages(conversationId).subscribe({
  next: (messages) => { /* conversation messages */ }
});

// Send message
this.chatService.sendMessage(conversationId, 'message content').subscribe({
  next: (message) => { /* sent message */ }
});

// Access signals (reactive)
const conversations$ = this.chatService.getConversations$();
const messages$ = this.chatService.getMessages$();
const loading$ = this.chatService.isLoading$();
```

### Requests Service (`requests.service.ts`)
```typescript
// Create request
this.requestsService.createRequest({
  title: 'Need a car',
  description: 'Looking for SUV',
  category: 'cars',
  budget: 100000
}).subscribe({
  next: (request) => { /* created request */ }
});

// Get my requests
this.requestsService.getMyRequests().subscribe({
  next: (requests) => { /* user requests */ }
});
```

### Admin Service (`admin.service.ts`)
```typescript
// Get pending agencies
this.adminService.getPendingAgencies().subscribe({
  next: (agencies) => { /* pending agencies */ }
});

// Review agency (approve/reject)
this.adminService.reviewAgency(agencyId, {
  approved: true,
  reason: 'Approved'
}).subscribe({
  next: (response) => { /* review submitted */ }
});

// Get pending listings
this.adminService.getPendingListings().subscribe({
  next: (listings) => { /* pending listings */ }
});

// Review listing
this.adminService.reviewListing(listingId, {
  approved: true,
  reason: 'Approved'
}).subscribe({
  next: (response) => { /* review submitted */ }
});

// Get pending requests
this.adminService.getPendingRequests().subscribe({
  next: (requests) => { /* pending requests */ }
});

// Review request
this.adminService.reviewRequest(requestId, {
  approved: true,
  reason: 'Approved'
}).subscribe({
  next: (response) => { /* review submitted */ }
});
```

### User Service (`user.service.ts`)
```typescript
// Get user profile
this.userService.getProfile().subscribe({
  next: (profile) => { /* user profile */ }
});

// Update user profile
this.userService.updateProfile({
  bio: 'Updated bio',
  phone: '+1234567890'
}).subscribe({
  next: (profile) => { /* updated profile */ }
});
```

### Notifications Service (`notifications.service.ts`)
```typescript
// Get notifications
this.notificationsService.getNotifications().subscribe({
  next: (notifications) => { /* user notifications */ }
});

// Mark notification as read
this.notificationsService.markAsRead(notificationId).subscribe({
  next: () => { /* marked as read */ }
});

// Mark all as read
this.notificationsService.markAllAsRead().subscribe({
  next: () => { /* all marked as read */ }
});

// Get unread count
const unreadCount$ = this.notificationsService.getUnreadCount$();
```

## Integration in Components

### Example: Cars List Component
```typescript
import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../core/services/listings.service';

@Component({
  selector: 'app-cars',
  template: `
    <div *ngIf="isLoading$ | async">Loading...</div>
    <div *ngFor="let listing of (listings$ | async)">
      {{ listing.title }}
    </div>
  `
})
export class CarsComponent implements OnInit {
  listings$ = this.listingsService.getListingsArray;
  isLoading$ = this.listingsService.isLoading$();

  constructor(private listingsService: ListingsService) {}

  ngOnInit() {
    this.listingsService.getPublicListings().subscribe();
  }
}
```

### Example: Sign-In Component (Already Updated)
```typescript
onSignIn() {
  this.authService.login(email, password).subscribe({
    next: (response) => {
      // User is logged in, navigate accordingly
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.errorMessage = err.message;
    }
  });
}
```

## Key Points

1. **Authentication**: Token is automatically managed by AuthService and sent with all requests via the interceptor
2. **Error Handling**: All services handle errors and expose error$ signals
3. **Loading States**: All services expose loading$ signals for UI feedback
4. **Signals**: Services use Angular signals for reactive state management
5. **Observables**: All API calls return Observables, follow standard RxJS patterns
6. **Type Safety**: All responses are typed with interfaces

## Setup Instructions

1. **HTTP Interceptor**: Already configured in `app.config.ts`
2. **API Endpoints**: Updated to match backend API structure
3. **Services**: All services are providedIn: 'root', ready to inject
4. **Authentication**: Token persistence handled in StorageService

## Error Handling

All services catch and handle errors:
- Network errors
- Timeout errors  
- Server errors (400, 401, 500, etc.)
- Response parsing errors

Errors are exposed via `error$()` signal in each service.

## Next Steps

1. Update components to use the new services
2. Test authentication flow (login/register)
3. Test API endpoints with real backend
4. Add error boundaries and loading indicators in components
5. Implement caching strategies if needed
6. Add request validation and sanitization

## Testing

Use the Swagger UI at https://ref3y-hamatoz-api.hf.space/swagger/index.html to test API endpoints directly before integration.

## Environment Configuration

For production, update the API_CONFIG base URL:
```typescript
// In api.config.ts
export const API_CONFIG = {
  baseUrl: 'https://your-production-api.com',
  // ... rest of config
};
```
