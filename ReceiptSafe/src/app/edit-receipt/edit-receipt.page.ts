import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../services/receipt.service';

import { File } from "@ionic-native/file/ngx";

import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { createWorker } from 'tesseract.js'

import { AlertController } from '@ionic/angular'

import firebase from 'firebase/app';
import 'firebase/storage';

@Component({
  selector: 'app-edit-receipt',
  templateUrl: './edit-receipt.page.html',
  styleUrls: ['./edit-receipt.page.scss'],
})
export class EditReceiptPage implements OnInit {
    worker: Tesseract.Worker;
    workerReady = false;

    updated_receipt_form: FormGroup;
    receipt: Receipt = {
      store_name: '',
      date: '',
      transcribed_receipt: '',
      total_cost: 0,
      photo_url: '',
      user_uid: '',
      id: ''
    }
    currentReceipt = null;
    imgURL = ""
    ocrResult = ""
    captureProgress = 0

    constructor(private router: Router,
                public receiptService : ReceiptService,
                public fireAuth: AngularFireAuth,
                public authService: AuthService,
                private route : ActivatedRoute,
                public alertController : AlertController,
                public formBuilder: FormBuilder,
                public camera: Camera,
                public file: File) {
                  this.loadWorker()
    }

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.currentReceipt = param
        console.log(this.currentReceipt)
      }
    )

    this.updated_receipt_form = this.formBuilder.group({
      store_name: new FormControl(this.currentReceipt.store_name, Validators.required),
      date: new FormControl(this.currentReceipt.date, Validators.required),
      transcribed_receipt: new FormControl(this.currentReceipt.transcribed_receipt, Validators.required),
      total_cost: new FormControl(this.currentReceipt.total_cost, Validators.required)
    });

    this.ocrResult = this.currentReceipt.transcribed_receipt;
    (<HTMLImageElement>document.getElementById("receipt_image")).src = this.currentReceipt.photo_url;
  }

  async loadWorker() {
    this.worker = createWorker({
      logger: progress => {
        console.log(progress)
        if (progress.status == "recognizing text") {
          this.captureProgress = parseInt('' + progress.progress * 100);
        }
      }
    });
    await this.worker.load();
    await this.worker.loadLanguage("eng");
    await this.worker.initialize("eng");
    console.log("Finished")
    this.workerReady = true;
  }

  async recognizeImage(imageURL) {
    const result = await this.worker.recognize(imageURL);
    this.ocrResult = result.data.text;
    console.log(this.ocrResult);
    this.currentReceipt.photo_url = imageURL;
    setTimeout(function() {
      (<HTMLImageElement>document.getElementById("receipt_image")).src = imageURL;
    }, 500)
  }

  updateImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    var page=this;
    this.camera.getPicture(options).then((imageData) => {

      let imageid = (Math.floor(Math.random() * 2000)).toString();
      let filename = "receipt_"+imageid+'.jpg'
      console.log(filename+" ****** ")


      var storageRef = firebase.storage().ref();
      var ImageRef = storageRef.child('images/'+filename);
      var data='data:image/jpeg;base64,' + imageData

      var uploadTask=ImageRef.putString(data, 'data_url').then(function(snapshot) {
        console.log('Uploaded a base64 string!');

        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
          page.imgURL = downloadURL;

          if (page.workerReady) {
            page.recognizeImage(page.imgURL)
          } else {
            setTimeout(function() {
              page.recognizeImage(page.imgURL)
            }, 2000)
          }
          // page.recognizeImage("https://i.stack.imgur.com/t3qWG.png")
        });

      });


    }, (error) => {
     console.log(error);
    });
  }

  updateReceipt(value) {
    this.receipt.store_name = value.store_name;
    this.receipt.date = value.date
    this.receipt.transcribed_receipt = value.transcribed_receipt
    this.receipt.total_cost = value.total_cost;
    this.receipt.photo_url = this.currentReceipt.photo_url;
    this.receipt.user_uid = this.currentReceipt.user_uid;
    this.receipt.id = this.currentReceipt.id;

    this.receiptService.updateReceipt(this.receipt).then((doc) => {
      this.goBack()
    })
  }

  goBack() {
    this.router.navigate(["/tabs/view-receipt", this.receipt])
  }
}
