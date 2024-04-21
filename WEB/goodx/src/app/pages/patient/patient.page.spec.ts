import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { IonRouterOutlet } from '@ionic/angular';

import { PatientPage } from './patient.page';

describe('PatientPage', () => {
  let component: PatientPage;
  let fixture: ComponentFixture<PatientPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [PatientPage],
      providers: [{
        provide: IonRouterOutlet,
        useValue: {
          //add whatever property of IonRouterOutlet you're using in component class
          nativeEl: ""
        }
      }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('PatientPage should create', () => {
    expect(component).toBeTruthy();
  });

  it('PatientPage should initialize with seachbar false', () => {
    expect(component.seachbar).toBeFalse();
  });

  it('PatientPage should toggle seachbar when showSearch is called', () => {
    const initialSeachbarValue = component.seachbar;
    component.showSearch();
    expect(component.seachbar).toBe(!initialSeachbarValue);
  });
});
