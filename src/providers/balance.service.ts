import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { GLOBAL } from './global';

@Injectable() 
export class BalanceService{

	headers: Headers;
	headersPost: Headers;
	public url:string;
	public identity;
	//public token;

	constructor(private _http: Http){
		this.url = GLOBAL.url;
	}
	// Metodo para obtener el balance code de la base de datos de mongo
    getBalanceCode(code){
		console.log('entro a servicio get balance');
		return this._http.get(this.url+'getbalance/'+code).map(res => res.json());
	}

	updateBalance(balance_to_update){
		console.log('entro al service de update con:'+balance_to_update._id);
		let params = JSON.stringify(balance_to_update);
		//let headers = new Headers({'Content-Type':'application/json'});
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return new Promise ((resolve, reject)=>{
			this._http.put(this.url+'updatebalance/'+balance_to_update._id, params,optionspost).subscribe(res=>{
				resolve(res);
			},(err)=>{
				resolve(err);
			});
		});
	}
}