import { Injectable } from "@angular/core";
import { take } from "lodash";
import { catchError, Observable, of, switchMap, throwError } from "rxjs";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { CommonApiCallService } from "app/shared/services/common-api-call.service";
import { apiurls } from "app/shared/constants/api-urls.constant";
import { ErrorResponseModel } from "app/shared/models/error-model";

@Injectable({
  providedIn: "root",
})
export class SearchUserService {
  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}

  createUser(data) {
    return this._httpClient
      .post(apiurls.createUser, data,)
      .pipe(catchError(this.handleError));
  }

  getUserList() {
    return this._httpClient
      .get(apiurls.getUsers,)
      .pipe(catchError(this.handleError));
  }

  getUserRole() {
    return this._httpClient
      .get(apiurls.getRole,)
      .pipe(catchError(this.handleError));
  }

  getUserDivision() {
    return this._httpClient
      .get(apiurls.getDivision)
      .pipe(catchError(this.handleError));
  }

  getDesignationsInfo() {
    return this._httpClient
      .get(apiurls.getDesignations)
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
