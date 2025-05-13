import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CaseDataApprovalService
{  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}


  markasreadNotificationInfo(data:any) {
    return this._httpClient
      .post(apiurls.markasreadNotification,data)
      .pipe(catchError(this.handleError));
  }

getCasedataUploadApprovals(data) {
    return this._httpClient
      .post(apiurls.casedataUploadApprovals,data)
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


getApprovalsByGivenId(id: number) {
const url = `${apiurls.uploadApprovalsByID}/${id}`; // Construct the full URL with user ID
return this._httpClient.get(url,{
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}

sendReminderUploadApproval(requestId: number): Observable<any> {
    return this._httpClient.post(apiurls.sendReminderPendingApproval(requestId), {});
  }

  withdrawAccessUploadApproval(requestId: number): Observable<any> {
    return this._httpClient.post(apiurls.withdrawPendingApproval(requestId), {});
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
