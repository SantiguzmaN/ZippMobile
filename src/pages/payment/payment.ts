// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

// import service 
import { User } from '../../models/user';
import { BalanceCode } from '../../models/balancecode';
import { UserService } from '../../providers/user.service';
import { BalanceService}from '../../providers/balance.service';
import { GLOBAL } from '../../providers/global';
import { Dashboard } from '../dashboard/dashboard';


@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
  providers: [UserService],
})
export class Payment {
  public status2:boolean=false;
  public user: User;
  public identity;
  code: String;
  public balance:BalanceCode;

  public value: Number;
  public status: string;
  public url: string;

  constructor(public navCtrl: NavController, 
              private _balanceService: BalanceService,
              private _userService: UserService,
              public alertCtrl: AlertController, 
              private iab: InAppBrowser,
              public loadingCtrl: LoadingController) 
  {
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.url = GLOBAL.url;
    this.getUserById()
  }

  ionViewDidLoad() {
    console.log('Payment cargado!');
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }
  goDashboard(){
    this.navCtrl.setRoot(Dashboard);
  }

  //metodo para obtener el usuario
  getUserById(){
    this._userService.getUser(this.user.cedula).subscribe(
        response => {
            if(!response){
                console.log("no retorno");
            }else{
                this.user = response;
                console.log("nombre del usuario"+response.name);                 
            }
        },
        error => {
            console.log(<any>error);
            console.log("get user no sirvio");
        }
    );

  }
  //metodo para abrir a link epayco
  reDir(){
    let browser = this.iab.create('https://payco.link/256384/');
    browser.show();
  }
  reDir2(){
    let browser = this.iab.create('https://payco.link/256396/');
    browser.show();
  }
  reDir3(){
    let browser = this.iab.create('https://payco.link/256407/');
    browser.show();
  }
  statusChange(){
    if(this.status2==false){
      this.status2=true;
    }else{
      this.status2=false;
    }

  }



  //metodo para actualizar el usuario aplicando el nuevo saldo

  updateUser(){
    this._userService.updateUser(this.user).then(
      response => {

        this.identity = JSON.parse(response["_body"]);
        this.identity = this.identity.user;

        if (!this.identity) {
          console.log('usuario error al actualizar');
        }else{
          localStorage.setItem('identity', JSON.stringify(this.user));

          //start loading
          let loader = this.loadingCtrl.create({
            content: "Aplicando su nuevo saldo...",
            duration: 3000
          });
          loader.present();

        } 
      },
      error => {
        var errorMessage = <any>error;
        if (errorMessage != null) {
          console.log('error');
        }
      }
    );
  }

  //metodo para actualizar el usuario con su nuevo saldo
  onSubmit(){
  	this._userService.updateUser(this.user).then(
  		response => {

        this.identity = JSON.parse(response["_body"]);
        this.identity = this.identity.user;

  			if (!this.identity) {
  				console.log('usuario error al actualizar');
  			}else{
          localStorage.setItem('identity', JSON.stringify(this.user));

          //start loading
          let loader = this.loadingCtrl.create({
            content: "Aplicando nuevo saldo...",
            duration: 3000
          });
          loader.present();
        } 
  		},
  		error => {
  			var errorMessage = <any>error;
  			if (errorMessage != null) {
  				console.log('error');
  			}
  		}
  	);
  }

//metodo para obtener el valor del codigo que se ingresa, si el codig ya fue usado, no permitira aplicarlo
  getValueCode(){
    this._balanceService.getBalanceCode(this.code).subscribe(
     response => {
          if(!response){
            console.log("no retorno");
          }else{
            this.balance=response.codigo;
              console.log('esta es la respuesta: '+this.balance);
              console.log('_id: '+this.balance._id);
              console.log("codigo: "+this.balance.code); 
              console.log("valor: "+this.balance.value); 
              console.log("esta en uso? "+this.balance.used);
           
              if(this.balance.used==true){
                var sald=Number(this.user.saldo);
                var balsal=Number(this.balance.value);
                sald=sald+balsal;
                this.user.saldo=''+sald;
                console.log('el nuevo saldo es de: '+this.user.saldo);
                this.updateUser();
                this.balance.used=false;
                this.updateBalance();
                let confirm3 = this.alertCtrl.create({
                  title: 'Genial!!',
                  message: 'La recarga fue exitosa. Tu nuevo saldo es: $'+sald,
                  buttons: [
                    {
                      text: 'Aceptar'
                    }
                  ]
                });
                confirm3.present();
                // End alert finish
              }
              else{
                let confirm = this.alertCtrl.create({
                  title: 'Lo sentimos:',
                  message: 'El Codigo que esta tratando de ingresar ya fue usado anteriormente, recuerda comprar las tarjetas Zipp en sitios autorizados',
                  buttons: [
                    {
                      text: 'Aceptar'
                    }
                  ]
                });
                confirm.present();
                // End alert finish
              }                 
          }
      },
      error => {
          console.log(<any>error);
          let confirm2 = this.alertCtrl.create({
            title: 'Lo sentimos:',
            message: 'El Codigo que esta tratando de ingresar no existe, intente nuevamente con un codigo valido.',
            buttons: [
              {
                text: 'Aceptar'
              }
            ]
          });
          confirm2.present(); 
      }
    );
  }

   // metodo para actualizar la base de datos... desde aca se marca como usado el codigo en la bd
  updateBalance(){

  	this._balanceService.updateBalance(this.balance).then(
  		response => {

  			if (!this.balance) {
  				console.log('balance error al actualizar');
  			}else{

          console.log('actualizo el balance');
        } 
  		},
  		error => {
  			var errorMessage = <any>error;
  			if (errorMessage != null) {
  				console.log('error');
  			}
  		}
  	);
  }
}

