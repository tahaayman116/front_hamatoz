import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, PendingRequest } from '../../core/services/admin.service';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests-list.html',
  styleUrls: ['./requests-list.css'],
})
export class RequestsList implements OnInit {
  @Output() changed = new EventEmitter<void>();

  requests: PendingRequest[] = [];
  selectedRequest: PendingRequest | null = null;
  adminMessage = '';
  isLoading = false;
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getPendingRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.isLoading = false;
        this.changed.emit();
      },
      error: (err) => {
        this.requests = [];
        this.errorMessage = this.readableError(err);
        this.isLoading = false;
        this.changed.emit();
      },
    });
  }

  selectRequest(request: PendingRequest) {
    this.selectedRequest = request;
    this.adminMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  approveRequest() {
    this.reviewRequest(true);
  }

  rejectRequest() {
    if (!this.adminMessage.trim()) {
      this.errorMessage = 'Please provide an admin message before denying the request.';
      return;
    }

    this.reviewRequest(false);
  }

  private reviewRequest(approve: boolean) {
    if (!this.selectedRequest) return;

    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.adminService
      .reviewRequest(String(this.selectedRequest.id), {
        approve,
        adminMessage: this.adminMessage.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.finishReview(approve);
        },
        error: (err) => {
          this.errorMessage = this.readableError(err);
          this.isProcessing = false;
        },
      });
  }

  private finishReview(approve: boolean, message?: string) {
    this.successMessage = message || (approve ? 'Request approved.' : 'Request denied.');
    this.selectedRequest = null;
    this.adminMessage = '';
    this.isProcessing = false;
    this.loadRequests();
  }

  private readableError(err: any): string {
    if (err?.status === 401) {
      return 'Unauthorized. Please sign in with an admin account to load and review requests.';
    }

    return err?.message || 'Could not load requests.';
  }
}
