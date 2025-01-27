import { TestBed } from '@angular/core/testing';

import { MyCartServiceService } from './my-cart-service.service';

describe('MyCartServiceService', () => {
  let service: MyCartServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyCartServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
