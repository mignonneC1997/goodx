import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonModal, LoadingController, IonRouterOutlet } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CalendarComponent, CalendarMode } from 'ionic6-calendar';
import { ReplaySubject, takeUntil } from 'rxjs';
import { BookingsService } from 'src/app/services/bookings.service';
import { LoginService } from 'src/app/services/login.service';
import { PatientsService } from 'src/app/services/patients.service';
import { CalBooking, StorageService } from 'src/app/services/storage.service';
import { ToastmessageService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: IonModal;
  @ViewChild('patientModal') patientModal!: IonModal;
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  presentingElement:any = null;
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
  ngOnInit(): void {
    this.buildForm();
  }

  async ionViewDidEnter() {
    this.getPatients();
    this.getBookingTypes();
    this.getBookingStatuses();
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

  async openUserModal() {
    await this.modal.dismiss();
    this.patientModal.present();
  }

  getPatients() {
    this.isLoading = true;
    if (Capacitor.getPlatform() === 'web') {
      this.patientsApi.patientsWeb().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.getBookings();
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
            this.getBookings();
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
            response.data.map((item: any, index: string | number) => {
              if (response.data[index].cancelled === false) {
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
  
                uniqueArray.push(toAdd);
              }
            });
            this.bookingSource = uniqueArray.filter((obj: { uid: any; }, index: any, self: any[]) =>
              index === self.findIndex((t) => (
                  t.uid === obj.uid
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
              response.data.data.map((item: any, index: string | number) => {
                if (response.data.data[index].cancelled === false) {
                  let startTime = new Date(response.data.data[index].start_time);
                  let futureDate:any = new Date(startTime);
                  futureDate.setMinutes(startTime.getMinutes() + response.data.data[index].duration);
                  futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
                  if (response.data.data[index].patient_uid !== null) {
                    patientObject = this.patientList.find((obj: { [x: string]: any; }) => obj['uid'] === response.data.data[index].patient_uid);
                    patient = patientObject.name;  
                  }
                  const toAdd: CalBooking = {
                    title: patient + ' - ' + response.data.data[index].reason,
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
    
                  uniqueArray.push(toAdd);
                }
              });
              this.bookingSource = uniqueArray.filter((obj: { uid: any; }, index: any, self: any[]) =>
                index === self.findIndex((t) => (
                    t.uid === obj.uid
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
    const title = hyphenIndex !== -1 ? ev.title.substring(hyphenIndex + 3) : ev.title;

    const foundObject = this.bookingSource.find((obj: { uid: number; }) => obj.uid === ev.uid);

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
    this.newBooking.uid = ev.uid;

    this.bookingForm.patchValue({reason: title, allDay: ev.allDay, selectedPatient:  this.selectedPatient, selectedBookingStatus: this.selectedBookingStatus, selectedBookingType: this.selectedBookingType, duration: this.selectedDuration});

    let futureDate:any = new Date(this.newBooking.startTime);
    futureDate.setMinutes(futureDate.getMinutes() + foundObject.duration);
    this.formattedEnd = format(futureDate, 'HH:mm, MMM d, yyyy');
    this.newBooking.endTime = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
    this.modal.present();
  }

  updateBooking() {
    if (this.selectedPatient.uid === null) {
      this.toasterService.displayErrorToast(`Can't update appointmnet. No patient selected`);
    } else {
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
      if (Capacitor.getPlatform() === 'web') {
        this.bookingService.updateBookingWeb(updateData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            let startTime = new Date(this.newBooking.startTime);
            let futureDate:any = new Date(startTime);
            futureDate.setMinutes(startTime.getMinutes() + duration);
            futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");

            const toAdd: CalBooking = {
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

            const index = this.bookingSource.findIndex((obj: { uid: any; }) => obj.uid === this.newBooking.uid);   
            // If the object is found, update its value
            if (index !== -1) {
              this.bookingSource[index] = toAdd;
            } else {
                // Handle case where object with the specified key is not found
                console.log("Object with custom key '" + this.newBooking.uid + "' not found.");
            }
            this.myCal.loadEvents();
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
            this.toasterService.displaySuccessToast('successfully updated booking');
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
        this.bookingService.updateBookingNative(updateData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.toasterService.displaySuccessToast('successfully updated booking');
            let startTime = new Date(this.newBooking.startTime);
            let futureDate:any = new Date(startTime);
            futureDate.setMinutes(startTime.getMinutes() + duration);
            futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");

            const toAdd: CalBooking = {
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

            const index = this.bookingSource.findIndex((obj: { uid: any; }) => obj.uid === this.newBooking.uid);   
            // If the object is found, update its value
            if (index !== -1) {
              this.bookingSource[index] = toAdd;
            } else {
                // Handle case where object with the specified key is not found
                console.log("Object with custom key '" + this.newBooking.uid + "' not found.");
            }
            this.myCal.loadEvents();
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
      }
    }
  }

  removeBooking() {
    if (this.selectedPatient.uid === null) {
      this.toasterService.displayErrorToast(`Can't remove appointmnet. No patient selected`);
    } else {
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
          return;
        } else {
          if (Capacitor.getPlatform() === 'web') {
            this.bookingService.removeBookingWeb(updateData).pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.bookingSource = this.bookingSource.filter((item: { uid: number; }) => item.uid !== this.newBooking.uid);
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
                this.getBookings();
                this.myCal.loadEvents();
                this.toasterService.displaySuccessToast('successfully deleted booking');
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
            this.bookingService.removeBookingNative(updateData).pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.toasterService.displaySuccessToast('successfully deleted booking');
                this.bookingSource = this.bookingSource.filter((item: { uid: number; }) => item.uid !== this.newBooking.uid);
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
                this.getBookings();
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
          }
        }
      });
    }
  }

  calendarNext(){
    this.myCal.slideNext();
  }

  calendarBack(){
    this.myCal.slidePrev();
  }

  selectedPatientObject(ev: any) {
    this.selectedPatient = ev.detail.value;
    this.newBooking.patient_uid = ev.detail.value.uid;
    this.bookingForm.patchValue({selectedPatient:  ev.detail.value, patient_uid: ev.detail.value.uid});
  }

  selectedStatusObject(ev: any) {
    this.selectedBookingStatus = ev.detail.value;
    this.newBooking.booking_status_uid = ev.detail.value.uid;
    this.bookingForm.patchValue({selectedBookingStatus:  ev.detail.value, booking_status_uid: ev.detail.value.uid});
  }

  selectedTypeObject(ev: any) {
    this.selectedBookingType = ev.detail.value;
    this.newBooking.booking_type_uid = ev.detail.value.uid;
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
    this.toasterService.confirmBookingPrompt('Confirm Booking').then((res) => {
      if (res === false) {
        return;
      } else {
        // SAVE BOOKING
        let uniqueArray: CalBooking[] = [];
        let patient: any = '';
        const duration = this.calculateDuration(this.newBooking.startTime, this.newBooking.endTime);
        this.bookingForm.patchValue({duration : duration });
        this.updateEvent = true;
        this.newBooking.start_time = this.bookingForm.get('start_time')?.value;
        this.newBooking.duration = duration;
        this.newBooking.booking_status_uid = this.bookingForm.get('booking_status_uid')?.value;
        this.newBooking.booking_type_uid = this.bookingForm.get('booking_type_uid')?.value;
        this.newBooking.patient_uid = this.bookingForm.get('patient_uid')?.value;
        this.newBooking.reason = this.bookingForm.get('reason')?.value;
        delete this.newBooking['startTime'];
        delete this.newBooking['endTime'];
        delete this.newBooking['allDay'];
        delete this.newBooking['title'];
        delete this.newBooking['uid'];
        if (this.bookingForm.valid) { // VALID FORM VALUES
          if (Capacitor.getPlatform() === 'web') {
            this.bookingService.makeBookingWeb(this.newBooking).pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.toasterService.displaySuccessToast('Successfull booked');
                let startTime = new Date(response.data.start_time);
                let futureDate:any = new Date(startTime);
                futureDate.setMinutes(startTime.getMinutes() + response.data.duration);
                futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
      
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
      
                const toAdd: CalBooking = {
                  title: patient + ' - ' + response.data.reason,
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
            this.bookingService.makeBookingNative(this.newBooking).pipe(takeUntil(this.destroy$)).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.toasterService.displaySuccessToast('Successfull booked');
                let startTime = new Date(response.data.data.start_time);
                let futureDate:any = new Date(startTime);
                futureDate.setMinutes(startTime.getMinutes() + response.data.data.duration);
                futureDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss");
      
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
                  uid: null
                }
      
                const toAdd: CalBooking = {
                  title: patient + ' - ' + response.data.data.reason,
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
          }

        } else {
          this.toasterService.displayErrorToast('Fill in all required fields');
        }
      }
    }).catch(err => {
      this.toasterService.displayErrorToast('Could not open booking prompt');
     // this.logService.frontendLogging(4, `USER - ${this.userID} PLATFORM - ${Capacitor.getPlatform()} IN - openCameraTips MESSAGE - ${err} V-${this.appVersion}`);
    });
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
