// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController} from 'ionic-angular';

// models zipp - usur
import { User } from '../../models/user';
import { Zona_Zipp } from '../../models/zonazipp';
import { ReservaZona } from '../../models/reservazipp';

// import providers 
import { UserService } from '../../providers/user.service';
import { ZippService } from '../../providers/zipp.service';
import { GLOBAL } from '../../providers/global';

import { Dashboard } from '../dashboard/dashboard';


@Component({
  selector: 'page-user-history',
  templateUrl: 'user-history.html',
  providers: [UserService, ZippService], 
})
export class UserHistory {

  public user: User;
  public zona:Zona_Zipp= new Zona_Zipp('','','','','','','','',true,0,0,0,0,5,true,true,true,true,true,true,true,true,true,true,true,true,true,null,false);
  public identity;
  public url: string;
  public reservaszipp: ReservaZona[];

  constructor(public navCtrl: NavController, 
              private _userService: UserService,
              private _zonazippService: ZippService, 
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController) 
  {
    this.identity = this._userService.getIdentity();
    this.zona.image_zona_zipp="https://res.cloudinary.com/douxyvndb/image/upload/v1574700287/Diseño-app-ZIPP-WEB2_jrw6nz.png"; 
    this.zona.address='Zona ZIPP eliminada';
    this.user = this.identity;
    this.url = GLOBAL.url;
  }

  ionViewDidLoad() {
    console.log('¡UserHistory cargado!');
    this.identity = this._userService.getIdentity();
    this.getZonasZippByUser();
  }

  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }

  goDashboard(){
    this.navCtrl.setRoot(Dashboard);
  }

  // Metodo para obtener las Zonas ZIPP para refrescar la base de datos
  getZonasZippByUser(){
    this._zonazippService.getReservasZippByUser(this.user._id).subscribe(
        response => {
            if(!response.reservas_zipp){
                
            }else{
                this.reservaszipp = response.reservas_zipp;
                for(let res of this.reservaszipp){
                  if(res.zonazipp==undefined){
                      res.zonazipp=this.zona;
                  }
                }                 
            }
        },
        error => {
            console.log(<any>error);
        }
    );

  }

}