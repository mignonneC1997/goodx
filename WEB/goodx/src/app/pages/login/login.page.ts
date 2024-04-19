import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';;
import { ReplaySubject, takeUntil } from 'rxjs';

import { LoginService } from '../../services/login.service';
import {  ToastmessageService } from '../../services/toaster.service';
import { timeout } from '../../../../config';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  public loginForm!: FormGroup;
  public loginData = {
    "model": {
      "timeout": timeout
    },
    "auth": [
      [
        "password",
        {
          "username": '',
          "password": ''
        }
      ]
    ]
  }
  public isLoading: boolean = false;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private formBuilder: FormBuilder, private router: Router, private loginApi: LoginService, private toasterService: ToastmessageService) {}

  ngOnInit() {
    this.buildForm();
  }

  public buildForm = () => {
    // BUILD REACTIVE FORM - VALIDATION
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public login = () => {
    this.isLoading = true;
    this.loginData = {
      "model": {
        "timeout": timeout
      },
      "auth": [
        [
          "password",
          {
            "username": this.loginForm.get('username')?.value,
            "password": this.loginForm.get('password')?.value
          }
        ]
      ]
    }
    if (this.loginForm.valid) {
      if (Capacitor.getPlatform() === 'web') {
        // LOGIN - WEB VERSION
        this.loginApi.loginWeb(this.loginData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            // SAVE UID TO LOCALSTORAGE
            localStorage.setItem('userToken', response.data.uid);
            this.toasterService.displaySuccessToast('successfully logged in');
            this.router.navigate(['/bookings']);
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
        // LOGIN - APP VERSION
        this.loginApi.loginNative(this.loginData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => { 
            this.isLoading = false; 
            if (response.data.status === 'OK') {
               // SAVE UID TO LOCALSTORAGE
              localStorage.setItem('userToken', response.data.data.uid);
              this.toasterService.displaySuccessToast('successfully logged in');
              this.router.navigate(['/bookings']);
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
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.loginData = {
      "model": {
        "timeout": timeout
      },
      "auth": [
        [
          "password",
          {
            "username": '',
            "password": ''
          }
        ]
      ]
    };
    this.loginForm.reset();
    this.isLoading = false;
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
