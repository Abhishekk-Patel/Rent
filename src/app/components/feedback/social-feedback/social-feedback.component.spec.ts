import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialFeedbackComponent } from './social-feedback.component';

describe('SocialFeedbackComponent', () => {
  let component: SocialFeedbackComponent;
  let fixture: ComponentFixture<SocialFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SocialFeedbackComponent]
    });
    fixture = TestBed.createComponent(SocialFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
