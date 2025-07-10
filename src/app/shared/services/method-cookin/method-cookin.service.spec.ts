import { TestBed } from '@angular/core/testing';

import { MethodCookinService } from './method-cookin.service';

describe('MethodCookinService', () => {
  let service: MethodCookinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MethodCookinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
