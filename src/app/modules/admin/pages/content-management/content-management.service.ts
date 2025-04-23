import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ContentManagementService
{  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}


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
