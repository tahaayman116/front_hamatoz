/**
 * DTOs matching backend API exactly
 */

// Auth DTOs
export interface RegisterRequestDto {
  fullName: string;
  phone: string; // tel format
  email: string;
  password: string; // min 6
  nationalId: string; // exactly 14 characters
  role: string; // 'Customer' or 'Agency'
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface CurrentUserDto {
  userId: number;
  role: string;
  isVerified: boolean;
}

// Agency DTOs
export interface AgencyProfileDto {
  id: number;
  userId: number;
  agencyName: string;
  branchAddress: string;
  city: string;
  area: string;
  description?: string;
  commercialRegistrationNumber: string;
  taxCardNumber: string;
  verificationStatus: string;
  rejectionReason?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface CreateOrUpdateAgencyProfileDto {
  agencyName: string;
  branchAddress: string;
  city: string;
  area: string;
  description?: string;
  commercialRegistrationNumber: string;
  taxCardNumber: string;
}

// Listing DTOs
export interface ListingDto {
  id: number;
  ownerUserId: number;
  type: string; // 'Car', 'SparePart'
  status: string; // 'draft', 'pending', 'approved', 'rejected'
  title: string;
  description: string;
  price: number;
  brand: string;
  modelOrPartName: string;
  condition: string;
  city: string;
  area: string;
  imagesUrlsText?: string;
  rejectionReason?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  year?: number;
  kmsDriven?: number;
  fuel?: string;
  transmission?: string;
  assembly?: string;
}

export interface CreateListingDto {
  type: string; // required
  title: string; // required
  description: string; // required
  price?: number;
  brand: string; // required
  modelOrPartName: string; // required
  condition: string; // required
  city: string; // required
  area: string; // required
  year: number; // required, 1900-2026
  kmsDriven: number; // required, 0-99999999
  fuel: string; // required
  transmission: string; // required
  assembly: string; // required
  imagesUrlsText?: string;
}

export interface UpdateListingDto extends CreateListingDto {}

// User DTOs
export interface UserProfileDto {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequestDto {
  name: string; // required
  phone: string; // required
  email: string; // required
}

export interface UserOnboardingDto {
  userId: number;
  preferredBrand?: string | null;
  preferredCarType?: string | null;
  minBudget: number;
  maxBudget: number;
}

// Chat DTOs
export interface ConversationDto {
  id: number;
  requestId: number;
  customerUserId: number;
  agencyUserId: number;
  createdAtUtc: string;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderUserId: number;
  text: string;
  sentAtUtc: string;
}

export interface SendMessageDto {
  text: string; // required, max 1000
}

// Request DTOs
export interface RequestDto {
  id: number;
  listingId: number;
  customerUserId: number;
  status: string;
  message?: string;
  adminMessage?: string;
  createdAtUtc: string;
}

export interface CreateRequestDto {
  listingId: number; // required
  message?: string;
}

// Notification DTOs
export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

// Review DTOs
export interface ReviewListingDto {
  approve: boolean; // required
  rejectionReason?: string;
}

export interface ReviewRequestDto {
  approve: boolean; // required
  adminMessage?: string;
}

export interface AgencyVerificationDecisionDto {
  approve: boolean; // required
  rejectionReason?: string;
}
