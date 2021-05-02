import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
	
	public signupForm: FormGroup;

	constructor(public authService: AuthService) {
		this.signupForm = new FormGroup({
			email: new FormControl(),
			password: new FormControl(),
		});
	}

	ngOnInit() { }

	async signup() {
		let email = this.signupForm.value["email"];
		let password = this.signupForm.value["password"];
		await this.authService.signup(email, password);
	}

}
