import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminService, PendingAgency } from '../../core/services/admin.service';
import { AgenciesList } from '../agencies/agencies-list';
import { PostsList } from '../posts/posts-list';
import { RequestsList } from '../requests/requests-list';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AgenciesList, PostsList, RequestsList],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  activeSection = 'overview';
  isSidebarOpen = false;

  stats = {
    pendingAgencies: 0,
    pendingListings: 0,
    pendingRequests: 0,
  };
  pendingAgencies: PendingAgency[] = [];
  apiError = '';
  isLoadingStats = false;

  constructor(
    public authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoadingStats = true;
    this.apiError = '';
    let remainingRequests = 3;
    const finishRequest = () => {
      remainingRequests -= 1;
      if (remainingRequests === 0) {
        this.isLoadingStats = false;
      }
    };

    this.adminService.getPendingAgencies().subscribe({
      next: (agencies) => {
        this.pendingAgencies = agencies;
        this.stats.pendingAgencies = agencies.length;
        finishRequest();
      },
      error: (err) => {
        this.pendingAgencies = [];
        this.stats.pendingAgencies = 0;
        this.apiError = this.readableError(err);
        finishRequest();
      },
    });

    this.adminService.getPendingListings().subscribe({
      next: (listings) => {
        this.stats.pendingListings = listings.length;
        finishRequest();
      },
      error: (err) => {
        this.stats.pendingListings = 0;
        this.apiError = this.readableError(err);
        finishRequest();
      },
    });

    this.adminService.getPendingRequests().subscribe({
      next: (requests) => {
        this.stats.pendingRequests = requests.length;
        finishRequest();
      },
      error: (err) => {
        this.stats.pendingRequests = 0;
        this.apiError = this.readableError(err);
        finishRequest();
      },
    });
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.isSidebarOpen = false;
    this.loadStats();
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/admin/sign-in']);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private readableError(err: any): string {
    if (err?.status === 401) {
      return 'Admin API returned 401. Use a real admin backend account to load live approval queues.';
    }

    return err?.message || 'Could not load admin API data.';
  }
}
