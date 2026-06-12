/**
 * API Configuration for Hamatoz Backend
 */
export const API_CONFIG = {
  baseUrl: 'https://ref3y-hamatoz-api.hf.space',
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me',
    },
    users: {
      me: '/api/users/me',
      profile: '/api/users/me',
    },
    agency: {
      profile: '/api/agency/profile',
      createListing: '/api/agency/listings',
      myListings: '/api/agency/listings/mine',
      updateListing: '/api/agency/listings/{listingId}',
    },
    listings: {
      all: '/api/listings',
      detail: '/api/listings/{id}',
      create: '/api/agency/listings',
      update: '/api/agency/listings/{listingId}',
      similar: '/api/listings/{id}/similar',
      searchVisual: '/api/listings/search/visual',
      semanticSearch: '/api/listings/semantic-search',
    },
    chat: {
      conversations: '/api/chat/conversations',
      messages: '/api/chat/conversations/{conversationId}/messages',
      sendMessage: '/api/chat/conversations/{conversationId}/messages',
    },
    requests: {
      create: '/api/requests',
      mine: '/api/requests/mine',
    },
    admin: {
      agencies: {
        pending: '/api/admin/agencies/pending',
        review: '/api/admin/agencies/{agencyProfileId}/review',
      },
      listings: {
        pending: '/api/admin/listings/pending',
        review: '/api/admin/listings/{listingId}/review',
      },
      requests: {
        pending: '/api/admin/requests/pending',
        review: '/api/admin/requests/{requestId}/review',
      },
    },
    notifications: {
      all: '/api/notifications',
      markAsRead: '/api/notifications/{notificationId}/read',
    },
    test: {
      public: '/api/test/public',
      private: '/api/test/private',
      adminOnly: '/api/test/admin-only',
    },
  },
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
