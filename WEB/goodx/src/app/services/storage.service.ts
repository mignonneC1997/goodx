import { Injectable } from '@angular/core';

import { BookingsService } from './bookings.service';

const STORAGE_KEY = 'mybookings';

export interface CalBooking {
  title: string,
  allDay: boolean,
  startTime: Date,
  endTime: Date,
  uid: number,
  reason: string,
  entity_uid: number, 
  start_time: string,
  patient_uid: number,
  booking_status_uid: number,
  booking_type_uid: number
  diary_uid: number,
  duration: number
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }
}