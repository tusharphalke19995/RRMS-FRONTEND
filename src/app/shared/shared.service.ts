import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from "@angular/common";
@Injectable({
    providedIn: 'root'
  })
  export class SharedService {

      defaultlan: any = "en"
      defaultlanSubjectBehvaiour = new BehaviorSubject('en');

      private caseSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
      public caseData$: Observable<any[]> = this.caseSubject.asObservable();

      private filesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
      public files$: Observable<any[]> = this.filesSubject.asObservable();

      private getFilesBoolean: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true); // Initialize with a default value
      public getfiles$: Observable<boolean> = this.getFilesBoolean.asObservable();
    

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

      setFilesData(data: any[]) {
        this.filesSubject.next(data);
      }
 
      getFilesData(): Observable<any[]> {
        return this.files$; 
      }

      setFileBoolean(boolean) {
        this.getFilesBoolean.next(boolean);
      }
 
      getFileBoolean(): Observable<boolean> {
        return this.getfiles$; 
      }

      setCaseData(data: any[]) {
        this.caseSubject.next(data);
      }
 
      getCaseData(): Observable<any[]> {
        return this.caseData$; 
      }

  }