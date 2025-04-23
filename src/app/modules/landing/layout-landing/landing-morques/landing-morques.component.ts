import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-morques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-morques.component.html',
  styleUrl: './landing-morques.component.scss'
})
export class LandingMorquesComponent {
  lines = ['LATEST-NEWS:This portal is integrated with Karnataka State Government single sign-on (SSO). So we are requesting all the existing users, re-register once again to avail the service.  Services :  eFIR (Vehicle Theft Only), Complaint Registration, Document / Mobile phone Lost Registration, Senior Citizen Registration, Locked Home Registration services are available in Record Room Management System.   MESSAGE :  User is prohibited from uploading, posting, updating or sharing any content that is unlawful and misleading.'];
}
