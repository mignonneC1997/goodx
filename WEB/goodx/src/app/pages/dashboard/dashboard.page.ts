/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarMode, CalendarComponent  } from 'ionic6-calendar';
import { takeUntil, ReplaySubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoginService } from 'src/app/services/login.service';
import {  ToastmessageService } from 'src/app/services/toaster.service';
import { CalBooking, StorageService, } from '../../services/storage.service';
import { IonRouterOutlet } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { BookingsService } from 'src/app/services/bookings.service';
import { PatientsService } from 'src/app/services/patients.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  presentingElement:any = null;
  public calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  }
  public viewTitle = '';
  public bookingSource:any = [];
  public tempBookingSource:any = []
  public newBooking:any = {
    title: '',
    allDay: false,
    startTime: null,
    endTime: null,
    entity_uid: 4,
    diary_uid: 4,
    booking_type_uid: null,
    booking_status_uid: null,
    start_time: null,
    duration: null,
    patient_uid: null,
    reason: null,
    cancelled: false
  }
  public updateEvent = false;
  public showStart = false;
  public showEnd = false;
  public formattedStart = '';
  public formattedEnd = '';
  public patientList = [];
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private loginApi: LoginService, private toasterService: ToastmessageService,
    private storageS: StorageService, private router: Router, private ionRouterOutlet: IonRouterOutlet,
    private bookingService: BookingsService, private patientsApi: PatientsService) {
      this.presentingElement = ionRouterOutlet.nativeEl;
    }

  async ngOnInit() {
   // this.bookingSource = await this.storageS.getBookingData();
  }

  ionViewDidEnter() {
    this.getPatients();
    this.getBookings();
  }

  getPatients() {
    if (Capacitor.getPlatform() === 'web') {
      this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.patientList = response.data;
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
            this.patientList = response.data.data;
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

    getBookings() {
      if (Capacitor.getPlatform() === 'web') {
        let uniqueArray: CalBooking[] = [];
        this.bookingService.bookingWeb().pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.tempBookingSource = response.data;
            response.data.map((item: any, index: string | number) => {
              let startTime = new Date(response.data[index].start_time);
              let futureDate:any = new Date(startTime);
              futureDate.setMinutes(startTime.getMinutes() + response.data[index].duration);
              futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
              const toAdd: CalBooking = {
                title: response.data[index].reason,
                allDay: false,
                startTime: new Date(response.data[index].start_time),
                endTime: new Date(futureDate),
              }

              uniqueArray.push(toAdd);
            });
            this.bookingSource = uniqueArray.filter((obj: { title: any; }, index: any, self: any[]) =>
              index === self.findIndex((t) => (
                  t.title === obj.title
              ))
            );
          },
          error: (err: ErrorEvent) => {
            this.toasterService.displayErrorToast(err.error.status);
          },
          complete: () => {
            return;
          }
        });
      } else {
        this.bookingService.bookingsNative().pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {  
            if (response.data.status === 'OK') {
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

  openAddModal() {
    this.updateEvent = false;
    this.modal.present();
  }

  onTimeSelected(ev: {selectedTime: Date; events: any[]}){
    this.formattedStart = format(ev.selectedTime, 'HH:mm, MMM d, yyyy'); // format booking start time
    this.newBooking.startTime = format(ev.selectedTime, "yyyy-MM-dd'T'HH:mm:ss"); // add start date to new booking

    const later = ev.selectedTime.setHours(ev.selectedTime.getHours() + 1); // add 1 hour for booking
    this.formattedEnd = format(later, 'HH:mm, MMM d, yyyy'); // format booking end time
    this.newBooking.endTime = format(later, "yyyy-MM-dd'T'HH:mm:ss");  // add end date to new booking

    if (this.calendar.mode === 'day' || this.calendar.mode === 'week') { //open booking modal
      this.modal.present();
    }
  }

  startChanged(value:any){
    this.newBooking.startTime = value;
    this.formattedStart = format(parseISO(value), 'HH:mm, MMM d, yyyy'); 
  }

  endChanged(value:any) {
    this.newBooking.endTime = value;
    this.formattedEnd = format(parseISO(value), 'HH:mm, MMM d, yyyy');
  }

  scheduleBooking() {
    const toAdd: CalBooking = {
      title: this.newBooking.title,
      allDay: this.newBooking.allDay,
      startTime: new Date(this.newBooking.startTime),
      endTime: new Date(this.newBooking.endTime)
    }
    this.bookingSource.push(toAdd);
    this.myCal.loadEvents();
    this.storageS.addBookingData(toAdd)

    this.newBooking = {
      title: '',
      allDay: false,
      startTime: null,
      endTime: null,
      reason: null
    }

    this.modal.dismiss()
  }

  onBookingSelected(ev:any) {
    this.updateEvent = true;

    const foundObject = this.tempBookingSource.find((obj: { reason: number; }) => obj.reason === ev.title);

    this.formattedStart = format(ev.startTime, 'HH:mm, MMM d, yyyy'); // format booking start time
    this.newBooking.startTime = format(ev.startTime, "yyyy-MM-dd'T'HH:mm:ss"); // add start date to new book

    this.newBooking.title = ev.title;
    ev.viewTitle = ev.title;
    this.newBooking.reason = ev.reason;
    this.newBooking.allDay = ev.allDay;

    let futureDate:any = new Date(this.newBooking.startTime);
    futureDate.setMinutes(futureDate.getMinutes() + foundObject.duration);
    this.formattedEnd = format(futureDate, 'HH:mm, MMM d, yyyy');
    this.newBooking.endTime = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
    this.modal.present();
  }

  updateBooking() {
    console.log(this.newBooking);
  }

  calendarNext(){
    this.myCal.slideNext();
  }

  calendarBack(){
    this.myCal.slidePrev();
  }

  logout() {
    this.storageS.clearData();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  patients() {
    this.router.navigate(['/patient']);
  }

}

