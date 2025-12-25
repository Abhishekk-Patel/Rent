
import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent {
  lastUpdated = 'December 25, 2025'; // adjust as required
  companyName = 'RENT Pvt Ltd';

  sections = [
    { id: 'acceptance',  title: 'Acceptance of Terms' },
    { id: 'changes',     title: 'Changes to Terms' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'accounts',    title: 'Accounts & Security' },
    { id: 'use',         title: 'Permitted & Prohibited Use' },
    { id: 'content',     title: 'Content & IP Ownership' },
    { id: 'fees',        title: 'Fees & Payments' },
    { id: 'disclaimer',  title: 'Disclaimers' },
    { id: 'liability',   title: 'Limitation of Liability' },
    { id: 'indemnity',   title: 'Indemnification' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing',   title: 'Governing Law & Dispute Resolution' },
    { id: 'contact',     title: 'Contact' }
  ];
}
