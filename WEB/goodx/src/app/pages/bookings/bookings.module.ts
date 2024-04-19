import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingsPageRoutingModule } from './bookings-routing.module';

import { BookingsPage } from './bookings.page';
import { NgCalendarModule } from 'ionic6-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BookingsPageRoutingModule,
    NgCalendarModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // Add CUSTOM_ELEMENTS_SCHEMA here
  ],
  declarations: [BookingsPage]
})
export class BookingsPageModule {}


