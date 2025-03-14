import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from "@angular/common";
@Injectable({
    providedIn: 'root'
  })
  export class SharedService {

      defaultlan: any = "en"
      defaultlanSubjectBehvaiour = new BehaviorSubject('en');
      
      constructor(private _httpClient: HttpClient, @Inject(DOCUMENT) private document) {
       
        new BehaviorSubject<number>(0);
        if (sessionStorage.getItem('preferAdminLanguage') !== null) {
          this.onChangeDD(sessionStorage.getItem('preferAdminLanguage'))
        }
        else {
          this.onChangeDD('en')
        }
      }

      onChangeDD(defaultlan) {
        this.defaultlanSubjectBehvaiour.next(defaultlan);
        sessionStorage.setItem('preferAdminLanguage', defaultlan)
      }
  }