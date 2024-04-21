import { TestBed } from '@angular/core/testing';

import { ToastmessageService } from './toaster.service';

describe('ToastmessageService', () => {
  let service: ToastmessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastmessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
