import { Injectable,  } from '@angular/core';
import { ToastController, AlertController, LoadingController, IonicSafeString } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class ToastmessageService {
  constructor(private toast: ToastController, private alertController: AlertController, private route: Router,
    public loadingController: LoadingController, private sanitizer: DomSanitizer) { }

  async displayWarningToast(warning:any) {
    const toast = await this.toast.create({
      message: warning,
      duration: 5000,
      color: 'warning',
      position: 'top',
    });
    toast.present();
  }

  async displayErrorToast(error:any) {
    const toast = await this.toast.create({
      message: error,
      duration: 5000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  async displayResponseToast(resp:any) {
    const toast = await this.toast.create({
      message: resp,
      duration: 5000,
      color: 'credicoblue',
      position: 'top'
    });
    toast.present();
  }

  async displaySuccessToast(resp:any) {
    const toast = await this.toast.create({
      message: resp,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }
}