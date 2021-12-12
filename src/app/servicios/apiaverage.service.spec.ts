import { TestBed } from '@angular/core/testing';

import { ApiaverageService } from './apiaverage.service';

describe('ApiaverageService', () => {
  let service: ApiaverageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiaverageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
