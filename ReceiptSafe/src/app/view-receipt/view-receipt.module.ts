import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewReceiptPageRoutingModule } from './view-receipt-routing.module';

import { ViewReceiptPage } from './view-receipt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewReceiptPageRoutingModule
  ],
  declarations: [ViewReceiptPage]
})
export class ViewReceiptPageModule {}
