import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";

import { EditReceiptPageRoutingModule } from './edit-receipt-routing.module';

import { EditReceiptPage } from './edit-receipt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditReceiptPageRoutingModule
  ],
  providers: [
    Camera,
    File,
  ],
  declarations: [EditReceiptPage]
})
export class EditReceiptPageModule {}
