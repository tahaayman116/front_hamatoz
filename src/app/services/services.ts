import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements OnInit {
  services: Service[] = [
    {
      id: 1,
      title: 'Vehicle Marketplace',
      description: 'Buy and sell premium vehicles in a trusted, moderated marketplace environment.',
      icon: 'directions_car',
      features: [
        'Advanced search and filtering',
        'Real-time notifications',
        'Verified seller profiles',
        'Trusted marketplace experience'
      ]
    },
    {
      id: 2,
      title: 'Spare Parts Discovery',
      description: 'Discover rare and OEM components through our verified network of suppliers.',
      icon: 'settings_input_component',
      features: [
        'Part specifications database',
        'Supplier verification',
        'Listing categorization',
        'AI-assisted part discovery'
      ]
    },
    {
      id: 3,
      title: 'AI-Powered Matching',
      description: 'Smart matching system that connects you with relevant listings and sellers.',
      icon: 'auto_awesome',
      features: [
        'Image recognition technology',
        'Natural language search',
        'Smart recommendations',
        'AI-assisted filtering'
      ]
    },
    {
      id: 4,
      title: 'Secure Messaging',
      description: 'Direct communication with buyers and sellers through protected messaging.',
      icon: 'chat',
      features: [
        'Encrypted chat data',
        'Conversation history',
        'Protected communications',
        'Message notifications'
      ]
    },
    {
      id: 5,
      title: 'Exchange Platform',
      description: 'Streamlined vehicle exchange options with smart matching.',
      icon: 'published_with_changes',
      features: [
        'AI-assisted matching',
        'Smart exchange suggestions',
        'Transparent exchange flow',
        'Moderated exchange process'
      ]
    },
    {
      id: 6,
      title: 'Trust & Verification',
      description: 'Comprehensive verification and moderation for a safe marketplace.',
      icon: 'verified_user',
      features: [
        'Seller profile verification',
        'Listing review and approval',
        'Safety moderation controls',
        'Moderation support'
      ]
    }
  ];

  ngOnInit() {
    // Initialize component
  }
}
