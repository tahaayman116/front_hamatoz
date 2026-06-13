import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PendingListing } from '../../core/services/admin.service';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.css']
})
export class PostsList implements OnInit {
  @Output() changed = new EventEmitter<void>();

  listings: PendingListing[] = [];
  filteredListings: PendingListing[] = [];
  filterType: 'all' | 'car' | 'sparepart' = 'all';
  selectedListing: PendingListing | null = null;
  showDetailModal = false;
  rejectionReason = '';
  isLoading = false;
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getPendingListings().subscribe({
      next: (listings) => {
        this.listings = listings;
        this.applyFilter();
        this.isLoading = false;
        this.changed.emit();
      },
      error: (err) => {
        this.listings = [];
        this.filteredListings = [];
        this.errorMessage = this.readableError(err);
        this.isLoading = false;
        this.changed.emit();
      },
    });
  }

  applyFilter() {
    if (this.filterType === 'all') {
      this.filteredListings = this.listings;
      return;
    }

    this.filteredListings = this.listings.filter((listing) => {
      const type = listing.type?.toLowerCase();
      return this.filterType === 'sparepart'
        ? type === 'sparepart' || type === 'part'
        : type === this.filterType;
    });
  }

  openDetailModal(listing: PendingListing) {
    this.selectedListing = listing;
    this.showDetailModal = true;
    this.rejectionReason = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedListing = null;
    this.rejectionReason = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  approveListing() {
    this.reviewListing(true);
  }

  rejectListing() {
    if (!this.rejectionReason.trim()) {
      this.errorMessage = 'Please provide a rejection reason.';
      return;
    }

    this.reviewListing(false);
  }

  getStatusBadgeClass(status: string): string {
    const normalized = status?.toLowerCase();

    if (normalized === 'approved') {
      return 'bg-green-500/20 text-green-300 border-green-500/50';
    }

    if (normalized === 'rejected') {
      return 'bg-red-500/20 text-red-300 border-red-500/50';
    }

    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
  }

  private reviewListing(approve: boolean) {
    if (!this.selectedListing) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.reviewListing(String(this.selectedListing.id), {
      approve,
      rejectionReason: approve ? undefined : this.rejectionReason,
    }).subscribe({
      next: () => {
        this.successMessage = approve ? 'Listing approved.' : 'Listing rejected.';
        this.isProcessing = false;
        this.loadListings();
        setTimeout(() => this.closeDetailModal(), 700);
      },
      error: (err) => {
        this.errorMessage = this.readableError(err);
        this.isProcessing = false;
      },
    });
  }

  private readableError(err: any): string {
    if (err?.status === 401) {
      return 'Unauthorized. Please sign in with an admin account to load and review listings.';
    }

    return err?.message || 'Could not load listings.';
  }
}
