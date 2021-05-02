import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	
	public loginForm: FormGroup;

	constructor(public authService: AuthService) {
		this.loginForm = new FormGroup({
			email: new FormControl(),
			password: new FormControl()
		});
	}

	ngOnInit() { }

	async login() {
		let email = this.loginForm.value["email"];
		let password = this.loginForm.value["password"];
		await this.authService.login(email, password);
	}

  	async googleLogin() {
    	await this.authService.loginGoogle();
  	}

}
