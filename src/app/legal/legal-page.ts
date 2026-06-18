import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalDocument {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: LegalSection[];
}

const TERMS: LegalDocument = {
  eyebrow: 'Legal',
  title: 'Terms of Service',
  introduction:
    'These terms explain the rules for using Hamatoz to discover vehicles and spare parts, manage listings, and communicate through the platform.',
  sections: [
    {
      title: 'Using Hamatoz',
      paragraphs: [
        'You must provide accurate registration information and keep your account credentials secure. You are responsible for activity performed through your account.',
        'Hamatoz may restrict or suspend accounts that misuse the platform, provide misleading information, interfere with other users, or violate these terms.',
      ],
    },
    {
      title: 'Agency accounts and listings',
      paragraphs: [
        'Agency accounts require administrator approval before they can use agency features. Vehicle and spare-part listings may also require approval before they become publicly visible.',
        'Agencies are responsible for the accuracy, ownership, condition, price, images, and availability of every listing they submit. Approval by Hamatoz does not guarantee the quality or condition of an item.',
      ],
    },
    {
      title: 'Requests and conversations',
      paragraphs: [
        'Customers may request to contact an agency about a listing. A conversation becomes available after the request is approved. Users must keep messages relevant, respectful, and lawful.',
        'Do not send spam, harmful content, fraudulent offers, or sensitive payment information through chat.',
      ],
    },
    {
      title: 'Transactions and prices',
      paragraphs: [
        'Hamatoz helps users discover listings and communicate. Unless explicitly stated otherwise, Hamatoz is not the buyer, seller, payment processor, delivery provider, or party to an agreement between a customer and an agency.',
        'Prices and listing details can change. Users should verify the item, documents, payment terms, and delivery arrangements directly before completing any transaction.',
      ],
    },
    {
      title: 'Platform availability',
      paragraphs: [
        'We work to keep Hamatoz accurate and available, but features may change, pause, or contain errors. Search and recommendation results are discovery tools and may not always match a user\'s needs.',
        'These terms may be updated when the platform changes. Continued use after an update means you accept the revised terms.',
      ],
    },
  ],
};

const PRIVACY: LegalDocument = {
  eyebrow: 'Your data',
  title: 'Privacy Policy',
  introduction:
    'This policy explains what information Hamatoz processes, why it is used, and the choices available to you.',
  sections: [
    {
      title: 'Information we collect',
      paragraphs: [
        'When you create an account, we may process your name, email address, phone number, national ID, account role, and authentication information.',
        'We also process information you choose to provide, including onboarding preferences, favorites, agency profile details, listings, images, customer requests, and chat messages.',
      ],
    },
    {
      title: 'How information is used',
      paragraphs: [
        'We use information to create and secure accounts, approve agencies and listings, display marketplace content, provide favorites and conversations, and operate customer support and moderation workflows.',
        'Onboarding choices, searches, listing interactions, and submitted images may be used to provide personalized recommendations, semantic search, and visual-search results.',
      ],
    },
    {
      title: 'When information is shared',
      paragraphs: [
        'Relevant account and request information may be shown to administrators for review. After a customer request is approved, the relevant agency and customer can access their conversation.',
        'Public listing and agency information is visible to marketplace visitors. We do not intend to sell personal information.',
      ],
    },
    {
      title: 'Storage and security',
      paragraphs: [
        'Hamatoz uses authentication tokens and technical safeguards to protect access to account features. No internet service can guarantee absolute security, so users should use strong passwords and protect their devices.',
        'Information may be retained while an account is active and as needed for moderation, security, dispute handling, or platform operation.',
      ],
    },
    {
      title: 'Your choices',
      paragraphs: [
        'You may update available profile information and manage favorites through the platform. You may ask the project administrator to review, correct, or remove account information where technically and legally possible.',
        'This policy may be updated as Hamatoz develops. The latest version will remain available on this page.',
      ],
    },
  ],
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.css',
})
export class LegalPage {
  readonly document: LegalDocument;

  constructor(route: ActivatedRoute) {
    this.document = route.snapshot.data['document'] === 'privacy' ? PRIVACY : TERMS;
  }
}
