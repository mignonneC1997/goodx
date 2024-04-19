/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntil, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() {}

  async ngOnInit() {
    //this.buildForm();
  }
}

