/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';
import { IonModal, IonRouterOutlet } from '@ionic/angular';
import { ReplaySubject, takeUntil } from 'rxjs';

import { PatientsService } from '../../services/patients.service';
import { StorageService } from '../../services/storage.service';
import { ToastmessageService } from '../../services/toaster.service';

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
  @ViewChild('patientModal') patientModal!: IonModal;
  public presentingElement:any = null;
  public isLoading: boolean = false;
  public users!: User[];
  public temparray: any;
  public searchstring: any;
  public seachbar = false;
  public selectedPatient:any;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private patientsApi: PatientsService, private toasterService: ToastmessageService,
    private storageS: StorageService, private router: Router, private ionRouterOutlet: IonRouterOutlet) {
      this.presentingElement = ionRouterOutlet.nativeEl;
    }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getPatients();
  }

  public openAddModal = () => {
    this.patientModal.present();
  }

  public getPatients = () => {
    this.users = [];
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      // GET PATIENTS LIST - WEB VERSION
      this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.users = response.data;
          this.temparray = response.data;
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
       // GET PATIENTS LIST - APP VERSION
      this.patientsApi.patientsNative().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {  
          this.isLoading = false;
          if (response.data.status === 'OK') {
            this.users = response.data.data;
            this.temparray = response.data.data;
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

  public logout = () => {
    localStorage.clear(); // CLEAR STORAGE DATA
    this.router.navigate(['/login']);
  }

  public dashboard = () => {
    this.router.navigate(['/bookings']);
  }

  public viewProfile = (key: any) => {
    this.selectedPatient = key;
    this.openAddModal();
  }

  public searchuser = (ev:any) => {
    // SEARCH USER IN USERS LIST
    this.users = this.temparray;
    const user =  ev.target.value;
    if (user.trim() === '') {
      return;
    }

    // ONLY SHOW MATCHING USERS IN LIST
    this.users = this.users.filter((v: { name: string; }) => {
      if ((v.name.toLowerCase().indexOf(user.toLowerCase())) > -1) {
        return true;
      }
      return false;
    })
  }  

  public showSearch = () => {
    this.seachbar = true;
  }

  public back = () => {
    this.searchstring = '';
    this.seachbar = false;
    // SET USER LIST TO ORIGINAL LIST AFTER SEARCH
    this.users = this.temparray;
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.users = [];
    this.presentingElement = null;
    this.temparray = [];
    this.isLoading = false;
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
