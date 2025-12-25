
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit{
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
  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
