import { Component } from '@angular/core';
import { BookingsService } from './services/bookings.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storageService: StorageService) {
    storageService.initStorage();
  }
}
