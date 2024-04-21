import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { IonRouterOutlet } from '@ionic/angular';

import { BookingsPage } from './bookings.page';

describe('BookingsPage', () => {
  let component: BookingsPage;
  let fixture: ComponentFixture<BookingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [BookingsPage],
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
    fixture = TestBed.createComponent(BookingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('BookingsPage should create', () => {
    expect(component).toBeTruthy();
  });

  it('BookingsPage should initialize with default calendar mode as "month"', () => {
    expect(component.calendar.mode).toEqual('month');
  });

  it('BookingsPage should initialize with isLoading false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('BookingsPage should initialize bookingForm with controls', () => {
    expect(component.bookingForm.get('entity_uid')).toBeTruthy();
    expect(component.bookingForm.get('diary_uid')).toBeTruthy();
    expect(component.bookingForm.get('booking_type_uid')).toBeTruthy();
    expect(component.bookingForm.get('booking_status_uid')).toBeTruthy();
    expect(component.bookingForm.get('start_time')).toBeTruthy();
    expect(component.bookingForm.get('duration')).toBeTruthy();
    expect(component.bookingForm.get('patient_uid')).toBeTruthy();
    expect(component.bookingForm.get('reason')).toBeTruthy();
    expect(component.bookingForm.get('cancelled')).toBeTruthy();
    expect(component.bookingForm.get('selectedPatient')).toBeTruthy();
    expect(component.bookingForm.get('selectedBookingType')).toBeTruthy();
    expect(component.bookingForm.get('selectedBookingStatus')).toBeTruthy();
    expect(component.bookingForm.get('allDay')).toBeTruthy();
  });
});
