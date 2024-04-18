/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CalendarMode, CalendarComponent  } from 'ionic6-calendar';
import { takeUntil, ReplaySubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoginService } from '../../services/login.service';
import {  ToastmessageService } from '../../services/toaster.service';
import { CalBooking, StorageService, } from '../../services/storage.service';
import { IonRouterOutlet, LoadingController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { BookingsService } from '../../services/bookings.service';
import { PatientsService } from '../../services/patients.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  presentingElement:any = null;
  public bookingForm!: FormGroup;
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
  public patientList:any = [];
  public bookingTypes:any = [];
  public bookingStatuses:any = [];
  public selectedBookingType:any = [];
  public selectedBookingStatus:any =[];
  public selectedPatient:any = null;
  public selectedDuration = null;
  isLoading: boolean = false;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private loginApi: LoginService, private toasterService: ToastmessageService, private formBuilder: FormBuilder,
    private storageS: StorageService, private router: Router, private ionRouterOutlet: IonRouterOutlet,
    private bookingService: BookingsService, private patientsApi: PatientsService, private loadingCtrl: LoadingController) {
      this.presentingElement = ionRouterOutlet.nativeEl;
    }

  async ngOnInit() {
    this.buildForm();
  }

  async ionViewDidEnter() {
    await this.getPatients();
    this.getBookings();
    this.getBookingStatuses();
    this.getBookingTypes();
  }

  buildForm() {
    this.bookingForm = this.formBuilder.group({
      entity_uid: [4, Validators.required],
      diary_uid: [4, Validators.required],
      booking_type_uid: [null, Validators.required],
      booking_status_uid: [null, Validators.required],
      start_time: [null, Validators.required],
      duration: [null, Validators.required],
      patient_uid: [null, Validators.required],
      reason: [null, Validators.required],
      cancelled: [false, Validators.required],
      selectedPatient: [null, Validators.required],
      selectedBookingType: [null, Validators.required],
      selectedBookingStatus: [null, Validators.required],
      allDay: [false, Validators.required],
    });
  }

  get errorControl() {
    return this.bookingForm.controls;
  }

  getPatients() {
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.patientList = response.data;
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
            this.patientList = response.data.data;
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

  getBookings() {
    this.isLoading = true;
    let uniqueArray: CalBooking[] = [];
    let patientObject: any =[];
    let patient: any = '';
      if (Capacitor.getPlatform() === 'web') {
        this.bookingService.bookingWeb().pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.tempBookingSource = response.data;
            response.data.map((item: any, index: string | number) => {
              let startTime = new Date(response.data[index].start_time);
              let futureDate:any = new Date(startTime);
              futureDate.setMinutes(startTime.getMinutes() + response.data[index].duration);
              futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
              if (response.data[index].patient_uid !== null) {
                patientObject = this.patientList.find((obj: { [x: string]: any; }) => obj['uid'] === response.data[index].patient_uid);
                patient = patientObject.name;  
              }
              const toAdd: CalBooking = {
                title: patient + ' - ' + response.data[index].reason,
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
            this.isLoading = false;
            this.toasterService.displayErrorToast(err.error.status);
          },
          complete: () => {
            return;
          }
        });
      } else {
        this.bookingService.bookingsNative().pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.data.status === 'OK') {
              this.tempBookingSource = response.data.data;
              response.data.map((item: any, index: string | number) => {
                let startTime = new Date(response.data[index].start_time);
                let futureDate:any = new Date(startTime);
                futureDate.setMinutes(startTime.getMinutes() + response.data[index].duration);
                futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");          
                if (response.data[index].patient_uid !== null) {
                  patientObject = this.patientList.find((obj: { [x: string]: any; }) => obj['uid'] === response.data[index].patient_uid);
                  patient = patientObject.name;  
                }
                const toAdd: CalBooking = {
                  title: response.data[index].reason + patient,
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

  getBookingStatuses() {
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      let uniqueArray: CalBooking[] = [];
      this.bookingService.bookingStatusWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.bookingStatuses = response.data;
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
      this.bookingService.bookingStatusNative().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data.status === 'OK') {
            this.bookingStatuses = response.data.data;
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

  getBookingTypes() {
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      let uniqueArray: CalBooking[] = [];
      this.bookingService.bookingTypesWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.bookingTypes = response.data;        
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
      this.bookingService.bookingTypesNative().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data.status === 'OK') {
            this.bookingTypes = response.data.data;  
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

  openAddModal() {
    this.updateEvent = false;
    this.bookingForm.patchValue({reason: '', allDay: false, selectedPatient:  null, selectedBookingStatus: null, selectedBookingType: null });
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

  onBookingSelected(ev:any) {
    this.updateEvent = true;
    const hyphenIndex = ev.title.indexOf(' - ');
    const title = hyphenIndex !== -1 ? ev.title.substring(hyphenIndex + 3) : ev.title

    const foundObject = this.tempBookingSource.find((obj: { reason: number; }) => obj.reason === title);
    this.selectedDuration = foundObject.duration;

    this.selectedPatient = this.patientList.find((obj: { uid: number; }) => obj.uid === foundObject.patient_uid);

    this.selectedBookingStatus = this.bookingStatuses.find((obj: { uid: number; }) => obj.uid === foundObject.booking_status_uid);

    this.selectedBookingType = this.bookingTypes.find((obj: { uid: number; }) => obj.uid === foundObject.booking_type_uid);

    this.formattedStart = format(ev.startTime, 'HH:mm, MMM d, yyyy'); // format booking start time
    this.newBooking.startTime = format(ev.startTime, "yyyy-MM-dd'T'HH:mm:ss"); // add start date to new book

    this.newBooking.title = title;
    ev.viewTitle = title;
    this.newBooking.reason = ev.reason;
    this.newBooking.allDay = ev.allDay;

    this.bookingForm.patchValue({reason: title, allDay: ev.allDay, selectedPatient:  this.selectedPatient, selectedBookingStatus: this.selectedBookingStatus, selectedBookingType: this.selectedBookingType});

    let futureDate:any = new Date(this.newBooking.startTime);
    futureDate.setMinutes(futureDate.getMinutes() + foundObject.duration);
    this.formattedEnd = format(futureDate, 'HH:mm, MMM d, yyyy');
    this.newBooking.endTime = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
    this.modal.present();
  }

  updateBooking() {
   // console.log(this.newBooking);
  }

  calendarNext(){
    this.myCal.slideNext();
  }

  calendarBack(){
    this.myCal.slidePrev();
  }

  selectedPatientObject(ev: any) {
    this.selectedPatient = ev.detail.value;
    this.bookingForm.patchValue({selectedPatient:  ev.detail.value, patient_uid: ev.detail.value.uid});
  }

  selectedStatusObject(ev: any) {
    this.selectedBookingStatus = ev.detail.value;
    this.bookingForm.patchValue({selectedBookingStatus:  ev.detail.value, booking_status_uid: ev.detail.value.uid});
  }

  selectedTypeObject(ev: any) {
    this.selectedBookingType = ev.detail.value;
    this.bookingForm.patchValue({selectedBookingType:  ev.detail.value, booking_type_uid: ev.detail.value.uid});
  }

  calculateDuration(startDate:any, endDate:any) {
    // Convert the dates to Date objects if they are not already
    const start:any = new Date(startDate);
    const end:any = new Date(endDate);
    
    // Calculate the difference in milliseconds
    const differenceMs = end - start;

    // Return an object with the duration components
    const minutes = Math.floor(differenceMs / (1000 * 60));
    return minutes;
  }

  scheduleBooking() {
    // SAVE BOOKING
    let uniqueArray: CalBooking[] = [];
    let patient: any = '';
    const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
    this.bookingForm.patchValue({duration : duration, start_time: this.newBooking.startTime });
    this.updateEvent = true;
    if (this.bookingForm.valid) { // VALID FORM VALUES
      this.bookingService.makeBookingWeb(this.newBooking).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toasterService.displaySuccessToast('Successfull booked');
          let startTime = new Date(response.data.start_time);
          let futureDate:any = new Date(startTime);
          futureDate.setMinutes(startTime.getMinutes() + response.data.duration);
          futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");

          const toAdd: CalBooking = {
            title: patient + ' - ' + response.data.reason,
            allDay: false,
            startTime: new Date(response.data.start_time),
            endTime: new Date(futureDate),
          }

          uniqueArray.push(toAdd);
          this.bookingSource.push(toAdd);
          this.myCal.loadEvents();
        },
        error: (err: ErrorEvent) => {
          this.isLoading = false;
          this.toasterService.displayErrorToast(err.error.status);
        },
        complete: () => {
          this.isLoading = false;
          this.modal.dismiss()
          return;
        }
      });
    } else {
      this.toasterService.displayErrorToast('Fill in all required fields');
    }
  }

  logout() {
    this.storageS.clearData();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  patients() {
    this.router.navigate(['/patient']);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.presentingElement = null;
    this.calendar = {
      mode: 'month' as CalendarMode,
      currentDate: new Date()
    }
    this.viewTitle = '';
    this.bookingSource = [];
    this.tempBookingSource = []
    this.newBooking = {
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
    this.updateEvent = false;
    this.showStart = false;
    this.showEnd = false;
    this.formattedStart = '';
    this.formattedEnd = '';
    this.patientList = [];
    this.bookingTypes = [];
    this.bookingStatuses = [];
    this.selectedBookingType = [];
    this.selectedBookingStatus =[];
    this.selectedPatient = null;
    this.selectedDuration = null;
    this.isLoading = false;
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

