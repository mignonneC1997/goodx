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
import { format } from 'date-fns';

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
    const selected = new Date(ev.selectedTime); // calendar selected time 
    this.formattedStart = format(ev.selectedTime, 'HH:mm, MMM d, yyyy'); // format booking start time

    selected.setHours(selected.getHours() + 2); // GMT+2 timezone
    this.newBooking.startTime = selected.toISOString();

    selected.setHours(selected.getHours() + 1);
    const endDate = selected.setHours(selected.getHours() - 2); // GMT-2 timezone for displaying booking end date

    this.formattedEnd = format(endDate, 'HH:mm, MMM d, yyyy'); // format booking end time
    this.newBooking.endTime = selected.toISOString();

    if (this.calendar.mode === 'day' || this.calendar.mode === 'week') { //open booking modal
      this.modal.present();
    }
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
