import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSearchAiComponent } from './product-search-ai.component';

describe('ProductSearchAiComponent', () => {
  let component: ProductSearchAiComponent;
  let fixture: ComponentFixture<ProductSearchAiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductSearchAiComponent]
    });
    fixture = TestBed.createComponent(ProductSearchAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
