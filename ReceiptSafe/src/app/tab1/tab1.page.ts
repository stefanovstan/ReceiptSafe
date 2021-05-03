import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../services/receipt.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  showLogIn = true;

  userid = null;
  usertype = null;
  private receipts: Observable<Receipt[]>;
  private pinned: Observable<Receipt[]>;

  constructor(private router: Router, public receiptService : ReceiptService, public fireAuth: AngularFireAuth, public authService: AuthService, private route : ActivatedRoute) { }

  ngOnInit(): void { }

  ionViewDidEnter() {
    if (this.authService.getUserID() != null) {
      this.pinned = this.receiptService.getPinned();
      this.receipts = this.receiptService.getUnpinned();
      this.showLogIn = false;
    }
  }

  viewReceipt(receipt) {
    this.router.navigate(["tabs/view-receipt", receipt])
  }

  pinReceipt(receipt) {
    console.log("PINNED");
    this.receiptService.pinReceipt(receipt);
  }

  unpinReceipt(receipt) {
    console.log("UNPINNED");
    this.receiptService.unpinReceipt(receipt);
  }

}
