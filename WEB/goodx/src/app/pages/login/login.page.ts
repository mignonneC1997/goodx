import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';;
import { ReplaySubject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
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

  constructor(private formBuilder: FormBuilder, private router: Router, private authApi: AuthService, private toasterService: ToastmessageService) {}

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
    try {
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
      const loginApiCall = Capacitor.getPlatform() === 'web' ? this.authApi.loginWeb(this.loginData) : this.authApi.loginNative(this.loginData);
      if (this.loginForm.valid) {
        loginApiCall.pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (Capacitor.getPlatform() === 'web') {
              // SAVE UID TO LOCALSTORAGE
              localStorage.setItem('userToken', response.data.uid);
              localStorage.setItem('user', this.loginForm.get('username')?.value);
              this.toasterService.displaySuccessToast('successfully logged in');
              this.router.navigate(['/dashboard']);
            } else if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
              if (response.data.status === 'OK') {
                // SAVE UID TO LOCALSTORAGE
                localStorage.setItem('userToken', response.data.data.uid);
                localStorage.setItem('user', this.loginForm.get('username')?.value)
                this.toasterService.displaySuccessToast('successfully logged in');
                this.router.navigate(['/dashboard']);
              } else {
                this.toasterService.displayErrorToast(response.data.status);
              }
            } else {
              return;
            }
          },
          error: (err: ErrorEvent) => {
            this.isLoading = false;
            if (err.error.status !== undefined) {
               if (err.error.status !== undefined) {
              this.toasterService.displayErrorToast(err.error.status);
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
            } else {
              this.toasterService.displayErrorToast(err.message);
            }
          },
          complete: () => {
            return;
          }
        });
      }
    } catch(err:any) {
      this.isLoading = false;
      throw new Error(err);
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
