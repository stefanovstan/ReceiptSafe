import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../services/receipt.service';

import { first } from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  showLogIn = true;
  showSearch = false;

  userid = null;
  usertype = null;
  private receipts: Observable<Receipt[]>;
  private pinned: Observable<Receipt[]>;

  constructor(private router: Router, public receiptService : ReceiptService, public fireAuth: AngularFireAuth, public authService: AuthService, private route : ActivatedRoute) { }

  ngOnInit(): void { }

  ionViewDidEnter() {
    this.showLogIn = true;
    console.log(this.authService.getUserID());
    if (this.authService.getUserID() != null) {
      this.pinned = this.receiptService.getPinned();
      this.receipts = this.receiptService.getUnpinned();
      this.showLogIn = false;
      this.showSearch = true;
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

  async filterList(evt) {
    const searchTerm = evt.srcElement.value;
    console.log(searchTerm);

    this.receipts = this.receiptService.getFilteredReceipts(searchTerm);
    if(!searchTerm) {
      return;
    }

    return this.receipts;
  }

}
