import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('UserProductRatingComponent', () => {
  let component: UserProductRatingComponent;
  let fixture: ComponentFixture<UserProductRatingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProductRatingComponent]
    });
    fixture = TestBed.createComponent(UserProductRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
