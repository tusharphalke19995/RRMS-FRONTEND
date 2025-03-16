import { Injectable } from '@angular/core';
import { take } from 'lodash';
import { Observable, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchUserService {

  constructor(private _httpClient: HttpClient) { }

   createUser(data) 
   {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this._httpClient.post(`http://127.0.0.1:8080/users/create/`, data, { headers: headers });
   }

   updateProduct()
   {
    this._httpClient.post<any>('api/apps/ecommerce/inventory/product', {})
   }

   getUserList()
   {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this._httpClient.get('http://127.0.0.1:8080/users/',{ headers: headers })
   }

   getUserRole()
   {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this._httpClient.get('http://127.0.0.1:8080/roles/',{ headers: headers })
   }

   
}
