import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  onSignIn() {
    console.log('Sign in with', this.formData);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
