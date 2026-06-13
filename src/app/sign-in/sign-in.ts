import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {
  formData = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSignIn() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (!this.formData.email.trim()) {
      this.errorMessage = 'Please enter your email';
      this.isLoading = false;
      return;
    }

    if (!this.formData.password) {
      this.errorMessage = 'Please enter your password';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.formData.email, this.formData.password).subscribe({
      next: (response) => {
        // Handle different response formats
        const user = response.user || response;
        const userRole = user?.role || response?.role;
        
        if (!user) {
          this.errorMessage = 'Invalid response from server';
          this.isLoading = false;
          return;
        }

        this.successMessage = `Welcome back!`;

        // Redirect based on user role and status
        setTimeout(() => {
          if (userRole === 'admin' || userRole === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (userRole === 'Agency' || userRole === 'agency') {
            if (user.status === 'pending') {
              alert('Complete your agency profile. Listings unlock after admin approval.');
            }
            this.router.navigate(['/profile']);
          } else {
            this.router.navigate(['/preferences']);
          }
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
