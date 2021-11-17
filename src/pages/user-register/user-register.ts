// ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController  } from 'ionic-angular';

// services 
import { User } from '../../models/user';
import { UserService } from '../../providers/user.service';

// import app components
import { UserLogin } from '../user-login/user-login';
import { UserTerms } from '../user-terms/user-terms';

@Component({
  selector: 'page-user-register',
  templateUrl: 'user-register.html',
  providers: [UserService],
})
export class UserRegister {

  public user: User;
  public status: string;

  constructor(public navCtrl: NavController, 
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController, 
              private _userService: UserService) 
  {
    this.user = new User('','','','','','','ROLE_CONDUCTOR','','',true,'0','');
  }

  // userRegister charged
  ionViewDidLoad() {
    console.log('¡UserRegister cargado!');
  }

  // submit: register new user
  onSubmit(){
    this.user.fechaC = new Date().toLocaleString();
    this._userService.register(this.user).subscribe(
      response => {
        if(response.user && response.user._id){


          //start loading
          let loader = this.loadingCtrl.create({
            content: "Cargando...",
            duration: 5000
          });
          loader.present();
          

          // Start alert register ok 
          let confirm = this.alertCtrl.create({
            title: 'Registro satisfactorio',
            message: 'Ahora ya puedes ingresar con tu usuario y contraseña',
            buttons: [
              {
                text: 'Ingresar',
                handler: () => {
                  this.navCtrl.push(UserLogin);
                }
              }
            ]
          });
          confirm.present();
          // End alert new register

          this.user = new User('','','','','','','ROLE_CONDUCTOR','','',true,'0','');
        }else{

          //start loading
          let loader = this.loadingCtrl.create({
            content: "Cargando...",
            duration: 5000
          });
          loader.present();

          // Start alert fail register  
          let confirm = this.alertCtrl.create({
            title: 'Ops!',
            message: 'Al parecer tenemos un error con tu registro, intentalo nuevamente',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  console.log('Agree clicked');
                }
              }
            ]
          });
          confirm.present();
          // End alert new register         
          

          console.log("Error desde el servicio");
        }
      },
      error => {
        console.log(<any>error);
      }
    );

    console.log(this.user);
  }

  // go to UserLogin page
  userLoginPage(){ 
    this.navCtrl.push(UserLogin);
  }

  // go to UserLogin page
  userTermsPage(){ 
    this.navCtrl.push(UserTerms);
  }

}