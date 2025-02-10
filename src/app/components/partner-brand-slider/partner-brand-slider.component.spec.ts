import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerBrandSliderComponent } from './partner-brand-slider.component';

describe('PartnerBrandSliderComponent', () => {
  let component: PartnerBrandSliderComponent;
  let fixture: ComponentFixture<PartnerBrandSliderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerBrandSliderComponent]
    });
    fixture = TestBed.createComponent(PartnerBrandSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
