import { Injectable,  } from '@angular/core';

import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ToasterService {
  constructor(private toast: ToastController, private alertController: AlertController, public loadingController: LoadingController) { }

  public displayWarningToast = async (warning:any) =>{
    const toast = await this.toast.create({
      message: warning,
      duration: 5000,
      color: 'warning',
      position: 'top',
    });
    toast.present();
  }

  public displayErrorToast = async (error:any) => {
    const toast = await this.toast.create({
      message: error,
      duration: 5000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  public displayResponseToast = async (resp:any) => {
    const toast = await this.toast.create({
      message: resp,
      duration: 5000,
      color: 'primary',
      position: 'top'
    });
    toast.present();
  }

  public displaySuccessToast = async (resp:any) => {
    const toast = await this.toast.create({
      message: resp,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  public confirmBookingPrompt = async (msg:any) => {
    let response = false;
    const alert = await this.alertController.create({
    header: 'Booking',
      message: msg,
      backdropDismiss: false,
      cssClass: 'bookingPrompt',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            response = true;
            alert.dismiss(true);
          }
        },
        {
          text: 'No',
          handler: () => {
            response = false;
            alert.dismiss(true);
          }
        }
      ],
    });
    await alert.present();
    await alert.onDidDismiss().then((data) => {
      data.data = response;
    });
    return response;
  }
}
