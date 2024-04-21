import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';
import { IonModal, IonRouterOutlet } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CalendarComponent, CalendarMode } from 'ionic6-calendar';
import { ReplaySubject, takeUntil } from 'rxjs';

import { BookingsService } from '../../services/bookings.service';
import { PatientsService } from '../../services/patients.service';
import { ToastmessageService } from '../../services/toaster.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  @ViewChild('modalAdd') modalAdd!: IonModal;
  @ViewChild('modalEdit') modalEdit!: IonModal;
  @ViewChild('patientModal') patientModal!: IonModal;
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  public presentingElement:any = null;
  public bookingForm!: FormGroup;
  public calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  }
  public viewTitle = '';
  public bookingSource:any = [];
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
    cancelled: false,
    uid: null
  }
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
  public isLoading: boolean = false;
  public makeBooking = false;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private toasterService: ToastmessageService, private formBuilder: FormBuilder,
    private router: Router, ionRouterOutlet: IonRouterOutlet, private authApi: AuthService,
    private bookingService: BookingsService, private patientsApi: PatientsService) {
      this.presentingElement = ionRouterOutlet.nativeEl;
  }

  ngOnInit(): void {
    this.buildForm();
    // Subscribe to changes in the duration control
    this.bookingForm.get('duration')?.valueChanges.subscribe((value) => {   
      const endTime = this.calculateEndTime(this.newBooking.startTime, value);
      this.newBooking.endTime = endTime;
      this.endChanged(endTime);
    });
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.getPatients();
    this.getBookingTypes();
    this.getBookingStatuses();
  }

  public calculateEndTime = (startTime: any, durationMinutes: any) => {
    const startDate = new Date(startTime);
    // Calculate end time in milliseconds
    const endTimeMilliseconds = startDate.getTime() + (durationMinutes * 60000);
    const endDate = new Date(endTimeMilliseconds);
    // Convert end time to ISO 8601 format
    const endTimeISO = endDate.toISOString();
    return endTimeISO;
  }

  public buildForm = () => {
    // Build booking form - validation
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

  public getBookingStatuses = () => {
    try {
      const bookingStatusApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.bookingStatusWeb() : this.bookingService.bookingStatusNative();
      bookingStatusApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            this.bookingStatuses = response.data;  
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            this.bookingStatuses = response.data.data;  
          }  else {
            return
          }  
        },
        error: (err: ErrorEvent) => {
            if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
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

  public getBookingTypes = () => {
    try {
      const bookingStatusApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.bookingTypesWeb() : this.bookingService.bookingTypesNative();
      bookingStatusApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            this.bookingTypes = response.data;  
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            this.bookingTypes = response.data.data;  
          }  else {
            return
          }  
        },
        error: (err: ErrorEvent) => {
            if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
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

  public openAddModal = async () => {
    const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
    this.bookingForm.patchValue({reason: '', allDay: false, selectedPatient:  null, selectedBookingStatus: null, selectedBookingType: null, duration: duration });
    this.selectedPatient = null;
    await this.patientModal.dismiss();
    await this.modalEdit.dismiss();
    this.modalAdd.present();
  }

  public openUserModal = async () => {
    await this.modalAdd.dismiss();
    await this.modalEdit.dismiss();
    this.patientModal.present();
  }

  public getPatients = () => {
    try {
      const patientsApiCall = Capacitor.getPlatform() === 'web' ? this.patientsApi.patientsWeb() : this.patientsApi.patientsNative();
  
      patientsApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            this.patientList = response.data;  
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            this.patientList = response.data.data;  
          }  else {
            return;
          } 
        },
        error: (err: ErrorEvent) => {
            if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
        },
        complete: () => {
          this.getBookings();
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
      let tempArray: any[] = [];
      let patientObject: any =[];
      const bookingsApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.bookingWeb() : this.bookingService.bookingsNative();
      bookingsApiCall.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
            // ADD RESPONSE DATA TO BOOKING SOURCE TO DISPLAY IN CALENDAR
            response.data.map((item: any, index: string | number) => {
              if (response.data[index].cancelled === false) {
                // CREATE FUTURE TIME BY ADDING START TIME + DURATION
                let startTime = new Date(response.data[index].start_time);
                let futureDate:any = new Date(startTime);
                futureDate.setMinutes(startTime.getMinutes() + response.data[index].duration);
                futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
                if (response.data[index].patient_uid !== null) {
                  patientObject = this.patientList.find((obj: { [x: string]: any; }) => obj['uid'] === response.data[index].patient_uid); 
                }
                const toAdd = {
                  title: patientObject.name + ' - ' + response.data[index].reason,
                  allDay: false,
                  startTime: new Date(response.data[index].start_time),
                  endTime: new Date(futureDate),
                  uid: response.data[index].uid,
                  reason: response.data[index].reason,
                  entity_uid: response.data[index].entity_uid, 
                  start_time: response.data[index].start_time,
                  patient_uid: response.data[index].patient_uid,
                  booking_status_uid: response.data[index].booking_status_uid,
                  booking_type_uid: response.data[index].booking_type_uid,
                  diary_uid: response.data[index].diary_uid,
                  duration: response.data[index].duration
                }
  
                tempArray.push(toAdd);
              }
            });
            // REMOVE DUPLICATE BOOKINGS FROM ARRAY
            this.bookingSource = tempArray.filter((obj: { uid: any; }, index: any, self: any[]) =>
              index === self.findIndex((t) => (
                  t.uid === obj.uid
              ))
            );
          } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
            // ADD RESPONSE DATA TO BOOKING SOURCE TO DISPLAY IN CALENDAR
            response.data.data.map((item: any, index: string | number) => {
              if (response.data.data[index].cancelled === false) {
                // CREATE FUTURE TIME BY ADDING START TIME + DURATION
                let startTime = new Date(response.data.data[index].start_time);
                let futureDate:any = new Date(startTime);
                futureDate.setMinutes(startTime.getMinutes() + response.data.data[index].duration);
                futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
                if (response.data.data[index].patient_uid !== null) {
                  patientObject = this.patientList.find((obj: { [x: string]: any; }) => obj['uid'] === response.data.data[index].patient_uid);
                }
                const toAdd = {
                  title: patientObject.name + ' - ' + response.data.data[index].reason,
                  allDay: false,
                  startTime: new Date(response.data.data[index].start_time),
                  endTime: new Date(futureDate),
                  uid: response.data.data[index].uid,
                  reason: response.data.data[index].reason,
                  entity_uid: response.data.data[index].entity_uid, 
                  start_time: response.data.data[index].start_time,
                  patient_uid: response.data.data[index].patient_uid,
                  booking_status_uid: response.data.data[index].booking_status_uid,
                  booking_type_uid: response.data.data[index].booking_type_uid,
                  diary_uid: response.data.data[index].diary_uid,
                  duration: response.data.data[index].duration
                }
  
                tempArray.push(toAdd);
              }
            });
            // REMOVE DUPLICATE BOOKINGS FROM ARRAY
            this.bookingSource = tempArray.filter((obj: { uid: any; }, index: any, self: any[]) =>
              index === self.findIndex((t) => (
                  t.uid === obj.uid
              ))
            );
          }  else {
            return
          }  
        },
        error: (err: ErrorEvent) => {
            if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
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

  public onTimeSelected = (ev: {selectedTime: Date; events: any[]}) => {
    this.makeBooking = true;
    this.formattedStart = format(ev.selectedTime, 'HH:mm, MMM d, yyyy'); // format booking start time
    this.newBooking.startTime = format(ev.selectedTime, "yyyy-MM-dd'T'HH:mm:ss"); // add start date to new booking

    const later = ev.selectedTime.setHours(ev.selectedTime.getHours() + 1); // add 1 hour for booking
    this.formattedEnd = format(later, 'HH:mm, MMM d, yyyy'); // format booking end time
    this.newBooking.endTime = format(later, "yyyy-MM-dd'T'HH:mm:ss");  // add end date to new booking

    if (this.calendar.mode === 'day' || this.calendar.mode === 'week') { //open booking modal
      if (this.selectedPatient !== null) {
        this.modalEdit.present();
      } else {
        this.modalAdd.present();
      }
    }
  }

  public startChanged = (value:any) =>{
    this.newBooking.startTime = value;
    this.formattedStart = format(parseISO(value), 'HH:mm, MMM d, yyyy'); 
  }

  public endChanged = (value:any) => {
    this.newBooking.endTime = value;
    this.formattedEnd = format(parseISO(value), 'HH:mm, MMM d, yyyy');
  }

  public onBookingSelected = (ev:any) => {
    try {
      // REMOVE ' - ' FROM TITLE TO GET BOOKING REASON
      const hyphenIndex = ev.title.indexOf(' - ');
      const title = hyphenIndex !== -1 ? ev.title.substring(hyphenIndex + 3) : ev.title;

      // EXTRACT SELECTED BOOKING FROM BOOKINGSOURCE - FIND BOOKING DURATION, PATIENT, BOOKING STATUS, AND BOOKING TYPE
      const bookingObject = this.bookingSource.find((obj: { uid: number; }) => obj.uid === ev.uid);
      this.selectedDuration = bookingObject.duration;
      this.selectedPatient = this.patientList.find((obj: { uid: number; }) => obj.uid === bookingObject.patient_uid);
      this.selectedBookingStatus = this.bookingStatuses.find((obj: { uid: number; }) => obj.uid === bookingObject.booking_status_uid);
      this.selectedBookingType = this.bookingTypes.find((obj: { uid: number; }) => obj.uid === bookingObject.booking_type_uid);

      // SET NEW BOOKING VALUES BASED ON SELECTED BOOKING
      this.formattedStart = format(ev.startTime, 'HH:mm, MMM d, yyyy'); // format booking start time
      this.newBooking.startTime = format(ev.startTime, "yyyy-MM-dd'T'HH:mm:ss"); // add start date to new book
      this.newBooking.title = title;
      ev.viewTitle = title;
      this.newBooking.reason = ev.reason;
      this.newBooking.allDay = ev.allDay;
      this.newBooking.uid = ev.uid;

      this.bookingForm.patchValue({reason: title, allDay: ev.allDay, selectedPatient:  this.selectedPatient, selectedBookingStatus: this.selectedBookingStatus, selectedBookingType: this.selectedBookingType, duration: this.selectedDuration});

      let futureDate:any = new Date(this.newBooking.startTime);
      futureDate.setMinutes(futureDate.getMinutes() + bookingObject.duration);
      this.formattedEnd = format(futureDate, 'HH:mm, MMM d, yyyy'); // SET ENDDATE OF BOOKING BASED ON DURATION
      this.newBooking.endTime = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
      this.modalAdd.dismiss();
      this.patientModal.dismiss();
      this.modalEdit.present();
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  public updateBooking = () => {
    try {
      if (this.selectedPatient.uid === null) { // NO PATIENT IN SELECTED BOOKING
        this.toasterService.displayErrorToast(`Can't update appointmnet. No patient selected`);
      } else { // BOOKING DOES HAVE PATIENT
        const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
        this.bookingForm.patchValue({ 'patient_uid': this.selectedPatient.uid , 'booking_status_uid': this.selectedBookingStatus.uid, 'booking_type_uid': this.selectedBookingType.uid, 'start_time': new Date(this.newBooking.startTime), 'duration': duration })
        this.newBooking.duration = duration;
        const updateData = {
          uid: this.newBooking.uid,
          start_time: this.newBooking.startTime,
          duration: duration,
          patient_uid: this.bookingForm.get('patient_uid')?.value,
          reason: this.bookingForm.get('reason')?.value,
          booking_status_uid: this.bookingForm.get('booking_status_uid')?.value,
          booking_type_uid: this.bookingForm.get('booking_type_uid')?.value,
          cancelled: false
        }
  
        let startTime = new Date(this.newBooking.startTime);
        let futureDate:any = new Date(startTime);
        futureDate.setMinutes(startTime.getMinutes() + duration);
        futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
  
        const toAdd = {
          title: this.selectedPatient.name + ' - ' + this.bookingForm.get('reason')?.value,
          allDay: false,
          startTime: new Date(this.newBooking.startTime),
          endTime: new Date(futureDate),
          entity_uid: this.newBooking.entity_uid,
          diary_uid: this.newBooking.diary_uid,
          uid: this.newBooking.uid,
          start_time: this.newBooking.startTime,
          duration: updateData.duration,
          patient_uid: this.bookingForm.get('patient_uid')?.value,
          reason: this.bookingForm.get('reason')?.value,
          booking_status_uid: this.bookingForm.get('booking_status_uid')?.value,
          booking_type_uid: this.bookingForm.get('booking_type_uid')?.value
        }
  
        const bookingUpdateApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.updateBookingWeb(updateData) : this.bookingService.updateBookingNative(updateData);
        bookingUpdateApiCall.pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
              const index = this.bookingSource.findIndex((obj: { uid: any; }) => obj.uid === this.newBooking.uid);   
              // If the booking object is found, update its values with toAdd
              if (index !== -1) {
                this.bookingSource[index] = toAdd;
              } else {
                return;
              }
            } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
              const index = this.bookingSource.findIndex((obj: { uid: any; }) => obj.uid === this.newBooking.uid);   
              // If the booking object is found, update its values with toAdd
              if (index !== -1) {
                this.bookingSource[index] = toAdd;
              } else {
                return;
              }
            }  else {
              return;
            }     
          },
          error: (err: ErrorEvent) => {
            this.isLoading = false;
              if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
          },
          complete: () => {
            this.myCal.loadEvents();
            this.toasterService.displaySuccessToast('successfully updated booking');
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
            this.isLoading = false;
            this.modalEdit.dismiss();
          }
        });
      }
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  public removeBooking = () => {
    try {
      if (this.selectedPatient.uid === null) { // IF NO PATIENT IN SELECTED BOOKING
        this.toasterService.displayErrorToast(`Can't remove appointmnet. No patient selected`);
      } else { // BOOKING DOES HAVE PATIENT
        const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
        this.newBooking.duration = duration;
        this.bookingForm.patchValue({ 'patient_uid': this.selectedPatient.uid , 'booking_status_uid': this.selectedBookingStatus.uid, 'booking_type_uid': this.selectedBookingType.uid, 'start_time': new Date(this.newBooking.startTime), 'duration': duration })
        this.newBooking.duration = duration;
        const updateData = {
          uid: this.newBooking.uid,
          cancelled: true
        }
        this.toasterService.confirmBookingPrompt('Delete Booking').then((res) => {
          if (res === false) {
            // DO NOT DELETE BOOKING - USER SELECTED 'NO'
            return;
          } else {
            // DELETE BOOKING - USER SELECTED 'YES'
            const bookingDeleteApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.removeBookingWeb(updateData) : this.bookingService.removeBookingNative(updateData);
            bookingDeleteApiCall.pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
                  this.toasterService.displaySuccessToast('successfully deleted booking');
                } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
                    this.toasterService.displaySuccessToast('successfully deleted booking');
                }  else {
                  return;
                }     
              },
              error: (err: ErrorEvent) => {
                this.isLoading = false;
                  if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
              },
              complete: () => {
                this.myCal.loadEvents();
                this.getBookings();
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
                this.isLoading = false;
                this.modalEdit.dismiss()
                return;
              }
            });
          }
        });
      }
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  public calendarNext = () => {
    this.myCal.slideNext();
  }

  public calendarBack = () => {
    this.myCal.slidePrev();
  }

  public selectedPatientObject = (ev: any) => {
    // SELECTED PATIENT - ADD TO PATIENT OBJECT AND FORM
    this.selectedPatient = ev.detail.value;
    this.newBooking.patient_uid = ev.detail.value.uid;
    this.bookingForm.patchValue({selectedPatient:  ev.detail.value, patient_uid: ev.detail.value.uid});
  }

  public selectedStatusObject = (ev: any) => {
    // SELECTED BOOKING STATUS - ADD TO BOOKINGSTATUS OBJECT AND FORM
    this.selectedBookingStatus = ev.detail.value;
    this.newBooking.booking_status_uid = ev.detail.value.uid;
    this.bookingForm.patchValue({selectedBookingStatus:  ev.detail.value, booking_status_uid: ev.detail.value.uid});
  }

  public selectedTypeObject = (ev: any) => {
    // SELECTED BOOKING TYPE - ADD TO BOOKINGTYPE OBJECT AND FORM
    this.selectedBookingType = ev.detail.value;
    this.newBooking.booking_type_uid = ev.detail.value.uid;
    this.bookingForm.patchValue({selectedBookingType:  ev.detail.value, booking_type_uid: ev.detail.value.uid});
  }

  public calculateDuration = (startDate:any, endDate:any) => {
    // Convert the dates to Date objects
    const start:any = new Date(startDate);
    const end:any = new Date(endDate);
    
    // Calculate the difference in milliseconds
    const differenceMs = end - start;

    // Return duration - minutes form
    const minutes = Math.floor(differenceMs / (1000 * 60));
    return minutes;
  }

  public scheduleBooking = () => {
    try {
      const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
      this.bookingForm.patchValue({duration : duration });
      this.newBooking.duration = duration;
      this.newBooking.booking_status_uid = this.bookingForm.get('booking_status_uid')?.value;
      this.newBooking.booking_type_uid = this.bookingForm.get('booking_type_uid')?.value;
      this.newBooking.patient_uid = this.bookingForm.get('patient_uid')?.value;
      this.newBooking.reason = this.bookingForm.get('reason')?.value;
      this.bookingForm.patchValue({'start_time': this.newBooking.startTime})
      this.newBooking.start_time = this.bookingForm.get('start_time')?.value;
  
      if (this.bookingForm.valid) { // VALID FORM VALUES
        this.toasterService.confirmBookingPrompt('Confirm Booking').then((res) => {
          if (res === false) {
            // DO NOT SAVE BOOKING - USER SELECTED 'NO'
            return;
          } else {
            // SAVE BOOKING - USER SELECTED 'YES'
            const bookingAddApiCall = Capacitor.getPlatform() === 'web' ? this.bookingService.makeBookingWeb(this.newBooking) : this.bookingService.makeBookingNative(this.newBooking);
            bookingAddApiCall.pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.isLoading = false;
                if (Capacitor.getPlatform() === 'web' && response.status === 'OK') {
                  this.toasterService.displaySuccessToast('Successfull booked');
                  let startTime = new Date(response.data.start_time);
                  let futureDate:any = new Date(startTime);
                  futureDate.setMinutes(startTime.getMinutes() + response.data.duration);
                  futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
  
                  const toAdd = {
                    title: this.selectedPatient.name + ' - ' + response.data.reason,
                    allDay: false,
                    startTime: new Date(response.data.start_time),
                    endTime: new Date(futureDate),
                    uid: response.data.uid,
                    reason: response.data.reason,
                    entity_uid: response.data.entity_uid, 
                    start_time: response.data.start_time,
                    patient_uid: response.data.patient_uid,
                    booking_status_uid: response.data.booking_status_uid,
                    booking_type_uid: response.data.booking_type_uid,
                    diary_uid: response.data.diary_uid,
                    duration: response.data.duration
                  }
                  this.bookingSource.push(toAdd); // ADD NEW BOOKING TO BOOKINGS ARRAY
                  this.toasterService.displaySuccessToast('successfully deleted booking');
                } else if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && response.data.status === 'OK') {
                  this.toasterService.displaySuccessToast('Successfull booked');
                  let startTime = new Date(response.data.data.start_time);
                  let futureDate:any = new Date(startTime);
                  futureDate.setMinutes(startTime.getMinutes() + response.data.data.duration);
                  futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
        
                  const toAdd = {
                    title: this.selectedPatient.name + ' - ' + response.data.data.reason,
                    allDay: false,
                    startTime: new Date(response.data.data.start_time),
                    endTime: new Date(futureDate),
                    uid: response.data.data.uid,
                    reason: response.data.data.reason,
                    entity_uid: response.data.data.entity_uid, 
                    start_time: response.data.data.start_time,
                    patient_uid: response.data.data.patient_uid,
                    booking_status_uid: response.data.data.booking_status_uid,
                    booking_type_uid: response.data.data.booking_type_uid,
                    diary_uid: response.data.data.diary_uid,
                    duration: response.data.data.duration
                  }
                  this.bookingSource.push(toAdd); // ADD NEW BOOKING TO BOOKINGS ARRAY
                }  else {
                  return;
                }     
              },
              error: (err: ErrorEvent) => {
                this.isLoading = false;
                  if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
              },
              complete: () => {
                this.myCal.loadEvents(); // RELOAD CALENDAR
                this.isLoading = false;
                this.makeBooking = false;
                this.modalAdd.dismiss()
                return;
              }
            });
          }
        }).catch(err => {
          this.toasterService.displayErrorToast('Could not open booking prompt');
        });
  
      } else {
          this.toasterService.displayErrorToast('Fill in all required fields');
      }
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
    }
  }

  public logout = () => {
    this.authApi.logout();
  }

  public patients = () => {
    this.router.navigate(['/patient']);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.makeBooking = false;
    this.presentingElement = null;
    this.calendar = {
      mode: 'month' as CalendarMode,
      currentDate: new Date()
    }
    this.viewTitle = '';
    this.bookingSource = [];
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
      cancelled: false,
      uid: null,
    }
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
