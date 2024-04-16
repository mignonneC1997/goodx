import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import {  ToastmessageService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public loginForm!: FormGroup;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private formBuilder: FormBuilder, private router: Router, private loginApi: LoginService, private toasterService: ToastmessageService) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      const data = {
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
    
      this.loginApi.login(data).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.toasterService.displaySuccessToast('successfully logged in');
          this.router.navigate(['/home']);
        },
        error: (err: ErrorEvent) => {
          this.toasterService.displayErrorToast(err.error.status);
        },
        complete: () => {
          return;
        }
      });
    }
  }

}
