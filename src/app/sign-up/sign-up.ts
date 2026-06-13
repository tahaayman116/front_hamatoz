import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { RegisterRequestDto } from '../core/models/api.dtos';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {
  userType: 'Customer' | 'Agency' = 'Customer';
  formData = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
    agree: false
  };
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSignUp() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation - Check role is selected
    if (!this.userType || (this.userType !== 'Customer' && this.userType !== 'Agency')) {
      this.errorMessage = 'Please select an account type (Individual or Agency)';
      this.isLoading = false;
      return;
    }

    // Validation
    if (!this.formData.fullName.trim()) {
      this.errorMessage = 'Please enter your full name';
      this.isLoading = false;
      return;
    }

    if (!this.formData.phone.trim()) {
      this.errorMessage = 'Please enter your phone number';
      this.isLoading = false;
      return;
    }

    if (!this.formData.email.trim()) {
      this.errorMessage = 'Please enter your email';
      this.isLoading = false;
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.isLoading = false;
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    if (!this.formData.nationalId.trim()) {
      this.errorMessage = 'Please enter your national ID';
      this.isLoading = false;
      return;
    }

    if (this.formData.nationalId.length !== 14) {
      this.errorMessage = 'National ID must be exactly 14 characters';
      this.isLoading = false;
      return;
    }

    if (!this.formData.agree) {
      this.errorMessage = 'Please agree to the Terms of Service';
      this.isLoading = false;
      return;
    }

    // Prepare registration data matching API DTOs
    const registerData: RegisterRequestDto = {
      fullName: this.formData.fullName,
      phone: this.formData.phone,
      email: this.formData.email,
      password: this.formData.password,
      nationalId: this.formData.nationalId,
      role: this.userType
    };

    // Call API register
    this.authService.register(registerData).subscribe({
      next: (response) => {
        // Show appropriate message based on user type
        if (this.userType === 'Agency') {
          this.successMessage = `Account created! Pending admin approval. You can sign in after the admin approves it.`;
          this.isLoading = false;

          setTimeout(() => {
            this.router.navigate(['/sign-in']);
          }, 1800);
        } else {
          this.successMessage = `Account created successfully! Signing you in.`;

          this.authService.login(this.formData.email, this.formData.password).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/preferences']);
            },
            error: () => {
              this.isLoading = false;
              this.router.navigate(['/sign-in']);
            }
          });
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
