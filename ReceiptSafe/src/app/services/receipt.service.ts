import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Receipt {
	store_name: string,
  date: string,
  transcribed_receipt: string,
  total_cost: number,
  photo_url: string,
	user_uid: string,
	id?: string
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

	private receipts: Observable<Receipt[]>;
	private receiptCollection: AngularFirestoreCollection<Receipt>;

  constructor(private angularFirestore: AngularFirestore, private authService : AuthService) {
		this.receiptCollection = this.angularFirestore.collection<Receipt>('receipts');

		this.receipts = this.receiptCollection.snapshotChanges().pipe(
			map(actions => {
				return actions.map(a => {
					const data = a.payload.doc.data();
					const id = a.payload.doc.id;
					if (data.id == '') { data.id = id }
					return { id, ...data };
				})
			})
		)
	}

	getReceipts(): Observable<Receipt[]> {
		var result = null;
	  result = this.receipts.pipe(map(receipts => receipts.filter(receipt => receipt.user_uid === this.authService.getUserID())))
		return result;
	}

	getReceipt(id: string): Observable<Receipt> {
		return this.receiptCollection.doc<Receipt>(id).valueChanges().pipe(
			take(1),
			map(receipt => {
				receipt.id = id;
				return receipt;
			})
		)
	}

	addReceipt(receipt: Receipt): Promise<DocumentReference> {
		return this.receiptCollection.add(receipt)
	}

	deleteReceipt(id: string): Promise<void> {
		return this.receiptCollection.doc(id).delete();
	}

	updateReceipt(receipt: Receipt): Promise<void> {
		return this.receiptCollection.doc(receipt.id).update({ store_name: receipt.store_name, date: receipt.date, transcribed_receipt: receipt.transcribed_receipt, photo_url: receipt.photo_url, id: receipt.id, total_cost: receipt.total_cost, user_uid: receipt.user_uid });
	}
}
