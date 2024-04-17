import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NgCalendarModule  } from 'ionic6-calendar';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    NgCalendarModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // Add CUSTOM_ELEMENTS_SCHEMA here
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
