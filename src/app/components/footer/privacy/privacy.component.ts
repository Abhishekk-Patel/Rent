
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
  lastUpdated = 'December 25, 2025'; // set dynamically if you prefer
  contactEmail = 'privacy@tryrentit.in';

  sections = [
    { id: 'overview',      title: 'Overview' },
    { id: 'data-we-collect', title: 'Data We Collect' },
    { id: 'how-we-use',    title: 'How We Use Data' },
    { id: 'sharing',       title: 'Data Sharing & Disclosure' },
    { id: 'cookies',       title: 'Cookies & Tracking' },
    { id: 'security',      title: 'Security' },
    { id: 'your-rights',   title: 'Your Rights' },
    { id: 'children',      title: 'Children’s Privacy' },
    { id: 'changes',       title: 'Changes to This Policy' },
    { id: 'contact',       title: 'Contact Us' }
  ];
  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
