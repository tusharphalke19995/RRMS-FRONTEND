import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NotificationService
{  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}


  markasreadNotificationInfo(data:any) {
    return this._httpClient
      .post(apiurls.markasreadNotification,data)
      .pipe(catchError(this.handleError));
  }

  getFavouritesData() {
    return this._httpClient
      .get(apiurls.getFavourites,)
      .pipe(catchError(this.handleError));
  }

  getFilesLatestData() {
    return this._httpClient
      .get(apiurls.getFilesLatest)
      .pipe(catchError(this.handleError));
  }

  approveNotification(data:any){
    return this._httpClient
    .post(apiurls.approveFiles, data,)
    .pipe(catchError(this.handleError));
  }

  getUsersData(id:any) {
       const url = `${apiurls.getUsersData}${id}`; 
    return this._httpClient.get(url, {
    }).pipe(catchError(this.handleError));
  }

   sendPwdResetData(id:any){
           const url = `${apiurls.sendPwdReset}${id}`; 
    return this._httpClient.post(url, {
    }).pipe(catchError(this.handleError));
  }

  /**
   * The error handler.
   * @param err The http error response.
   * @returns The error response model.
   */
  private handleError(err: HttpErrorResponse) {
    const error = {} as ErrorResponseModel;
    if (err.error instanceof ErrorEvent) {
      error.message = err.error.message;
      error.statusCode = 400;
    } else {
      error.message = err.message;
      error.statusCode = err.status;
    }
    console.error(error);
    return throwError(() => error);
  }
}
