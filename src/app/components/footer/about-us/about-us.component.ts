import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {


  currentYear = new Date().getFullYear();

  values = [
    { icon: 'verified', title: 'Trust', desc: 'We operate with integrity and transparency in everything we do.' },
    { icon: 'bolt', title: 'Speed', desc: 'We connect fast, iterate faster, and never stop improving.' },
    { icon: 'handshake', title: 'Customer First', desc: 'We listen, learn, and build what truly helps our customers.' },
    { icon: 'public', title: 'Impact', desc: 'We aim for meaningful, measurable outcomes for society and business.' }
  ];

  team = [
    { name: 'CEO', role: 'CEO', photo: './assets/groom.png' },
    { name: 'CTO', role: 'CTO', photo: './assets/bride.png' },
    // { name: 'Rohan Verma', role: 'VP Engineering', photo: 'assets/team/rohan.jpg' },
    // { name: 'Neha Gupta', role: 'Design Lead', photo: 'assets/team/neha.jpg' },
  ];

  timeline = [
    { year: '2019', title: 'Founded', desc: 'RENT Pvt Ltd was established with a mission to simplify rentals.' },
    { year: '2020', title: 'First 10K Users', desc: 'Rapid growth driven by product-market fit and customer love.' },
    { year: '2022', title: 'Pan-India Launch', desc: 'Expanded operations across major cities in India.' },
    { year: '2025', title: 'Smart Rentals', desc: 'Launched AI-powered recommendations and dynamic pricing.' },
  ];
  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
