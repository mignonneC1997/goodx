import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';
import { ReplaySubject, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login.service';
import {  ToastmessageService } from '../../services/toaster.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  public loginForm!: FormGroup;
  public loginData = {
    "model": {
      "timeout": 259200
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
  isLoading: boolean = false;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private formBuilder: FormBuilder, private router: Router, private loginApi: LoginService, private toasterService: ToastmessageService,
    private storageS: StorageService, private loadingCtrl: LoadingController) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.isLoading = true;
    this.loginData = {
      "model": {
        "timeout": 259200
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
        this.loginApi.loginWeb(this.loginData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isLoading = false;
            console.log(response.data.uid);
            this.saveToken(response.data.uid);
            localStorage.setItem('userToken', response.data.uid);
            this.toasterService.displaySuccessToast('successfully logged in');
            this.router.navigate(['/dashboard']);
          },
          error: (err: ErrorEvent) => {
            this.isLoading = false;
            this.toasterService.displayErrorToast(err.error.status);
          },
          complete: () => {
            this.isLoading = false;
            return;
          }
        });
      } else {
        this.loginApi.loginNative(this.loginData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => { 
            this.isLoading = false; 
            if (response.data.status === 'OK') {
              console.log(response.data.data.uid);
              this.saveToken(response.data.data.uid);
              this.toasterService.displaySuccessToast('successfully logged in');
              this.router.navigate(['/dashboard']);
            } else {
              this.toasterService.displayErrorToast(response.data.status);
            }
          },
          error: (err: ErrorEvent) => {
            this.isLoading = false;
            this.toasterService.displayErrorToast(err.error.status);
          },
          complete: () => {
            this.isLoading = false;
            return;
          }
        });
      }
    }
  }

  public saveToken = (token: any) => {
    this.storageS.setToken('userToken', token).then(result => {
      return result;
      }).catch(err => {
        this.toasterService.displayErrorToast('Could not save token in storage');
       // this.logService.frontendLogging(4, `USER - ${this.useId} PLATFORM - ${Capacitor.getPlatform()} IN - saveUserData MESSAGE - ${JSON.stringify(err)} V-${this.appVersionn}`);
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.loginData = {
      "model": {
        "timeout": 259200
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
    this.isLoading = false;
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
