import { Component, OnInit  } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../services/receipt.service'

import { AuthService } from '../services/auth.service';

import { File } from "@ionic-native/file/ngx";

import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { createWorker } from 'tesseract.js'

import firebase from 'firebase/app';
import 'firebase/storage';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  worker: Tesseract.Worker;
  workerReady = false;

  new_receipt_form: FormGroup;

  receipt: Receipt = {
    store_name: '',
    date: '',
    transcribed_receipt: '',
    total_cost: 0,
    photo_url: '',
    user_uid: '',
    id: ''
  }

  imgURL = ""
  ocrResult = ""
  captureProgress = 0

  hideForm = true

  constructor(public camera: Camera, public file: File, public fireAuth: AngularFireAuth, public authService: AuthService, public receiptService: ReceiptService, private router: Router, private route : ActivatedRoute, public formBuilder: FormBuilder) {
    this.loadWorker()
  }

  ngOnInit() {
    this.new_receipt_form = this.formBuilder.group({
      store_name: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      transcribed_receipt: new FormControl('', Validators.required),
      total_cost: new FormControl(false, Validators.required)
    });
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

    this.hideForm = false;
    setTimeout(function() {
      (<HTMLImageElement>document.getElementById("receipt_image")).src = imageURL;
    }, 500)
  }

  ionViewDidEnter() {
    if (this.authService.getUserID() == null) {
      // do nothing
    } else {
      if (this.hideForm) { this.scan() }
    }
  }

  scan() {
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

  addReceipt(value) {
    this.receipt.store_name = value.store_name
    this.receipt.date = String(value.date).substring(0, 10)
    this.receipt.transcribed_receipt = value.transcribed_receipt
    this.receipt.total_cost = value.total_cost;
    this.receipt.photo_url = this.imgURL
    this.receipt.user_uid = this.authService.getUserID()

    this.receiptService.addReceipt(this.receipt)

    this.new_receipt_form.reset()
    this.hideForm = true
    this.goBack()
  }

  goBack() {
    this.router.navigate(['/tabs/tab1'])
  }
}
