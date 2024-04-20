/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { takeUntil, ReplaySubject } from 'rxjs';
import { BookingsService } from 'src/app/services/bookings.service';
import { PatientsService } from 'src/app/services/patients.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public user = localStorage.getItem('user');
  public patientsCount = '';
  public bookingsCount = '';
  public isLoading = false;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private router: Router, private patientService: PatientsService, private bookingService: BookingsService) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.getPatients();
    this.getBookings();
  }

  public getPatients = () => {
    try {
      this.isLoading = true;
      const patientsApiCall = Capacitor.getPlatform() === 'web' ? this.patientService.patientsWeb() : this.patientService.patientsNative();
    
      patientsApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            this.patientsCount = JSON.stringify(response.data.length);
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            this.patientsCount = JSON.stringify(response.data.data.length);
          }  else {
            return;
          }
        },
        error: (err: ErrorEvent) => {
          this.isLoading = false;
        },
        complete: () => {
          return;
        }
      });
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  public getBookings = () => {
    try {
      const bookingsApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.bookingWeb() : this.bookingService.bookingsNative();
      bookingsApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            this.bookingsCount = JSON.stringify(response.data.length);
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            this.bookingsCount = JSON.stringify(response.data.data.length);  
          }  else {
            return
          }  
        },
        error: (err: ErrorEvent) => {
          this.isLoading = false;
        },
        complete: () => {
          return;
        }
      });
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  goToBookings() {
    this.router.navigate(['/bookings']);
  }

  goToPatients() {
    this.router.navigate(['/patient']);
  }
}

