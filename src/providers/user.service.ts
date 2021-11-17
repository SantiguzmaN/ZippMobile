import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { GLOBAL } from './global';

@Injectable()
export class UserService{

	headers: Headers;
	headersPost: Headers;
	public url:string;
	public identity;
	//public token;

	constructor(private _http: Http){
		this.url = GLOBAL.url;
	}


	register(user_to_register){
		let params = JSON.stringify(user_to_register);
		let headers = new Headers({'Content-Type':'application/json'});

		return this._http.post(this.url+'register_conductor', params, {headers: headers})
						 .map(res => res.json());
	}


    
	signin(user_to_login, gettoken = null){
		/*
		if(gettoken != null){
			user_to_login.gettoken = gettoken;
		}*/

		let params = JSON.stringify(user_to_login);
		this.headersPost = new Headers({'Content-Type':'application/json',
		                                'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return new Promise ((resolve, reject)=>{
			this._http.post(this.url+'login_conductor',params,optionspost)
			.subscribe(res=>{
			  resolve(res);
			},(err)=>{
			  resolve(err);
			});
		});
		
	}

	
	getIdentity(){
		let identity = JSON.parse(localStorage.getItem('identity'));

		if (identity != "undefined") {
			this.identity = identity;
		}else{
			this.identity = null;
		}

		return this.identity;
	}

	/*	
	getToken(){
		let token = localStorage.getItem('token');

		if (token != "undefined") {
			this.token = token;
		}else{
			this.token = null;
		}

		return this.token;
	}*/

	
	updateUser(user_to_update){
		let params = JSON.stringify(user_to_update);
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return new Promise ((resolve, reject)=>{
			this._http.put(this.url+'update-user-conductor/'+user_to_update._id, params, optionspost).subscribe(res=>{
				resolve(res);
			},(err)=>{
				resolve(err);
			});
		});
    }


    getUser(id){
      	return this._http.get(this.url+'get-user-conductor/'+id).map(res => res.json());
	}

	//metodo para comparar los datos en la base de datos, si coiciden permitira cambiar la contraseña
    getUserPass(user_to_get){
		let params = JSON.stringify(user_to_get);
			console.log('entro con:'+params);
			this.headersPost = new Headers({'Content-Type':'application/json',
		                                'Access-Control-Allow-Origin':'*'
			});

			let optionspost = new RequestOptions({
				headers: this.headersPost
			})
			return new Promise ((resolve, reject)=>{
			this._http.post(this.url+'/get-user-pass', params,optionspost).subscribe(res=>{
				resolve(res);
			},(err)=>{
				resolve(err);
				console.log('error en la respuesta del servicio'+err);
			});
		});
	}

	//metodo para actualizar la contraseña del usuario
	updatePass(user_to_update){
		let params = JSON.stringify(user_to_update);
		this.headersPost = new Headers({'Content-Type':'application/json',
										'Access-Control-Allow-Origin':'*'
		});

		let optionspost = new RequestOptions({
			headers: this.headersPost
		})

		return new Promise ((resolve, reject)=>{
			this._http.put(this.url+'update-pass/'+user_to_update._id, params, optionspost).subscribe(res=>{
				resolve(res);
			},(err)=>{
				resolve(err);
			});
		});
    }
}