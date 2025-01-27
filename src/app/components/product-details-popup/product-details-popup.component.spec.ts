import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsPopupComponent } from './product-details-popup.component';

describe('ProductDetailsPopupComponent', () => {
  let component: ProductDetailsPopupComponent;
  let fixture: ComponentFixture<ProductDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductDetailsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
