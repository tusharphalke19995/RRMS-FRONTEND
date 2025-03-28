import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonApiCallService {
  constructor(private _httpClient: HttpClient) {}

  get(url: string): Observable<any> {
    return this._httpClient.get(url); 
  }

  post(url: string, data: any): Observable<any> {
    return this._httpClient.post(url, data);
  }

}