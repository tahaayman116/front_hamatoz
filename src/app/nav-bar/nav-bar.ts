import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get currentUser(): User | null {
    return this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}
