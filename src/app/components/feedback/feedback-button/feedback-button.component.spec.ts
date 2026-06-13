import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackButtonComponent } from './feedback-button.component';

describe('FeedbackButtonComponent', () => {
  let component: FeedbackButtonComponent;
  let fixture: ComponentFixture<FeedbackButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackButtonComponent]
    });
    fixture = TestBed.createComponent(FeedbackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
