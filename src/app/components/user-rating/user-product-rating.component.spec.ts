import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProductRatingComponent } from './user-product-rating.component';


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
