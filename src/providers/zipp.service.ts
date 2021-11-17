import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { GLOBAL } from './global';

@Injectable()
export class ZippService{

	headers: Headers;
	headersPost: Headers;
	public url:string;
	public identity;
	//public token;

	constructor(private _http: Http){
		this.url = GLOBAL.url;
	}

	// Metodo para obtener el lsitado de las zonas ZIPP desde la base de datos de mongo
    getZonasZipp(){

		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return this._http.get(this.url+'zonaszipp', optionspost).map(res => res.json());
		
		
	}
	
	// Metodo para obtener una sola zona ZIPP
    getZonaZipp(id){
        return this._http.get(this.url+'zonazipp/'+id).map(res => res.json());
	}

	// actualizar la zipp una vez tomada la zona
	/*
	updateZipp(zipp_to_update){
		let params = JSON.stringify(zipp_to_update);
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return new Promise ((resolve, reject)=>{
			this._http.put(this.url+'zonazippact/'+zipp_to_update._id, params,optionspost).subscribe(res=>{
				resolve(res);
			},(err)=>{
				resolve(err);
			});
		});
	}*/

	// actualizar la zipp una vez tomada la zona
    updateZipp(id, zipp_to_update){
		console.log(id, zipp_to_update);
        let params = JSON.stringify(zipp_to_update);
        this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

        // Haciendo la peticion y devolviendo los datos
        return this._http.put(this.url+'zonazippact/'+id, params, optionspost)
                         .map(res => res.json());
    }
	
	// Metodo para reservar zona zipp
	reservaZonaZipp(reservazona){
	let params = JSON.stringify(reservazona);
	this.headersPost = new Headers({'Content-Type':'application/json',
									'Access-Control-Allow-Origin':'*'
	});

	let optionspost = new RequestOptions({
		headers: this.headersPost
	})
	
	return this._http.post(this.url+'reservazonazipp', params, optionspost)
					 .map(res => res.json());
	}

	// actualizar la reserva una vez finalizada
	updateReserva(reserva_to_update){
		let params = JSON.stringify(reserva_to_update);
		//let headers = new Headers({'Content-Type':'application/json'});
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return this._http.put(this.url+'actualizareserva/'+reserva_to_update._id, params,optionspost).map(res => res.json());
		}
	
	
	getReservasZippByUser(id){
        return this._http.get(this.url+'reservaszippbyuser/'+id).map(res => res.json());
	}
	
	getReservas(){
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return this._http.get(this.url+'reservaszipp',optionspost).map(res => res.json());
	}


	
}