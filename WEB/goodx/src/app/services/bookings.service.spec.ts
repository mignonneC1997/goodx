import { TestBed } from '@angular/core/testing';

import { BookingsService } from './bookings.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpHeaderService } from './http-headers.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        BookingsService,
        { provide: ActivatedRoute,   useValue: ActivatedRoute },
        { provide: Router, useValue: {}},
        IonRouterOutlet
      ],
    });
    service = TestBed.inject(BookingsService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
