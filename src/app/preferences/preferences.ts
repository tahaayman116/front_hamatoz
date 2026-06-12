import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences.html',
  styleUrls: ['./preferences.css']
})
export class Preferences {
  currentStep = 1;
  totalSteps = 3;
  
  selectedModels: string[] = [];
  selectedBrands: string[] = [];
  selectedDrivingStyles: string[] = [];

  models = [
    { id: 'sedan', name: 'Sedan', icon: 'directions_car' },
    { id: 'suv', name: 'SUV', icon: 'terrain' },
    { id: 'coupe', name: 'Coupe', icon: 'sports_motorsports' },
    { id: 'hatchback', name: 'Hatchback', icon: 'directions_car' },
    { id: 'truck', name: 'Truck', icon: 'local_shipping' },
    { id: 'convertible', name: 'Convertible', icon: 'beach_access' },
    { id: 'wagon', name: 'Wagon', icon: 'departure_board' },
    { id: 'van', name: 'Van', icon: 'delivery_dining' }
  ];

  brands = [
    { id: 'bmw', name: 'BMW', color: '#0066CC', logo: '⊙' },
    { id: 'mercedes', name: 'Mercedes', color: '#00A3E0', logo: '◆' },
    { id: 'porsche', name: 'Porsche', color: '#D1495E', logo: 'P' },
    { id: 'audi', name: 'Audi', color: '#E60000', logo: '◯◯' },
    { id: 'tesla', name: 'Tesla', color: '#E82127', logo: 'T' },
    { id: 'jaguar', name: 'Jaguar', color: '#004B87', logo: '◀' },
    { id: 'lamborghini', name: 'Lamborghini', color: '#FFD700', logo: '▲' },
    { id: 'ferrari', name: 'Ferrari', color: '#DC143C', logo: '馬' },
    { id: 'rolls-royce', name: 'Rolls-Royce', color: '#1F1F1F', logo: 'RR' },
    { id: 'bugatti', name: 'Bugatti', color: '#0080FF', logo: '●' }
  ];

  drivingStyles = [
    { id: 'performance', name: 'Performance', icon: 'speed' },
    { id: 'luxury', name: 'Luxury', icon: 'diamond' },
    { id: 'eco', name: 'Eco-Friendly', icon: 'eco' },
    { id: 'comfort', name: 'Comfort', icon: 'chair' },
    { id: 'off-road', name: 'Off-Road', icon: 'terrain' },
    { id: 'city', name: 'City Driving', icon: 'location_city' }
  ];

  constructor(private router: Router) {}

  toggleSelection(id: string, category: 'model' | 'brand' | 'style') {
    let selectedArray = this.selectedModels;
    if (category === 'brand') selectedArray = this.selectedBrands;
    if (category === 'style') selectedArray = this.selectedDrivingStyles;

    const index = selectedArray.indexOf(id);
    if (index > -1) {
      selectedArray.splice(index, 1);
    } else {
      selectedArray.push(id);
    }
  }

  isSelected(id: string, category: 'model' | 'brand' | 'style'): boolean {
    let selectedArray = this.selectedModels;
    if (category === 'brand') selectedArray = this.selectedBrands;
    if (category === 'style') selectedArray = this.selectedDrivingStyles;
    return selectedArray.includes(id);
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'What car models do you love?';
      case 2:
        return 'What are your favorite brands?';
      case 3:
        return 'What\'s your driving style?';
      default:
        return '';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Select the car types that interest you most';
      case 2:
        return 'Choose your favorite automotive brands';
      case 3:
        return 'Tell us about your driving preferences';
      default:
        return '';
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.completePreferences();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skip() {
    this.router.navigate(['/']);
  }

  completePreferences() {
    console.log('Preferences submitted:', {
      models: this.selectedModels,
      brands: this.selectedBrands,
      drivingStyles: this.selectedDrivingStyles
    });
    this.router.navigate(['/']);
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
