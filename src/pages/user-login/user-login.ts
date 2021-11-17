// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

// import service 
import { User } from '../../models/user';
import { UserService } from '../../providers/user.service';

// import app components
import { UserRegister } from '../user-register/user-register';
import { Dashboard } from '../dashboard/dashboard';
import { RememberPass } from '../remember-pass/remember-pass';

@Component({
  selector: 'page-user-login',
  templateUrl: 'user-login.html',
  providers: [UserService],
})
export class UserLogin {

  public user: User;
  //showUser: boolean = false;
	public identity;
	public status: string;
  //private facebook: Facebook
  constructor(public navCtrl: NavController, 
              private _userService: UserService,
              public alertCtrl: AlertController,
               
              public loadingCtrl: LoadingController) 
  {
    this.user = new User('','','','','','','ROLE_CONDUCTOR','','',true,'0','');
  }
  //loginFacebook(){
  //  this.facebook.login(['public_profile', 'email'])
  //  .then(rta => {
  //    console.log(rta.status);
  //    if(rta.status == 'connected'){
  //      this.getInfo();
  //    };
  //  })
  //  .catch(error =>{
  //    console.error( error );
  //  });
  //}

  //getInfo(){
    //this.facebook.api('/me?fields=id,name,email,first_name,picture,last_name,gender',['public_profile','email'])
    //.then(data=>{
    //  console.log(data);
    //  this.showUser = true;
    //  //this.user = data;
    //})
    //.catch(error =>{
    //  console.error( error );
    //});
  //}
  ionViewDidLoad() {
    
    console.log('despues de eliminar'+localStorage.length);
    console.log('¡UserLogin cargado!');
    
  }

  rememberPass(){
    this.navCtrl.setRoot(RememberPass);
  }

  userRegisterPage(){ 
    this.navCtrl.push(UserRegister); 
  }

  onSubmit(){
    // Loguear al usuario y conseguir el objeto
    //start loading
    let loader = this.loadingCtrl.create({
      content: "Cargando ZIPP...",
      duration: 4000
    });
    loader.present();


    this._userService.signin(this.user).then(
      (response) => {

        this.identity = JSON.parse(response["_body"]);
        this.identity = this.identity.user;
        
        if (!this.identity || !this.identity._id) {
          // Start alert register ok 
          let confirm = this.alertCtrl.create({
            title: 'Ops!',
            message: 'El documento de identidad o la contraseña son incorrectos, vuelve a intentarlo.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.navCtrl.push(UserLogin);
                }
              }
            ]
          });
          confirm.present();
          // End alert new register
        }else{

          this.identity.password = '';
          localStorage.setItem('identity', JSON.stringify(this.identity));

          this.navCtrl.setRoot(Dashboard); 

        }
      },
      error => {
        var errorMessage = <any>error;
        if (errorMessage != null) {
          // Start alert error 
          let confirm = this.alertCtrl.create({
            title: 'Ops!',
            message: 'El documento de identidad o la contraseña son incorrectos, vuelve a intentarlo.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.navCtrl.push(UserLogin);
                }
              }
            ]
          });
          confirm.present();
          // End alert new register
        }
      }
    );
  }


}
