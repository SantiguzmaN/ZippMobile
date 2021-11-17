// import ionic components
import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController,AlertController, ViewController,LoadingController  } from 'ionic-angular';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


// import component zona zipp
import { ZonaZipp } from '../zona-zipp/zona-zipp';
// model
import { Zona_Zipp } from '../../models/zonazipp';
import { ReservaZona } from '../../models/reservazipp'; 
import { User } from '../../models/user';

// import providers
import { UserService } from '../../providers/user.service';
import { ZippService } from '../../providers/zipp.service';

import { Geolocation } from '@ionic-native/geolocation';

import { GLOBAL } from '../../providers/global';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

declare var google;

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
  providers: [UserService,ZippService],
})
export class Dashboard {


  @ViewChild('map') mapElement: ElementRef;
  //autocomplete items
  GoogleAutocomplete: google.maps.places.AutocompleteService;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
//geocode items
  latitude: number;
  longitude: number;
  geo: any
  horaLocal:string;
  map: any;
  myLatLng: any;
  lat:number;
  long:number;
  address;
  waypoints: any[];
  public home:boolean;
  public burb:boolean;
  public user: User;
  public reservaszipp: ReservaZona[];
  public identity;
  public url: string;
  public zonaszipp: Zona_Zipp[];

  constructor(public viewCtrl: ViewController, 
              private zone: NgZone,
              public navCtrl: NavController, 
              private _userService: UserService,
              public alertCtrl: AlertController, 
              public loadingCtrl: LoadingController,
              private _zonazippService: ZippService, 
              private geolocation: Geolocation,
              public _http: Http) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.url = GLOBAL.url;
    this.home=true;
    this.burb=false;

    this.getUserById();
  }

  ionViewDidLoad() {
    console.log('¡Dashboard cargado!');
    this.identity = this._userService.getIdentity();
    this.getUserById();
    //this.initMap();
    this.inicio();
    this.getZonasZippByUser();
  }

  //metodo para usar el api de google places para autocopletar

  updateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input, componentRestrictions: {country: 'co'} },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
        });
      });
    });
  }

  //Metodo para seleccionar un lugar de la lista
  selectSearchResult(item) {
    this.location = item
    this.geo = item;
    this.geoCode(this.geo);
    this.placeid = this.location.place_id
  }
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/place/?q=place_id:'+this.placeid;
  }
  
  //Metodo para convertir la direccion en coordenadas gps
  geoCode(item) {
    let data=item.place_id;
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({'placeId': data }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        let lat = results[0].geometry.location.lat();
        let lng = results[0].geometry.location.lng();
        this.latitude = lat;
        this.longitude = lng;
        this.initMapFilter(this.latitude,this.longitude);
        this.autocompleteItems = [];
        this.autocomplete = { input: '' };
      }else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
      
   });
  }

  //Metodo para desplegar el menu de filtro
  inicio(){
    let alert = this.alertCtrl.create({
      title: 'Bienvenido a Zipp!',
      subTitle: 'Que tipo de vehiculo deseas Parquear? ',
      buttons: [
        {
        text: 'Carro',
        handler: data => {
            this.initMapCar();
        }
        },
        {
          text: 'Moto',
        handler: data => {
            this.initMapMo();
        }
        },
        {
          text: 'Bicicleta/Patineta',
          handler: data => {
            this.initMapBike();
        }
        },
        {
          text: 'Carga Electrica',
            handler: data => {
              this.initMapE();
        }
        },
        {
          text: 'Todos los Vehiculos',
          handler: data => {
            this.initMap();
        }
        },
        {
          text: 'Reservar Parqueadero',
          handler: data => {
            this.initMapRes();
        }
        }

      ]
  });
  alert.present();

  }
  
ngDoCheck(){
  	this.identity = this._userService.getIdentity();
  }


   horaIsOk (horario){ 
   if (horario=='(24/7) 24 horas del día, 7 días a la semana'){
      return true;
    }
    if (horario=='(Día) 05:00 am hasta 06:00 pm'){
      this.horaLocal=new Date().toLocaleTimeString();
      var numerito=new Date().getHours();
       if(numerito<5){
        return false;
        }
        if(numerito>=5 && numerito<17){
            return true;
        }
        if(numerito>=17){
            return false;
        } 
      
    }
    if (horario=='(Noche) 06:00 pm hasta 04:00 am'){
      this.horaLocal=new Date().toLocaleTimeString();
      var numerito=new Date().getHours();
      if(numerito>3 && numerito<18) {
       return false;
        }
        if(numerito>=18){
          return true;
        }
        if(numerito <= 3){
          return true;
        } 
    }
    if (horario=='(Oficina) 07:00 am hasta 12:00 m Y 02:00 pm hasta 06:00 pm'){
      this.horaLocal=new Date().toLocaleTimeString();
      var numerito=new Date().getHours();
      if(numerito<7){
        return false;
      }
      if(numerito>=7 && numerito<11){
          return true;
      }
      if(numerito>=11 && numerito<14){
        return false;
    }
      if(numerito>=14 && numerito<18){
          return true;
      }
      if(numerito>=18){
        return false;
      }
       
    }
  }

  //metodo para obtener usuariopor id y actualizar los datos
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

 //metodo para obtener las zonas zipp por el id del conductor

  getZonasZippByUser(){
    this._zonazippService.getReservasZippByUser(this.user._id).subscribe(
        response => {
            if(!response.reservas_zipp){
                
            }else{
                this.reservaszipp = response.reservas_zipp;  
                   
            }
        },
        error => {
            console.log(<any>error);
        }
    );
  }
  
  estReserva(estado){
    return this.reservaszipp.filter(y=>y.estado_reserva == estado);
  }
  
  buttonClick(reserva){
    this.navCtrl.setRoot(ZonaZipp, {zonazipp: reserva.zonazipp._id});
  }

  // Display google maps

  initMapFilter(lat:number, lng:number){
    // Obtener geolocalización
     
       
       let latLng = new google.maps.LatLng(lat,lng);
       
       let mapOptions = {
         center: latLng,
         disableDefaultUI: true,
         zoom: 16,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
       }
       
      
       this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 

       //invocación de las zonas zipp al mapa
       this.getZonasZipp();
       
     }

  initMap(){
   // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      
     
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 

      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 

      //invocación de las zonas zipp al mapa
      this.getZonasZipp();
      
    }, (err) => {
           console.log(err);
    });
  }

  initMapMo(){
    
    let loader = this.loadingCtrl.create({
      content: "Cargando zonas ZIPP para motocicletas...",
      duration: 4000
    });
    loader.present();

    // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 

      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 

      //invocación de las zonas zipp al mapa
      this.getZonasZippMoto();
      
    }, (err) => {
           console.log(err);
    });
  }

  initMapCar(){
    
    let loader = this.loadingCtrl.create({
      content: "Cargando zonas ZIPP para carros...",
      duration: 4000
    });
    loader.present();
     // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 

      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 

      //invocación de las zonas zipp al mapa
      this.getZonasZippCar();
      
    }, (err) => {
           console.log(err);
    });
  }

  initMapBike(){
    
    let loader = this.loadingCtrl.create({
      content: "Cargando zonas ZIPP para Bicicleta/Patineta...",
      duration: 4000
    });
    loader.present();
    // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 

      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 

      //invocación de las zonas zipp al mapa
      this.getZonasZippBike();
      
    }, (err) => {
           console.log(err);
    });
  }
  
  initMapE(){
    
    let loader = this.loadingCtrl.create({
      content: "Cargando zonas ZIPP para Carga Electrica...",
      duration: 4000
    });
    loader.present();
    // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 
      //invocación de las zonas zipp al mapa
      this.getZonasZippE();
      
    }, (err) => {
           console.log(err);
    });
  }

  initMapRes(){
    
    let loader = this.loadingCtrl.create({
      content: "Cargando zonas ZIPP para Reservar Parqueadero...",
      duration: 4000
    });
    loader.present();
    // Obtener geolocalización
    this.geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        disableDefaultUI: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#ececec"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#f0f0ef"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ececec"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21},{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d4d4d4"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#303030"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"geometry.stroke","stylers":[{"lightness":"-61"},{"gamma":"0.00"},{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dadada"},{"lightness":17}]}]
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
      // marcador
      let geoMarker = new google.maps.Marker({
        icon : 'assets/icon/icon-zipp.png',
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      }); 
      //invocación de las zonas zipp al mapa
      this.getZonasZippRes();
      
    }, (err) => {
           console.log(err);
    });
  }




  // Metodo para obtener las Zonas ZIPP para refrescar la base de datos
  getZonasZipp(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarker(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }


  getZonasZippCar(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarkerCar(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  getZonasZippMoto(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarkerMoto(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  getZonasZippBike(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarkerBike(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  getZonasZippE(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarkerE(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  getZonasZippRes(){
    this._zonazippService.getZonasZipp().subscribe(
      (response) => {
        if(!response){
                
        }else{
          this.zonaszipp = response.zonaszipp;
          this.addMarkerRes(this.zonaszipp);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  // Método que añade la información a los marcadores de cada zona zipp
  addInfoWindow(zonazipp, content, zona_zipp) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(zonazipp, 'click', () => {
      infoWindow.open(this.map, zonazipp);
    });

    google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
      document.getElementById('gMaps').addEventListener('click', () => {
        this.gozonazipp(zona_zipp);
      });
    });
    
  }

   
  // Método para añadir los marcadores de las zonas zipp
  addMarker(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';

        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
      

    }  
  } 

  addMarkerCar(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.car_type==true){
        if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';

        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
  }

    }  
  } 


  addMarkerMoto(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.motorcycle_type==true){
        if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
  }

    }  
  } 

  addMarkerBike(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.bike_type==true){
        if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';

        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
  }

    }  
  }

  addMarkerE(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.electric_station==true){
        if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
  }

    }  
  }  
  addMarkerRes(zonaszipp) {
    for(let zonazipp of zonaszipp) {
      var estado:Boolean=this.horaIsOk(zonazipp.horary);
      if(estado){
      if(zonazipp.isParking==true){
        if(zonazipp.estado_zonazipp){
        var position = new google.maps.LatLng(zonazipp.lat, zonazipp.lng);
        var marker_zipp = new google.maps.Marker({
          icon : 'assets/icon/icon.png',
          animation: google.maps.Animation.DROP,
          position: position
        }); 

        marker_zipp.setMap(this.map);

        var content = '<div id="iw-container">' +
                      '<div class="iw-content">'+ 
                        '<p><strong>Dirección: </strong>'+ zonazipp.address + '</p>' + 
                        '<img src="'+zonazipp.image_zona_zipp+'" style="width:100px;height:60px;">' +
                        '<p><strong>Costo por hora: </strong>$'+ zonazipp.price + '</p>' +
                        '<button class="iw-button" id="gMaps">Ver zipp</button>'+
                      '</div>'+
                      '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
        this.addInfoWindow(marker_zipp, content, zonazipp);
      }
    }
  }

    }  
  }  
  
  // route to component of zona zipp view
  gozonazipp(zonazipp){
    this.navCtrl.setRoot(ZonaZipp, {zonazipp: zonazipp._id});
  }
  
  Refresh(){
    this.navCtrl.setRoot(Dashboard);
  }
} 