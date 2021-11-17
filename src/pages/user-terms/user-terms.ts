// ionic components
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserService } from '../../providers/user.service';

// import app components
import { UserRegister } from '../user-register/user-register';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'page-user-terms',
  templateUrl: 'user-terms.html',
  providers: [UserService],
})
export class UserTerms {

  public identity;

  constructor(public navCtrl: NavController, private _userService: UserService) {

      this.identity = this._userService.getIdentity();

  }
   // userTerms charged
  ionViewDidLoad() {
    this.identity = this._userService.getIdentity();
  }

  // go to terms page
  registerPage(){ 
    this.navCtrl.push(UserRegister);
  }

  dashBoard(){ 
    this.navCtrl.setRoot(Dashboard);
  }



}