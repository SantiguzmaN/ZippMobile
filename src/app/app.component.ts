import { Component, ViewChild } from '@angular/core';
import { App, Platform, Nav, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

// import service
import { UserService } from '../providers/user.service';
import { GLOBAL } from '../providers/global';

// import app components
import { Dashboard } from '../pages/dashboard/dashboard';
import { UserLogin } from '../pages/user-login/user-login';
import { UserEdit } from '../pages/user-edit/user-edit';
import { HelpUser } from '../pages/help-user/help-user';
import { UserHistory } from '../pages/user-history/user-history';
import { UserTerms } from '../pages/user-terms/user-terms';
import { Payment } from '../pages/payment/payment';


@Component({
  templateUrl: 'app.html',
  providers: [UserService],
})
export class MyApp {
  @ViewChild('NAV') nav:Nav;
  platform; 
  public pages: Array<{ titulo: string, component: any, icon: string}>;
  public identity;
  public url: string;
  rootPage:any = UserLogin;
  
  
  constructor(public appCtrl: App, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,private iab: InAppBrowser, public loadingCtrl: LoadingController, private _userService: UserService) {
    this.platform = platform;
    this.pages = [
      //{ titulo: 'Filtra tu Zipp', component: ListZonas, icon: 'ios-funnel-outline'},
      { titulo: 'Historial', component: UserHistory, icon: 'ios-timer-outline'},
      { titulo: 'Medios de Pago', component: Payment, icon: 'ios-card'},
      { titulo: 'Terminos y Condiciones', component: UserTerms, icon: 'ios-copy-outline'},
      //{ titulo: 'Mi perfil', component: UserEdit, icon: 'contact'},
      { titulo: 'Ayuda', component: HelpUser, icon: 'ios-information-circle-outline'},

      
    ];

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.identity = this._userService.getIdentity();
    if(this.identity){
      let loader = this.loadingCtrl.create({
        content: "Cargando Usuario...",
        duration: 3000
      });
      loader.present();
      this.rootPage=Dashboard;
    }
    else{
      this.rootPage=UserLogin;
    }
    this.url = GLOBAL.url;
  }
  //metodo que nos redirecciona a nuestra pagina web oficial
  reDir(){
    let browser = this.iab.create('http://www.zipp.com.co/');
    browser.show();
  }

  goTo(){
    this.nav.setRoot(UserEdit);
  }
  ionViewDidLoad() {
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }

  goToPage(page){
    this.nav.setRoot(page);
  }

  logOut(){
    //this.nav.setRoot(UserLogin);
    
    localStorage.clear();
    
    

    //start loading
    let loader = this.loadingCtrl.create({
      content: "Cerrando Sesión...",
      duration: 4000
    });
    loader.present();
    this.platform.exitApp();
  }
}

