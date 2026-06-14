import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { UserOnboardingDto } from '../core/models/api.dtos';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences.html',
  styleUrls: ['./preferences.css'],
})
export class Preferences {
  currentStep = 1;
  totalSteps = 3;

  selectedCarType = '';
  selectedBrand = '';
  minBudget = 0;
  maxBudget = 10000000;
  isLoading = false;
  errorMessage = '';

  carTypes = [
    { id: 'Sedan', name: 'Sedan', icon: 'directions_car', hint: 'Daily comfort' },
    { id: 'SUV', name: 'SUV', icon: 'terrain', hint: 'Family and travel' },
    { id: 'Crossover', name: 'Crossover', icon: 'commute', hint: 'City plus space' },
    { id: 'Hatchback', name: 'Hatchback', icon: 'directions_car', hint: 'Compact city use' },
    { id: 'Coupe', name: 'Coupe', icon: 'sports_motorsports', hint: 'Sporty profile' },
    { id: 'Pickup', name: 'Pickup', icon: 'local_shipping', hint: 'Work and utility' },
    { id: 'Van', name: 'Van', icon: 'airport_shuttle', hint: 'More seats' },
    { id: 'Wagon', name: 'Wagon', icon: 'departure_board', hint: 'Practical storage' },
    { id: 'Convertible', name: 'Convertible', icon: 'roofing', hint: 'Open-top driving' },
    { id: 'Sports', name: 'Sports', icon: 'speed', hint: 'Performance first' },
    { id: 'Electric', name: 'Electric', icon: 'electric_car', hint: 'EV options' },
    { id: 'Luxury', name: 'Luxury', icon: 'diamond', hint: 'Premium feel' },
    { id: 'Family', name: 'Family', icon: 'family_restroom', hint: 'Room and safety' },
    { id: 'Off-road', name: 'Off-road', icon: 'landscape', hint: 'Rough roads' },
    { id: 'Commercial', name: 'Commercial', icon: 'business_center', hint: 'Business use' },
    { id: 'Minivan', name: 'Minivan', icon: 'emoji_transportation', hint: 'Large cabin' },
  ];

  brands = [
    { id: 'BMW', name: 'BMW', color: '#0066CC', logo: 'BMW' },
    { id: 'Mercedes', name: 'Mercedes', color: '#00A3E0', logo: 'MB' },
    { id: 'Audi', name: 'Audi', color: '#E60000', logo: 'A' },
    { id: 'Toyota', name: 'Toyota', color: '#EB0A1E', logo: 'T' },
    { id: 'Hyundai', name: 'Hyundai', color: '#0B5CAD', logo: 'H' },
    { id: 'Kia', name: 'Kia', color: '#C41230', logo: 'K' },
    { id: 'Nissan', name: 'Nissan', color: '#C3002F', logo: 'N' },
    { id: 'Chevrolet', name: 'Chevrolet', color: '#D4A017', logo: 'CH' },
    { id: 'Renault', name: 'Renault', color: '#F7C600', logo: 'R' },
    { id: 'Peugeot', name: 'Peugeot', color: '#1D4F91', logo: 'P' },
    { id: 'Honda', name: 'Honda', color: '#D71920', logo: 'H' },
    { id: 'Mitsubishi', name: 'Mitsubishi', color: '#E60012', logo: 'M' },
    { id: 'MG', name: 'MG', color: '#B11116', logo: 'MG' },
    { id: 'Chery', name: 'Chery', color: '#B5121B', logo: 'C' },
    { id: 'BYD', name: 'BYD', color: '#D21F2B', logo: 'BYD' },
    { id: 'Fiat', name: 'Fiat', color: '#A51E36', logo: 'F' },
    { id: 'Skoda', name: 'Skoda', color: '#4BA82E', logo: 'S' },
    { id: 'Volkswagen', name: 'Volkswagen', color: '#1F5AA6', logo: 'VW' },
    { id: 'Opel', name: 'Opel', color: '#F7C600', logo: 'O' },
    { id: 'Suzuki', name: 'Suzuki', color: '#004EA2', logo: 'S' },
    { id: 'Lada', name: 'Lada', color: '#345C9C', logo: 'L' },
    { id: 'Jeep', name: 'Jeep', color: '#6C6A50', logo: 'J' },
    { id: 'Land Rover', name: 'Land Rover', color: '#005A2B', logo: 'LR' },
    { id: 'Porsche', name: 'Porsche', color: '#D1495E', logo: 'P' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  selectCarType(id: string) {
    this.selectedCarType = this.selectedCarType === id ? '' : id;
  }

  selectBrand(id: string) {
    this.selectedBrand = this.selectedBrand === id ? '' : id;
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Choose one car type';
      case 2:
        return 'Choose one preferred brand';
      case 3:
        return 'Choose your budget range';
      default:
        return '';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Pick the body style you want to see more often';
      case 2:
        return 'Pick the brand you care about most right now';
      case 3:
        return 'Set a range that makes sense for your search';
      default:
        return '';
    }
  }

  nextStep() {
    this.errorMessage = '';
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      return;
    }

    this.completePreferences();
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skip() {
    this.router.navigate(['/cars']);
  }

  completePreferences() {
    const userId = Number(this.authService.currentUser()?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.errorMessage = 'Please sign in again.';
      setTimeout(() => this.router.navigate(['/sign-in']), 900);
      return;
    }

    if (this.maxBudget < this.minBudget) {
      this.errorMessage = 'Maximum budget must be greater than minimum budget.';
      return;
    }

    const payload: UserOnboardingDto = {
      userId,
      preferredBrand: this.selectedBrand || null,
      preferredCarType: this.selectedCarType || null,
      minBudget: this.minBudget,
      maxBudget: this.maxBudget,
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.submitOnboarding(payload).subscribe({
      next: () => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.authService.updateCurrentUser({ ...currentUser, isOnboarded: true });
        }
        this.isLoading = false;
        this.router.navigate(['/cars'], { queryParams: { mode: 'for-you' } });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Could not save your preferences.';
        this.isLoading = false;
      },
    });
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
