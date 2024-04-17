/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarMode, CalendarComponent  } from 'ionic6-calendar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  public calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  }
  public viewTitle = '';
  public eventSource = [];

  constructor() { }

  ngOnInit() {
  }

  setToday(){
    this.calendar.currentDate = new Date();
    this.myCal.update();
  }

  calendarNext(){
    this.myCal.slideNext();
  }

  calendarBack(){
    this.myCal.slidePrev();
  }

}
