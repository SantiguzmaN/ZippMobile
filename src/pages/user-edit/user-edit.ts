// import ionic components
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';

// import service 
import { User } from '../../models/user';
import { UserService } from '../../providers/user.service';
import { GLOBAL } from '../../providers/global';
import { Dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'page-user-edit',
  templateUrl: 'user-edit.html',
  providers: [UserService],
})
export class UserEdit {

  public user: User;
	public identity;
  public status: string;
  public url: string;

  constructor(public navCtrl: NavController, 
              private _userService: UserService,
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController) 
  {
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.url = GLOBAL.url;
    this.getUserById();
  }

  ionViewDidLoad() {
    console.log('¡UserEdit cargado!');
    this.identity = this._userService.getIdentity();
    this.getUserById();
  }

  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }

  //metodo para ir al dashboard
  goDashboard(){
    this.navCtrl.setRoot(Dashboard);
  }


  //metodo para obtener el usuario por id para actualizar el localstorage

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

// Metodo para actualizar el usuario
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
            content: "Actualizando...",
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

}