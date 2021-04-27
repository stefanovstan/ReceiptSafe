import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../services/receipt.service';

import { AlertController } from '@ionic/angular'

@Component({
  selector: 'app-view-receipt',
  templateUrl: './view-receipt.page.html',
  styleUrls: ['./view-receipt.page.scss'],
})
export class ViewReceiptPage implements OnInit {

  receipt = null
  showContent = false;

  constructor(private router: Router,
              public receiptService : ReceiptService,
              public fireAuth: AngularFireAuth,
              public authService: AuthService,
              private route : ActivatedRoute,
              public alertController : AlertController) { }

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.receipt = param
      }
    )
  }

  ionViewDidEnter() {
    if (this.authService.getUserID() != null) {
      this.showContent = true
    }
  }

  async deleteReceipt() {
    const alert = await this.alertController.create({
      header: 'Delete this receipt?',
      message: 'Are you sure you want to delete this receipt?',
      buttons: [{
        text: 'No',
        handler: (blah) => {
          // do nothing
        }
      }, {
        text: 'Yes',
        handler: (blah) => {
          this.receiptService.deleteReceipt(this.receipt.id)
          this.goBack();
        }
      }
    ]
    })

    await alert.present();
  }

  editReceipt() {
    this.router.navigate(["/tabs/edit-receipt", this.receipt])
  }

  goBack() {
    this.router.navigate(['/tabs/tab1'])
  }

}
