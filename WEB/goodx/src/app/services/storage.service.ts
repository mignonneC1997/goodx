import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public deviceStorage: Storage | null = null;
  public encrypted = '';

  constructor(public storage: Storage, ) {
    this.initStorage();
  }

  async initStorage() {
    const storage = await this.storage.create();
    this.deviceStorage = storage;
  }

  // set a key/value
  async setToken(key: string, value: any): Promise<any> {
    const rst = await this.encryptToken(value);
    console.log(rst);
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

}