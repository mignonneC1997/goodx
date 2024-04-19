import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';
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
   // this.deviceStorage = storage;
  }

  // set a key/value
  async setToken(key: string, value: any): Promise<any> {
    const rst = await this.encryptToken(value);
    if (rst !== undefined) {
      return rst;
    }
  }

  async clearData() {
    this.storage.remove('userToken');
  }

  async clearKey(key: string): Promise<any> {
    this.storage.remove(key);
  }

  // to get a key/value pair
  async getToken(key: string): Promise<any> {
    try {
      const encryptedData = await this.storage.get(key);
      if (encryptedData !== null) {
        const result = await this.decryptToken(encryptedData);
        if (result !== undefined) {
          return result;
        }
      }
      return null;
    } catch (reason) {
        return null;
    }
  }

  encryptToken(data: any) {
    try {
      this.storage.set('userToken', CryptoJS.AES.encrypt(JSON.stringify(data), 'userToken').toString());
      const rst = CryptoJS.AES.encrypt(JSON.stringify(data), 'userToken').toString();
      if (rst) {
        return rst;
      }
    } catch (err) {
    }
    return;
  }

  decryptToken(data: any) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, 'userToken');
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (err) {
    }
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