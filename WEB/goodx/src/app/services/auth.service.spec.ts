import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { timeout } from 'config';
import { environment } from 'src/environments/environment';

const RouterSpy = jasmine.createSpyObj(
  'Router',
  ['navigate']
);

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        { provide: ActivatedRoute,   useValue: ActivatedRoute    },
        { provide: Router, useValue: {}}
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send login request', () => {
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
      // Add more expectations based on your response
    });

    const req = httpMock.expectOne(environment.urlWeb + 'session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);

    // Mock successful response
    const mockResponse = { /* your mock response data */ };
    req.flush(mockResponse);
  });
});
