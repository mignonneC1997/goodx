/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { PatientsService } from 'src/app/services/patients.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastmessageService } from 'src/app/services/toaster.service';

interface User {
  entity_uid: number;
  id: number;
  debtor_uid: number;
  name: string;
  surname: string;
  initials: string;
  title: string;
  date_of_birth: string;
  mobile_no: string;
  gender: string;
  benefit_check: any; // You can update the type of this property as needed
  uid: number;
}

@Component({
  selector: 'app-patient',
  templateUrl: './patient.page.html',
  styleUrls: ['./patient.page.scss'],
})

export class PatientPage implements OnInit {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private patientsApi: PatientsService, private toasterService: ToastmessageService,
    private storageS: StorageService, private router: Router) { }
    public users!: User[];

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getPatients();
  }

  getPatients() {
  if (Capacitor.getPlatform() === 'web') {
    this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.users = response.data
      },
      error: (err: ErrorEvent) => {
        this.toasterService.displayErrorToast(err.error.status);
      },
      complete: () => {
        return;
      }
    });
  } else {
    this.patientsApi.patientsNative().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {  
        if (response.data.status === 'OK') {
          console.log(response);
        } else {
          this.toasterService.displayErrorToast(response.data.status);
        }
      },
      error: (err: ErrorEvent) => {
        this.toasterService.displayErrorToast(err.error.status);
      },
      complete: () => {
        return;
      }
    });
  }
  }


  logout() {
    this.storageS.clearData();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  dashboard() {
    this.router.navigate(['/dashboard']);
  }

}
