import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
// import { AuthService } from '../services/auth.service';

export interface Receipt {
	store_name: string,
  date: string,
  transcribed_receipt: string,
  total_cost: number,
  photo_url: string
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor() { }
}
