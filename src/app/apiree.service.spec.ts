import { TestBed } from '@angular/core/testing';

import { ApireeService } from './apiree.service';

describe('ApireeService', () => {
  let service: ApireeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApireeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
