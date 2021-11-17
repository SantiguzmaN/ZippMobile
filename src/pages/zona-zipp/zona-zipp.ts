// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams } from 'ionic-angular';

// model zona zipp
import { Zona_Zipp } from '../../models/zonazipp';
import { ReservaZona } from '../../models/reservazipp';

// zipp component
import { Dashboard } from '../dashboard/dashboard';
import { Geolocation } from '@ionic-native/geolocation';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


// import providers 
import { User } from '../../models/user';
import { UserZipp } from '../../models/userzipp';
import { UserService } from '../../providers/user.service';
import { ZippService } from '../../providers/zipp.service';
import { GLOBAL } from '../../providers/global';

@Component({
  selector: 'page-zona-zipp',
  templateUrl: 'zona-zipp.html',
  providers: [UserService, ZippService],
})
export class ZonaZipp {

  public user: User;
  public identity;
  public estado_reserva: boolean;
  public url: string;
  public zonazipp: Zona_Zipp;
  public userzonazipp: UserZipp; 
  public reservazipp: ReservaZona;
  public reservaszipp: ReservaZona[];
  public reservaszipp2: ReservaZona[];

  public id;

  public tiempo_total: string;
  public hora_inicio;
  public hora_fin;
  public fecha_inicio: string;
  public fecha_final: string;

  // servicios adicionales zipp
  public security_guard: boolean;
  public roofed: boolean;
  public phone: boolean;
  public cctv: boolean;
  public total_hours_day: boolean;
  public leave_key: boolean;
  public electric_station: boolean;
  public bike_type: boolean;
  public motorcycle_type: boolean;
  public car_type: boolean;

  constructor(public navCtrl: NavController, 
              private _userService: UserService,
              private _zonazippService: ZippService,
              private geolocation: Geolocation, 
              public alertCtrl: AlertController, 
              public navParams: NavParams,
              private iab: InAppBrowser,
              public loadingCtrl: LoadingController) 
  {
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.url = GLOBAL.url;
    this.id = this.navParams.get("zonazipp");
    this.zonazipp = new Zona_Zipp('','','','','','','','',true,0,0,0,0,5,true,true,true,true,true,true,true,true,true,true,true,true,true,this.userzonazipp,false);
    this.getzonazipp();
    this.getUserById();
    this.reservazipp = new ReservaZona('',this.fecha_inicio,this.fecha_final,this.hora_inicio,this.hora_fin,'',false,0,this.zonazipp,this.zonazipp.userzonazipp,this.user);
    
  }

  ionViewDidLoad() {
  
    this.identity = this._userService.getIdentity();
    this.getzonazipp();
    this.getUserById();
    this.getZonasZippByUser();
    let loader = this.loadingCtrl.create({
      content: "Cargando...",
      duration: 3000
    });
    loader.present();
    this.comprovateUser();
    console.log('¡ZonaZipp cargado!');
    
    
  }
  
  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }

  comprovateUser(){
    console.log('comprovate user con estado +' +this.estado_reserva);
    if(this.estado_reserva == true){
    console.log('la zona esta ocupada');
    for(let res of this.reservaszipp){
      if(res.zonazipp._id=this.zonazipp._id){
        console.log('esta zona zp si esta en la lista de reservas que usted ha hecho');
        if(res.zonazipp.estado_zonazipp==true){
          console.log('realmente esta reservada');  
  
          let alert = this.alertCtrl.create({
            title: 'ADVERTENCIA!',
            subTitle: 'Ups! Alguien se te adelanto. Busca otra zona Zipp ',
            buttons: [{
            text: 'OK',
            handler: data => {
                  this.goDashboard();
                }
          }]
        });
        alert.present();
        }
        
      }}

    }
    
    if(this.reservazipp.user==undefined){
      
              
    }
  }

  getUserById(){
    this._userService.getUser(this.user._id).subscribe(
        response => {
            if(!response){
                console.log("no retorno");
            }else{
                this.user = response.user;
                localStorage.setItem('identity', JSON.stringify(this.user));
                                 
            }
        },
        error => {
            console.log(<any>error);
            
        }
    );

  }

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
            content: "Descontando de su saldo actual...",
            duration: 3000
          });
          loader.present();
         

          /**
          // subida de la imagen
          this._uploadService.makeFileRequest(this.url+'upload-image-user/'+this.user._id, [], this.filesToUpload, this.token, 'image')
                             .then((result: any) => {
                               this.user.image = result.image;
                               localStorage.setItem('identity', JSON.stringify(this.user));
                               console.log(this.user);
                             }); 
          */

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


  getzonazipp(){
    this._zonazippService.getZonaZipp(this.id).subscribe(
      (response) => {
          if(!response){
              
          }else{
            this.zonazipp = response.zonazipp;
            this.estado_reserva = this.reservazipp.estado_reserva;
            this.userzonazipp = response.zonazipp.user;

            //servicios
            this.security_guard = this.zonazipp.security_guard;
            this.roofed = this.zonazipp.roofed;
            this.phone = this.zonazipp.phone;
            this.cctv = this.zonazipp.cctv;
            this.total_hours_day = this.zonazipp.total_hours_day;
            this.leave_key = this.zonazipp.leave_key;
            this.electric_station = this.zonazipp.electric_station;
            this.car_type = this.zonazipp.car_type;
            this.bike_type = this.zonazipp.bike_type;
            this.motorcycle_type = this.zonazipp.motorcycle_type;

          }
      },
      error => {
          console.log(<any>error);                         
      }
    );
  }
  
  goDashboard(){
    this.navCtrl.setRoot(Dashboard);
  }
  getZonasZippByUser(){
    this._zonazippService.getReservasZippByUser(this.user._id).subscribe(
        response => {
            if(!response.reservas_zipp){
                console.log("si resuesta es diferente . reservas");
            }else{
                this.reservaszipp = response.reservas_zipp;
                this.cargarReserva(); 
                   
            }
        },
        error => {
            console.log(<any>error);
        }
    );

  }

  cargarReserva(){
    for(let res of this.reservaszipp){
      if(res.estado_reserva==false){
        if(res.zonazipp._id==this.zonazipp._id)
        this.reservazipp=res;
       
      }
    }
    
  }

  failedAlert(text) {
  let alert = this.alertCtrl.create({
  title: 'ADVERTENCIA!',
  subTitle: text,
  buttons: [{
  text: 'OK',
    handler: data => {
              console.log('Cancel clicked');
            }
  }]
  
  });
  alert.present();
}
  
  // método para tomar una zona zipp
  tomarZipp(){
    //Expresion regular para validar la placa acepta XXX### XXX## XXX##X donde X es letra
    // y #es numero.
    var myRe = /([A-Za-z]){3}([0-9]){2}([0-9]*)([A-Za-z]*)/;
    
    var saldo = +this.user.saldo;
    if(saldo<1000){
      let alert = this.alertCtrl.create({
        title: 'ADVERTENCIA!',
        subTitle: 'su saldo es insuficiente para tomar algun servicio. por favor recarge su saldo ZIPP',
        buttons: [{
        text: 'OK',
        handler: data => {
              console.log('Cancel clicked');
            }
      }]
    });
    alert.present();
    }
    else{
      if(this.zonazipp.bike_type==true){
        let prompt = this.alertCtrl.create({
          title: 'Descripcion',
          message: 'Ingrese una breve descripcion de su vehiculo',
          inputs: [
            {
              name: 'placa',
              placeholder: 'Descripcion'
            },  
          ],
          buttons: [
            {
              text: 'Cancelar',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Continuar',
              handler: data => {
               
                if(data.placa==""){
                    this.failedAlert("La Descripcion de su vehiculo es requerida");
                }
                else{
                  this.fecha_inicio = new Date().toLocaleString();
                  //this.fecha_inicio = new Date().toLocaleString();
                  this.hora_inicio = new Date().toISOString();
                  this.hora_inicio= Date.parse(this.hora_inicio);
                  this.hora_fin=new Date().toISOString();
                  this.hora_fin= Date.parse(this.hora_fin);
                  
                  this.fecha_final = new Date().toLocaleString();
  
                  this.zonazipp.estado_zonazipp = false;
                  this.updateZipp();
                  this.reservazipp.placa = data.placa;
                  this.reservazipp.valor_total = this.zonazipp.price;
                  this.reservazipp.fecha_inicio = this.fecha_inicio;
                  this.reservazipp.hora_inicio = this.hora_inicio;
                  this.reservazipp.hora_fin=this.hora_fin;
                  this.reservazipp.fecha_final = this.fecha_final;
                  this.reservazipp.tiempo_total = '00:00:00';
                  this.reservazipp.user = this.user;
                  this.reservazipp.zonazipp = this.zonazipp;
                  this.reservazipp.userzonazipp = this.userzonazipp;
  
                  this.reservarZona();
                }
              }
            }
          ]
        });
        prompt.present();
        
      
      }else{

      
      let prompt = this.alertCtrl.create({
        title: 'Placa',
        message: 'Ingrese la placa de su vehículo',
        inputs: [
          {
            name: 'placa',
            placeholder: 'Número de placa'
          },  
        ],
        buttons: [
          {
            text: 'Cancelar',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Continuar',
            handler: data => {
              var myArray;
              console.log("EL array de placas es:"+ myArray);
              if(data.placa.length<8){
                console.log('cantidad de caracteres:  '+ data.placa.length);
                myArray = myRe.exec(data.placa);

              }
              if(myArray==null){
                this.failedAlert("La placa de su vehiculo no es correcta, por favor intentelo nuevamente");
              }
              else{
                this.fecha_inicio = new Date().toLocaleString();
                //this.fecha_inicio = new Date().toLocaleString();
                this.hora_inicio = new Date().toISOString();
                this.hora_inicio= Date.parse(this.hora_inicio);
                this.hora_fin=new Date().toISOString();
                this.hora_fin= Date.parse(this.hora_fin);
                
                this.fecha_final = new Date().toLocaleString();

                this.zonazipp.estado_zonazipp = false;
                this.updateZipp();
                this.reservazipp.placa = data.placa;
                this.reservazipp.valor_total = this.zonazipp.price;
                this.reservazipp.fecha_inicio = this.fecha_inicio;
                this.reservazipp.hora_inicio = this.hora_inicio;
                this.reservazipp.hora_fin=this.hora_fin;
                this.reservazipp.fecha_final = this.fecha_final;
                this.reservazipp.tiempo_total = '00:00:00';
                this.reservazipp.user = this.user;
                this.reservazipp.zonazipp = this.zonazipp;
                this.reservazipp.userzonazipp = this.userzonazipp;

                this.reservarZona();
              }
            }
          }
        ]
      });
      prompt.present();
      
      }
    }
    
  }
 //Metodo para finalizar la reserva.
  public finalizarReserva(){
    var saldo = +this.user.saldo;
    this.cargarReserva();
    this.zonazipp.estado_zonazipp = true;// libre
    this.updateZipp();
    this.fecha_final = new Date().toLocaleString();
    this.hora_fin=new Date().toISOString();
    this.hora_fin= Date.parse(this.hora_fin);
    this.hora_inicio=this.reservazipp.hora_inicio;
    this.reservazipp.fecha_final = this.fecha_final;
    this.reservazipp.hora_fin=this.hora_fin;
    this.estado_reserva = true; // finalizada
    this.reservazipp.estado_reserva = this.estado_reserva;
  
    // cálculo del tiempo
    var result = (this.hora_fin - this.hora_inicio)/1000;
    var horasFloat = Math.ceil( result / 3600 ); 
    var hours = Math.floor( result / 3600 );
    var minutes = Math.floor( (result % 3600) / 60 );
    var seconds = Math.ceil(result % 60);
    var hora = (hours<9)?"0"+hours:hours;
    var minutos = (minutes<9)?"0"+minutes:minutes;
    this.tiempo_total = hora + ":" + minutos + ":" + seconds;
    this.reservazipp.tiempo_total = this.tiempo_total;
    // fin del cálculo

    // cálculo valor total de la zona tomada 
    if (result < 3600){ // primeros 60 minutos
      this.reservazipp.valor_total = this.zonazipp.price;
    }else{
      if (horasFloat > hours){
        this.reservazipp.valor_total = this.reservazipp.valor_total + hours * this.reservazipp.valor_total;
      }else{
        this.reservazipp.valor_total = this.reservazipp.valor_total;


      }              
    }
    // fin cálculo valor total de la zona tomada 
        saldo=saldo-this.reservazipp.valor_total;
        this.user.saldo=saldo+"";
        this.updateUser();
        localStorage.setItem('identity', JSON.stringify(this.user));
    this.updateReserva();
  } 
 validarTiempo(){
  this.cargarReserva();
  this.fecha_final = new Date().toLocaleString();
  this.hora_fin=new Date().toISOString();
  this.hora_fin= Date.parse(this.hora_fin);
  this.hora_inicio=this.reservazipp.hora_inicio;
  this.reservazipp.fecha_final = this.fecha_final;
  this.reservazipp.hora_fin=this.hora_fin;
  this.estado_reserva = true; // finalizada
  this.reservazipp.estado_reserva = this.estado_reserva;

  // cálculo del tiempo
  var result = (this.hora_fin - this.hora_inicio)/1000;
  var horasFloat = Math.ceil( result / 3600 ); 
  var hours = Math.floor( result / 3600 );
  var minutes = Math.floor( (result % 3600) / 60 );
  var seconds = Math.ceil(result % 60);
  var hora = (hours<9)?"0"+hours:hours;
  var minutos = (minutes<9)?"0"+minutes:minutes;
  this.tiempo_total = hora + ":" + minutos + ":" + seconds;
  this.reservazipp.tiempo_total = this.tiempo_total;
  // fin del cálculo

  // cálculo valor total de la zona tomada 
  if (result < 3600){ // primeros 60 minutos
    this.reservazipp.valor_total = this.zonazipp.price;
  }else{
    if (horasFloat > hours){
      this.reservazipp.valor_total = this.reservazipp.valor_total + hours * this.reservazipp.valor_total;
    }else{
      this.reservazipp.valor_total = this.reservazipp.valor_total;


    }              
  }
 }
 getTimer(){
    this.validarTiempo();
    let alert = this.alertCtrl.create({
      title: 'Zona ZIPP',
      subTitle: 'Costo parcial : $' + this.reservazipp.valor_total+'.'+'<br>Tiempo parcial (hh:mm:ss): '+'<br>('+this.reservazipp.tiempo_total+').' ,
      buttons: ['Aceptar']
    });
    alert.present();
 } 

 // método que añade la reserva zipp a la base de datos
  public reservarZona(){
    this._zonazippService.reservaZonaZipp(this.reservazipp).subscribe(
        response => {
            if(!response.reserva_zipp){
                            
            }else{
              this.reservazipp = response.reserva_zipp;
              this.showAlert(this.zonazipp);
            }
        },
        error => {
            var errorMessage = <any>error;
            if(errorMessage != null){
                console.log(errorMessage);
            }
        }
    );
  }

  // cambia/actualiza el estado y la fecha final de la reserva zipp
  updateReserva(){

  	this._zonazippService.updateReserva(this.reservazipp).subscribe(
  		response => {

  			if (!this.reservazipp) {
  				console.log('reserva error al actualizar');
  			}else{

          //start loading
          let loader = this.loadingCtrl.create({
            content: "Finalizando...",
            duration: 2000
          });
          loader.present();

          // Start alert finish ok 
          let confirm = this.alertCtrl.create({
            title: 'Zipp finalizado',
            message: 'Gracias por tomar esta zona, tu saldo a pagar es de: $'+this.reservazipp.valor_total+' pesos.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.navCtrl.setRoot(Dashboard);
                }
              }
            ]
          });
          confirm.present();
          // End alert finish
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

  // cambiar/actualizar el estado de la zona zipp a false = ocupado
  updateZipp(){
    var id = this.zonazipp._id;   
    this._zonazippService.updateZipp(id, this.zonazipp).subscribe(
        response => {
            if(!response.zonazipp){
              console.log('zipp error al actualizar');
            }else{
              this.zonazipp = response.zonazipp;
            }
        },
        error => {
            var errorMessage = <any>error;

            if(errorMessage != null){
              console.log(errorMessage);
            }
        }
    );
  }
  
  // alerta una vez tomada la zona zipp
  showAlert(zonazipp) {
    let alert = this.alertCtrl.create({
      title: 'Zona zipp',
      subTitle: 'Has tomado la zona zipp ubicada en la dirección: ' + zonazipp.address ,
      buttons: ['Aceptar']
    });
    alert.present();
  }
  goRoute(){
    this.geolocation.getCurrentPosition().then((position) => {
      var lat=position.coords.latitude
      var long=position.coords.longitude
      let enlac:string="https://www.google.com/maps/dir/"+lat+","+long+"/"+this.zonazipp.lat+","+this.zonazipp.lng+"/data=!3m1!4b1!4m2!4m1!3e0";
      let browser = this.iab.create(""+enlac);
      browser.show();
  }, (err) => {
    console.log(err);
  });
  }
}
