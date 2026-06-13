import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AgencyService } from '../../core/services/agency.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserFavorites } from '../../core/models/favorites.model';
import { CreateListingDto, CreateOrUpdateAgencyProfileDto } from '../../core/models/api.dtos';

type ProfileTab = 'overview' | 'favorites' | 'agency-profile' | 'agency-listings' | 'new-listing';
type ListingType = 'Car' | 'SparePart';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
})
export class UserProfile implements OnInit {
  currentUser: User | null = null;
  userFavorites: UserFavorites | null = null;
  activeTab: ProfileTab = 'overview';
  isEditMode = false;
  isLoading = true;
  isSaving = false;
  feedbackMessage = '';
  errorMessage = '';
  stats = { totalCars: 0, totalParts: 0, total: 0 };

  editFormData = {
    name: '',
    email: '',
    phone: '',
    bio: '',
  };

  agencyProfileForm: CreateOrUpdateAgencyProfileDto = {
    agencyName: '',
    branchAddress: '',
    city: '',
    area: '',
    description: '',
    commercialRegistrationNumber: '',
    taxCardNumber: '',
  };

  listingForm: CreateListingDto = {
    type: 'Car',
    title: '',
    description: '',
    price: 1,
    brand: '',
    modelOrPartName: '',
    condition: 'Used',
    city: '',
    area: '',
    year: new Date().getFullYear(),
    kmsDriven: 0,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    assembly: 'Local',
    imagesUrlsText: '',
  };

  myListings: any[] = [];

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private agencyService: AgencyService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  get isAgency(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'agency';
  }

  get canAgencyPublish(): boolean {
    return this.isAgency && this.currentUser?.status === 'active';
  }

  get canEditAgencyProfile(): boolean {
    return this.isAgency;
  }

  loadUserProfile() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.currentUser = user;
    if (this.isAgency && user.status === 'pending') {
      this.activeTab = 'agency-profile';
    }
    this.loadEditForm();
    this.loadFavorites();
    this.loadAgencyData();
    this.isLoading = false;
  }

  setActiveTab(tab: ProfileTab) {
    this.activeTab = tab;
    this.feedbackMessage = '';
    this.errorMessage = '';
  }

  toggleEditMode() {
    if (this.isEditMode) {
      this.loadEditForm();
    }
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    if (!this.currentUser) return;

    this.isSaving = true;
    this.feedbackMessage = '';
    this.errorMessage = '';

    this.userService.updateProfile({
      name: this.editFormData.name,
      email: this.editFormData.email,
      phone: this.editFormData.phone,
    }).subscribe({
      next: (profile) => {
        const updatedUser: User = {
          ...this.currentUser!,
          name: profile.name || this.editFormData.name,
          email: profile.email || this.editFormData.email,
          phone: profile.phone || this.editFormData.phone,
          updatedAt: new Date(),
        };

        this.currentUser = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.isEditMode = false;
        this.isSaving = false;
        this.feedbackMessage = 'Profile details saved.';
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not save profile.');
        this.isSaving = false;
      },
    });
  }

  saveAgencyProfile() {
    if (!this.currentUser || !this.canEditAgencyProfile) return;

    this.isSaving = true;
    this.feedbackMessage = '';
    this.errorMessage = '';

    this.agencyService.updateProfile(this.agencyProfileForm).subscribe({
      next: () => {
        this.feedbackMessage = this.canAgencyPublish
          ? 'Agency profile saved.'
          : 'Agency profile submitted for admin approval.';
        this.isSaving = false;
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not save agency profile.');
        this.isSaving = false;
      },
    });
  }

  submitListing() {
    if (!this.currentUser || !this.canAgencyPublish) {
      this.errorMessage = 'Agency account must be approved before submitting listings.';
      return;
    }

    this.isSaving = true;
    this.feedbackMessage = '';
    this.errorMessage = '';

    const payload = this.buildListingPayload();
    const validationError = this.validateListingPayload(payload);
    if (validationError) {
      this.errorMessage = validationError;
      this.isSaving = false;
      return;
    }

    this.agencyService.createListing(payload).subscribe({
      next: () => {
        this.afterListingSubmitted();
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not submit listing.');
        this.isSaving = false;
      },
    });
  }

  removeFavoriteCar(carId: number) {
    if (!this.currentUser) return;
    if (this.favoritesService.removeFavoriteCar(this.currentUser.id, carId)) {
      this.loadFavorites();
    }
  }

  removeFavoritePart(partId: number) {
    if (!this.currentUser) return;
    if (this.favoritesService.removeFavoritePart(this.currentUser.id, partId)) {
      this.loadFavorites();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  private loadEditForm() {
    if (!this.currentUser) return;

    this.editFormData = {
      name: this.currentUser.name,
      email: this.currentUser.email,
      phone: this.currentUser.phone || '',
      bio: this.currentUser.bio || '',
    };
  }

  private loadFavorites() {
    if (!this.currentUser) return;
    this.userFavorites = this.favoritesService.getFavorites(this.currentUser.id);
    this.stats = this.favoritesService.getFavoriteStats(this.currentUser.id);
  }

  private loadAgencyData() {
    if (!this.currentUser || !this.isAgency) return;

    this.agencyProfileForm = {
      ...this.agencyProfileForm,
      agencyName: this.currentUser.name,
      branchAddress: this.currentUser.bio || '',
      city: '',
      area: '',
    };

    this.agencyService.getProfile().subscribe({
      next: (profile) => {
        this.agencyProfileForm = {
          agencyName: profile.agencyName || '',
          branchAddress: profile.branchAddress || '',
          city: profile.city || '',
          area: profile.area || '',
          description: profile.description || '',
          commercialRegistrationNumber: profile.commercialRegistrationNumber || '',
          taxCardNumber: profile.taxCardNumber || '',
        };
      },
      error: () => {},
    });

    this.agencyService.getMyListings().subscribe({
      next: (apiListings) => {
        this.myListings = apiListings;
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not load agency listings.');
      },
    });
  }

  private afterListingSubmitted() {
    this.feedbackMessage = 'Listing submitted for admin approval.';
    this.isSaving = false;
    this.activeTab = 'agency-listings';
    this.agencyService.getMyListings().subscribe({
      next: (apiListings) => {
        this.myListings = apiListings;
      },
      error: () => {},
    });
    this.resetListingForm();
  }

  private readableApiError(err: any, fallback: string): string {
    if (err?.status === 401) {
      return 'Unauthorized. Please sign in again.';
    }

    if (err?.details?.errors) {
      return Object.values(err.details.errors).flat().join(' ');
    }

    return err?.details?.message || err?.message || fallback;
  }

  private buildListingPayload(): CreateListingDto {
    return {
      type: this.normalizeListingType(this.listingForm.type),
      title: this.listingForm.title.trim(),
      description: this.listingForm.description.trim(),
      price: Number(this.listingForm.price) || 1,
      brand: this.listingForm.brand.trim(),
      modelOrPartName: this.listingForm.modelOrPartName.trim(),
      condition: this.listingForm.condition,
      city: this.listingForm.city.trim(),
      area: this.listingForm.area.trim(),
      year: Number(this.listingForm.year),
      kmsDriven: Number(this.listingForm.kmsDriven) || 0,
      fuel: this.listingForm.fuel.trim(),
      transmission: this.listingForm.transmission.trim(),
      assembly: this.listingForm.assembly.trim(),
      imagesUrlsText: this.listingForm.imagesUrlsText?.trim() || undefined,
    };
  }

  private normalizeListingType(type: string): ListingType {
    return type.toLowerCase() === 'sparepart' ? 'SparePart' : 'Car';
  }

  private validateListingPayload(payload: CreateListingDto): string {
    const requiredTextFields: Array<keyof CreateListingDto> = [
      'type',
      'title',
      'description',
      'brand',
      'modelOrPartName',
      'condition',
      'city',
      'area',
      'fuel',
      'transmission',
      'assembly',
    ];

    const missingField = requiredTextFields.find((field) => !String(payload[field] || '').trim());
    if (missingField) {
      return `Please fill ${missingField}.`;
    }

    if (!payload.year || payload.year < 1900 || payload.year > 2026) {
      return 'Year must be between 1900 and 2026.';
    }

    if (payload.kmsDriven < 0 || payload.kmsDriven > 99999999) {
      return 'Kilometers must be between 0 and 99,999,999.';
    }

    if (payload.price !== undefined && (payload.price < 0.01 || payload.price > 999999999)) {
      return 'Price must be between 0.01 and 999,999,999.';
    }

    return '';
  }

  private resetListingForm() {
    this.listingForm = {
      ...this.listingForm,
      type: 'Car',
      title: '',
      description: '',
      price: 1,
      brand: '',
      modelOrPartName: '',
      condition: 'Used',
      city: '',
      area: '',
      year: new Date().getFullYear(),
      kmsDriven: 0,
      fuel: 'Gasoline',
      transmission: 'Automatic',
      assembly: 'Local',
      imagesUrlsText: '',
    };
  }
}
