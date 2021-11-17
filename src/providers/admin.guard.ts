// import ionic components
import { Injectable } from '@angular/core';
import { NavController} from 'ionic-angular';

// import service
import { UserService } from './user.service';

// import app components
import { Dashboard } from '../pages/dashboard/dashboard';

@Injectable()
export class AdminGuard{
	constructor(
		public navCtrl: NavController,
		private _userService: UserService
	){}

	canActivate(){
		let identity = this._userService.getIdentity();

		if(identity && identity.role == 'ROLE_CONDUCTOR'){
			return true;
		}else{
			this.navCtrl.push(Dashboard); 
			return false;
		}
	}
}