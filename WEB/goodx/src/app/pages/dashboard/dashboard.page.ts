/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarMode, CalendarComponent  } from 'ionic6-calendar';
import { takeUntil, ReplaySubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoginService } from 'src/app/services/login.service';
import {  ToastmessageService } from 'src/app/services/toaster.service';
import { StorageService } from '../../services/storage.service';
import { IonRouterOutlet } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { format, parseISO } from 'date-fns';

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
  public eventSource = [];
  public newBooking:any = {
    title: '',
    allDay: false,
    startTime: null,
    endTime: null
  }
  public showStart = false;
  public showEnd = false;
  public formattedStart = '';
  public formattedEnd = '';
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private loginApi: LoginService, private toasterService: ToastmessageService,
    private storageS: StorageService, private router: Router, private ionRouterOutlet: IonRouterOutlet) {
      this.presentingElement = ionRouterOutlet.nativeEl;
    }

  ngOnInit() {
  }

  ionViewDidEnter() {
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

