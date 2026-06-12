import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PendingAgency } from '../../core/services/admin.service';

@Component({
  selector: 'app-agencies-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agencies-list.html',
  styleUrls: ['./agencies-list.css']
})
export class AgenciesList implements OnInit {
  @Output() changed = new EventEmitter<void>();

  agencies: PendingAgency[] = [];
  selectedAgency: PendingAgency | null = null;
  showDetailModal = false;
  rejectionReason = '';
  isLoading = false;
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAgencies();
  }

  loadAgencies() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getPendingAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.isLoading = false;
        this.changed.emit();
      },
      error: (err) => {
        this.agencies = [];
        this.errorMessage = this.readableError(err);
        this.isLoading = false;
        this.changed.emit();
      },
    });
  }

  openDetailModal(agency: PendingAgency) {
    this.selectedAgency = agency;
    this.showDetailModal = true;
    this.rejectionReason = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedAgency = null;
    this.rejectionReason = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  approveAgency() {
    this.reviewAgency(true);
  }

  rejectAgency() {
    if (!this.rejectionReason.trim()) {
      this.errorMessage = 'Please provide a rejection reason.';
      return;
    }

    this.reviewAgency(false);
  }

  getStatusBadgeClass(status: string): string {
    const normalized = status?.toLowerCase();

    if (normalized === 'approved' || normalized === 'verified') {
      return 'bg-green-500/20 text-green-300 border-green-500/50';
    }

    if (normalized === 'rejected') {
      return 'bg-red-500/20 text-red-300 border-red-500/50';
    }

    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
  }

  private reviewAgency(approve: boolean) {
    if (!this.selectedAgency) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.reviewAgency(String(this.selectedAgency.id), {
      approve,
      rejectionReason: approve ? undefined : this.rejectionReason,
    }).subscribe({
      next: () => {
        this.successMessage = approve ? 'Agency approved.' : 'Agency rejected.';
        this.isProcessing = false;
        this.loadAgencies();
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
      return 'Unauthorized. Please sign in with a real admin API account to load and review agencies.';
    }

    return err?.message || 'Could not load agencies from the API.';
  }
}
