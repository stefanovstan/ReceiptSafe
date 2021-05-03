import { Component } from '@angular/core';
import { Router } from '@angular/router'

import { AuthService } from '../services/auth.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  showLogOut = false;

  constructor(private authService: AuthService, private router: Router) {}
  
  ionViewDidEnter() {
    this.showLogOut = false;
    if (this.authService.getUserID() != null) {
      this.showLogOut = true;
    }
  }

  async logout() {
    this.showLogOut = false;
    await this.authService.logout();
    this.router.navigate(["tabs/tab1"]);
  }

  async deleteAccount() {
    this.showLogOut = false;
    await this.authService.deleteUser();
  }

}
