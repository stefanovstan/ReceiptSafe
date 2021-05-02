import { Component, OnInit } from '@angular/core';

import { FormControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {

  public email: FormControl;

  private hasSentEmail = false;

	constructor(public authService: AuthService,
    private fireauth: AngularFireAuth,
    private router: Router,
    private toastController: ToastController,
    public loadingController: LoadingController,
    public alertController: AlertController) {
    this.email = new FormControl();
	}

  ngOnInit() { }

  async openLoader() {
    const loading = await this.loadingController.create({
      message: 'Please Wait ...',
      duration: 2000
    });
    await loading.present;
  }

  async closeLoading() {
    return await this.loadingController.dismiss();
  }

  recover() {
    this.fireauth.sendPasswordResetEmail(this.email.value)
    .then(data => {
      console.log(data);
      this.hasSentEmail = true;
      this.presentToast('Password reset email sent', 'bottom', 2000);
    })
    .catch(err => { console.log(err); })
  }

  async presentToast(message, position, duration) {
    const toast = await this.toastController.create({
      message, duration, position
    });
    toast.present();
  }
}
