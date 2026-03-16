import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './parts.html',
  styleUrls: ['./parts.css'],
})
export class Parts {
  searchQuery = '';
  selectedFilters = {
    exactFit: false,
    oemCertified: false,
  };
  priceRange = { min: 0, max: 5000 };
  selectedBrand = 'all';

  categories = [
    { name: 'Engine', icon: 'settings_input_component' },
    { name: 'Brakes', icon: 'album' },
    { name: 'Suspension', icon: 'toys' },
    { name: 'Tires', icon: 'tire_repair' },
    { name: 'Batteries', icon: 'battery_charging_full' },
    { name: 'Lighting', icon: 'lightbulb' },
    { name: 'Body', icon: 'minor_crash' },
    { name: 'Electronics', icon: 'developer_board' },
  ];

  parts = [
    {
      id: 1,
      name: 'High-Performance Brake Pads',
      category: 'Braking System',
      compatibility: 'Fits: Porsche 911, Audi R8',
      badge1: 'New',
      badge2: 'OEM',
      info: 'Genuine Brembo Spare',
      icon: 'verified',
      price: 459.0,
      image: 'https://via.placeholder.com/400x300?text=Brake+Pads',
    },
    {
      id: 2,
      name: 'Matrix LED Headlight Assembly',
      category: 'Lighting',
      compatibility: 'Fits: BMW 5 Series (2023+)',
      badge1: 'Limited',
      badge2: null,
      info: 'In Stock: 2 Units',
      icon: 'inventory',
      price: 1299.0,
      image: 'https://via.placeholder.com/400x300?text=LED+Headlight',
    },
    {
      id: 3,
      name: 'Performance V8 Engine Block',
      category: 'Powertrain',
      compatibility: 'Fits: Ford Mustang GT',
      badge1: 'Certified',
      badge2: null,
      info: 'Warranty: 12 Months',
      icon: 'verified',
      price: 4850.0,
      image: 'https://via.placeholder.com/400x300?text=V8+Engine',
    },
    {
      id: 4,
      name: 'Stainless Steel Exhaust System',
      category: 'Exhaust',
      compatibility: 'Fits: Honda Civic Si',
      badge1: 'Performance',
      badge2: null,
      info: 'OEM Quality',
      icon: 'verified',
      price: 599.99,
      image: 'https://via.placeholder.com/400x300?text=Exhaust+System',
    },
    {
      id: 5,
      name: 'Ceramic Brake Rotors Set',
      category: 'Braking System',
      compatibility: 'Fits: Audi A4',
      badge1: 'New',
      badge2: 'OEM',
      info: 'High Performance',
      icon: 'verified',
      price: 349.5,
      image: 'https://via.placeholder.com/400x300?text=Brake+Rotors',
    },
    {
      id: 6,
      name: 'Air Suspension Struts',
      category: 'Suspension',
      compatibility: 'Fits: Mercedes E-Class',
      badge1: null,
      badge2: null,
      info: 'In Stock: 3 Units',
      icon: 'inventory',
      price: 899.99,
      image: 'https://via.placeholder.com/400x300?text=Suspension',
    },
  ];

  trustFeatures = [
    {
      icon: 'verified_user',
      title: 'Verified Sellers Only',
      description: 'Every merchant undergoes a multi-step background check.',
    },
    {
      icon: 'gavel',
      title: 'Moderated Listings',
      description: 'AI and experts manually review every part listed for accuracy.',
    },
    {
      icon: 'shield_verified',
      title: 'Authenticity Guaranteed',
      description: 'Buyer protection ensures quality and fair transactions.',
    },
  ];

  onSearch() {
    // Search logic would go here
    console.log('Searching for:', this.searchQuery);
  }

  clearFilters() {
    this.selectedFilters = { exactFit: false, oemCertified: false };
    this.priceRange = { min: 0, max: 5000 };
    this.selectedBrand = 'all';
  }
}
