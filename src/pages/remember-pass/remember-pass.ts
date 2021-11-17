// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';

// import service 
import { User } from '../../models/user';
import { UserService } from '../../providers/user.service';
import { GLOBAL } from '../../providers/global';
import { UserLogin } from '../user-login/user-login';

@Component({
  selector: 'page-remember-pass',
  templateUrl: 'remember-pass.html',
  providers: [UserService],
})
export class RememberPass {
  nc:string;
  ncr:string;
  test:boolean=false;
  public data;
  public user: User;
  public url: string;

  constructor(public navCtrl: NavController, 
              private _userService: UserService,
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController) 
  {
    this.user = new User('','','','','','','ROLE_CONDUCTOR','','',true,'0','');
    this.url = GLOBAL.url;
   
  }

  ionViewDidLoad() {
    console.log('¡RememberPAss cargado!');
   
   
  }

  ngDoCheck(){
  	
  }

  //metodo para modificar la contraseña del usuario cuando ha olvidado la anterior
  modificar(){
    if(this.nc!=this.ncr){
      let confirm = this.alertCtrl.create({
        title: 'ups!',
        message: 'las contraseñas no coiciden intentalo nuevamente'
      });
      confirm.present();
    }
    else{
      this.user.password=this.nc;
      this._userService.updatePass(this.user).then(
      (response) => {
        this.data=JSON.parse(response["_body"]);
        if(!this.data){
          let confirm2 = this.alertCtrl.create({
            title: 'Ups!',
            message: 'lo setimos, ocurrio un error mientras se actualizaba su contraseña, por favor intentelo nuevamente'
            
          });
          confirm2.present();
        }
        else{
          let confirm = this.alertCtrl.create({
            title: 'perfecto!',
            message: 'su contraseña ha sido modificada, ahora puede ingresar con su documento y su nueva contraseña',
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
          
        }
      },
      (error)=> {
        var errorMessage = <any>error;
        if (errorMessage != null) {
          console.log(errorMessage)
        }
      });
    }
  }

  //metodo para verificar si los datos ingresados coiciden con los de algun usuario registrado  
  verificar(){
    let loader = this.loadingCtrl.create({
      content: "Verificando Su Informacion, espere unos segundos",
      duration: 2220
    });
    loader.present();
    this._userService.getUserPass(this.user).then(
      (response) => {
          this.data=JSON.parse(response["_body"]);
          if(!this.data.user){
            let confirm2 = this.alertCtrl.create({
              title: 'Ups!',
              message: 'lo setimos, los datos que ingresaste no concuerdan con los de ningun usuario registrado, verificalos y vuelve a intentarlo',
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.navCtrl.push(RememberPass);
                  }
                }
              ]
            });
            confirm2.present();
          }
          else{
            this.user = this.data.user;
            let confirm = this.alertCtrl.create({
              title: 'Perfecto!',
              message: 'tus datos fueron verificados, es hora de ingresar una nueva contraseña',
              buttons: [
                {
                  text: 'Aceptar'
                }
              ]
            });
            confirm.present();
            this.test=true;
          }
      },
      (error)=> {
        var errorMessage = <any>error;
        if (errorMessage != null) {
        console.log(errorMessage)
      }
      } 
    );
  }

  //metodo para ir al dashboard
  goDashboard(){
    this.navCtrl.setRoot(UserLogin);
  }
  

}