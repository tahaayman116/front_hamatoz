import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {
  userType: 'user' | 'agency' = 'user';
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false
  };
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  onSignUp() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.name.trim()) {
      this.errorMessage = 'Please enter your full name';
      return;
    }

    if (!this.formData.email.trim()) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (!this.formData.agree) {
      this.errorMessage = 'Please agree to the Terms of Service';
      return;
    }

    this.successMessage = `Account created successfully as ${this.userType}!`;
    console.log('Sign up as', this.userType, this.formData);
    
    // Navigate to preferences page after 1 second
    setTimeout(() => {
      this.router.navigate(['/preferences']);
    }, 1000);
  }
}
