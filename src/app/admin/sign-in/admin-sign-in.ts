import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-sign-in.html',
  styleUrls: ['./admin-sign-in.css']
})
export class AdminSignIn {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSignIn() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email';
      this.isLoading = false;
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password';
      this.isLoading = false;
      return;
    }

    // Call API login
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const user = response.user;
        
        if (user.role?.toLowerCase() !== 'admin') {
          this.errorMessage = 'Only administrators can access this area';
          this.isLoading = false;
          return;
        }

        this.successMessage = 'Welcome back, Admin!';
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
