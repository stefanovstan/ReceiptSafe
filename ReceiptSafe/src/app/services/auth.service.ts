import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import firebase from 'firebase/app';

import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userid = null;
  usertype = null;

  constructor(
    private router: Router,
    public fireAuth: AngularFireAuth,
    public angularFirestore: AngularFirestore) { }

  async login(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password)
    .then((success) => {
      console.log("Logged In")
      this.userid = success.user.uid;
      var db = firebase.firestore();
      var self = this;
      db.collection("users").where("uid", "==", success.user.uid).get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          self.usertype = doc.data().usertype;
        })
      })
      .catch(function(error) { console.log(error); });
      self.router.navigate(["/tabs/tab1"]);
    })
    .catch(function(error) { console.log(error); });
  }

  async signup(email: string, password: string) {
    await this.fireAuth.createUserWithEmailAndPassword(email, password)
    .then((success) => {
      var db = firebase.firestore();
      db.collection("users").add({
        'uid': success.user.uid,
        'usertype': 'user'
      })
      .then(function(docRef) { console.log(docRef); })
      .catch(function(error) { console.log(error); });
    })
    .catch((error) => { console.log(error); });
    this.router.navigateByUrl("/login");
  }

  async logout() {
  	await this.fireAuth.signOut()
    .then(() => {
  		console.log("Logged Out");
      this.userid = null;
      this.usertype = null;
  	})
    .catch((error) => { console.log(error); });
  }

  loginGoogle(){
    var provider = new firebase.auth.GoogleAuthProvider();
    var self = this;
    firebase.auth().signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
      var googleUser = result.user;
      this.userid = googleUser.uid;
      this.usertype = 'user';
      this.router.navigateByUrl('/tabs/tab1');
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  async deleteUser() {
    var user = firebase.auth().currentUser;
    await this.logout();
    user.delete().then(function() {

    }).catch(function(error) {

    });
    this.router.navigate(["tabs/tab1"]);
  }

  getUserID() { return this.userid; }

  getUserType() { return this.usertype; }
}
