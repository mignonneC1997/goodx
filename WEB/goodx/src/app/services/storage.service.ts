import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

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
  public deviceStorage: Storage | null = null;
  public encrypted = '';

  constructor(public storage: Storage, private bookingAPI: BookingsService) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async getBookingData() {
    return await this.storage.get(STORAGE_KEY) || [];
  }

  async addBookingData(item: CalBooking) {
    const booking = await this.getBookingData();
    booking.push(item);
    return await this.storage.set(STORAGE_KEY, booking);
  }
}