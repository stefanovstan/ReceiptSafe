import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable, concat } from 'rxjs';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { resourceLimits } from 'node:worker_threads';

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

	private pinned: Observable<Receipt[]>;
	private pinnedCollection: AngularFirestoreCollection<Receipt>;

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
		this.pinnedCollection = this.angularFirestore.collection<Receipt>('pinned');
		this.pinned = this.pinnedCollection.snapshotChanges().pipe(
			map(actions => {
				return actions.map(a => {
					const data = a.payload.doc.data();
					const id = a.payload.doc.id;
					if (data.id == '') { data.id = id }
					return { id, ...data };
				})
			})
		)
		//this.storage.create();
	}

	getUnpinned(): Observable<Receipt[]> {
	  	var result = this.receipts.pipe(map(receipts => receipts.filter(receipt => receipt.user_uid === this.authService.getUserID())))
		return result;
	}

	getPinned(): Observable<Receipt[]> {
		var result = this.pinned.pipe(map(pinned => pinned.filter(receipt => receipt.user_uid === this.authService.getUserID())))
	  	return result;
  	}

	getReceipt(id: string): Observable<Receipt> {
		let receipt = this.receiptCollection.doc<Receipt>(id).valueChanges().pipe(
			take(1),
			map(receipt => {
				receipt.id = id;
				return receipt;
			})
		)
		if (receipt == null) {
			receipt = this.pinnedCollection.doc<Receipt>(id).valueChanges().pipe(
				take(1),
				map(receipt => {
					receipt.id = id;
					return receipt;
				})
			)
		}
		if (receipt == null) {
			//receipt = this.storage.get(id);
		}
		return receipt;
	}

	addReceipt(receipt: Receipt): Promise<DocumentReference> {
		//this.storage.set(receipt.id, receipt);
		return this.receiptCollection.add(receipt);
	}

	deleteReceipt(id: string): Promise<void> {
		//this.storage.remove(id);
		this.pinnedCollection.doc(id).delete();
		return this.receiptCollection.doc(id).delete();
	}

	updateReceipt(receipt: Receipt): Promise<void> {
		//this.storage.set(receipt.id, receipt);
		this.pinnedCollection.doc(receipt.id).update({ store_name: receipt.store_name, date: receipt.date, transcribed_receipt: receipt.transcribed_receipt, photo_url: receipt.photo_url, id: receipt.id, total_cost: receipt.total_cost, user_uid: receipt.user_uid });
		return this.receiptCollection.doc(receipt.id).update({ store_name: receipt.store_name, date: receipt.date, transcribed_receipt: receipt.transcribed_receipt, photo_url: receipt.photo_url, id: receipt.id, total_cost: receipt.total_cost, user_uid: receipt.user_uid });
	}

	pinReceipt(receipt: Receipt) {
		var newReceipt = this.duplicateReceipt(receipt);
		this.deleteReceipt(receipt.id);
		return this.pinnedCollection.add(newReceipt);
	}
	
	unpinReceipt(receipt: Receipt) {
		var newReceipt = this.duplicateReceipt(receipt);
		this.addReceipt(newReceipt);
		return this.pinnedCollection.doc(receipt.id).delete();
	}

	duplicateReceipt(receipt: Receipt) {
		var newReceipt: Receipt = {
			store_name: receipt.store_name,
		  	date: receipt.date,
		  	transcribed_receipt: receipt.transcribed_receipt,
		  	total_cost: receipt.total_cost,
		  	photo_url: receipt.photo_url,
			user_uid: receipt.user_uid
		}
		return newReceipt;
	}
}
