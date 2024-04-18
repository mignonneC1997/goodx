/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';
import { ReplaySubject, takeUntil } from 'rxjs';
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

export class PatientPage implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public users!: User[];
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private patientsApi: PatientsService, private toasterService: ToastmessageService,
    private storageS: StorageService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getPatients();
  }

  getPatients() {
    this.users = [];
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.users = response.data;
        },
        error: (err: ErrorEvent) => {
          this.isLoading = false;
          this.toasterService.displayErrorToast(err.error.status);
        },
        complete: () => {
          return;
        }
      });
    } else {
      this.patientsApi.patientsNative().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {  
          this.isLoading = false;
          if (response.data.status === 'OK') {
            console.log(response.data.data);
            this.users = response.data.data;
          } else {
            this.toasterService.displayErrorToast(response.data.status);
          }
        },
        error: (err: ErrorEvent) => {
          this.isLoading = false;
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

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.users = [];
    this.isLoading = false;
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
