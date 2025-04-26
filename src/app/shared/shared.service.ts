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

      
      private activeUserSubject: BehaviorSubject<any> = new BehaviorSubject<any[]>([]);
      activeUserData$: Observable<any[]> = this.activeUserSubject.asObservable();

      private pendingReqSubject: BehaviorSubject<any> = new BehaviorSubject<any[]>([]);
      pendingReqData$: Observable<any[]> = this.activeUserSubject.asObservable();

      private latesFileSubject: BehaviorSubject<any> = new BehaviorSubject<any[]>([]);
      latesFileData$: Observable<any[]> = this.latesFileSubject.asObservable();

      private favFileSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
      favFileData$: Observable<any> = this.favFileSubject.asObservable();

      private notificationSubject: BehaviorSubject<any> = new BehaviorSubject<any[]>([]);
      getnotificationData$: Observable<any[]> = this.notificationSubject.asObservable();


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

      setActiveUserData(data: any[]) {
        this.activeUserSubject.next(data);
      }

      setLatestFilesData(data: any[]) {
        this.latesFileSubject.next(data);
      }
 
      setRecentFavFilesData(data) {
        this.favFileSubject.next(data);
      }
 
      setNotificationsInfo(data){
        this.notificationSubject.next(data)
      }

      setPendingApprovalData(data: any[]) {
        this.pendingReqSubject.next(data);
      }

  }