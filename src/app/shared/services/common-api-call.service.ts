import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CashewUtil } from '../utils/cashew.util';

@Injectable({
  providedIn: 'root',
})
export class CommonApiCallService {
  options: { context: HttpContext } = null;

  constructor(public httpClient: HttpClient) {
    this.options = { context: CashewUtil.context };
  }

  get(url: string, isCached = false): Observable<any> {
    return isCached ? this.httpClient.get(url, this.options) : this.httpClient.get(url);
  }

  getByIds(url: string, id: number, policeStationId: number, isCached = false): Observable<any> {
    const apiUrl = url + id + '/' + policeStationId;
    return isCached ? this.httpClient.get(apiUrl, this.options) : this.httpClient.get(apiUrl);
  }

  getById(url: string, id: number, isCached = false): Observable<any> {
    const apiUrl = url + id;
    return isCached ? this.httpClient.get(apiUrl, this.options) : this.httpClient.get(apiUrl);
  }

  getByObject(url:string,body: any, headers: any): Observable<any> {
    let params=new HttpParams().set("requestModel",encodeURIComponent(body));
    return this.httpClient.get(url,{ headers: headers,params:params });
  }

  getBlob(url: string): Observable<any> {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  getBlobPost(url: string, payload: any): Observable<any> {
    let params = new HttpParams();
    return this.httpClient.post(url,payload, { responseType: 'blob', params });
  }

  post(url: string, body: any): Observable<any> {
    return this.httpClient.post(url, body);
  }

  put(url: string, body: any): Observable<any> {
    return this.httpClient.put(url, body);
  }

  delete(url: string, id: number): Observable<any> {
    const apiUrl = url + id;
    return this.httpClient.delete(apiUrl);
  }

  postBlob(url: string, body: any): Observable<any> {
    return this.httpClient.post(url, body, { responseType: 'blob' });
  }

  postWithHeader(url: string, body: any, headers: any): Observable<any> {
    return this.httpClient.post(url, body, { headers: headers });
  }

  getWithHeader(url: string, headers: any): Observable<any> {
    return this.httpClient.get(url, { headers: headers });
  }
}
