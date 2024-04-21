import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing';

import { IonRouterOutlet } from '@ionic/angular';

import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        PatientsService,
        IonRouterOutlet
      ],
    });
    service = TestBed.inject(PatientsService);
  });

  it('PatientsService should be created', () => {
    expect(service).toBeTruthy();
  });
});
