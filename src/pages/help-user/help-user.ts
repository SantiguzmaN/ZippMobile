// import ionic components
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
// import service 
import { User } from '../../models/user';
import { UserService } from '../../providers/user.service';
import { GLOBAL } from '../../providers/global';

// import app components 
import { Dashboard } from '../dashboard/dashboard';


@Component({
  selector: 'page-help-user',
  templateUrl: 'help-user.html',
  providers: [UserService],
})
export class HelpUser {

  public user: User;
	public identity;
  public status: string;
  public url: string;
  mess:string;
  data: any = null;


  constructor(public navCtrl: NavController, private _userService: UserService,private emailComposer: EmailComposer) {
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.url = GLOBAL.url;
  }

ionViewDidLoad() {
    console.log('HelpUser cargado!');
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }
  //metodo para la creacion del molde del coreo que posteriormente sera enviado al gestor de correos predeterminado
  onSubmit(){
    console.log(''+this.mess);    
    let email = {
      to: 'zipphelpus@gmail.com',
      subject: ''+this.data,
      body:''+this.mess,
      isHtml: true
    };




    this.emailComposer.open(email);
  }
  goDashboard(){
    this.navCtrl.setRoot(Dashboard);
  }

}