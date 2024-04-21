import { TestBed } from '@angular/core/testing';

import { HttpHeaderService } from './http-headers.service';

describe('HttpHeaderService', () => {
  let service: HttpHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpHeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
