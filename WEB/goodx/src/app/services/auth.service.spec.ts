import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { timeout } from '../../../config';
import { environment } from '../../environments/environment';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController; // create mock service for api call testing

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        { provide: ActivatedRoute,   useValue: ActivatedRoute },
        { provide: Router, useValue: {}}
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('AuthService should be created', () => {
    expect(service).toBeTruthy(); // service created successfully
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('AuthService should send login request', () => {
    const loginData = {
      "model": {
        "timeout": timeout
      },
      "auth": [
        [
          "password",
          {
            "username": 'test_username',
            "password": 'test_password'
          }
        ]
      ]
    };

    service.loginWeb(loginData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    // make API call to mock service
    const req = httpMock.expectOne(environment.urlWeb + 'session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);

    // Mock successful response
    const mockResponse = { /* your mock response data */ };
    req.flush(mockResponse);
  });
});
