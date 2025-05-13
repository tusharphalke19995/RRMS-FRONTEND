import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class RequestAccessService
{  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}


getContentManagerReqData(data:any) {
  const url = `${apiurls.getContentManagerReq}`
  return this._httpClient.post(url,data,{
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}


sendReminder(requestId: number): Observable<any> {
    return this._httpClient.post(apiurls.sendReminder(requestId), {});
  }

  withdrawAccessRequest(requestId: number): Observable<any> {
    return this._httpClient.post(apiurls.withdrawRequest(requestId), {});
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
