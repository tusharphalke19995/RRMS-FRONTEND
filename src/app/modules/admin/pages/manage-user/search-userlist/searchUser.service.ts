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
    return this.commonApiCallService
      .postWithHeader(apiurls.createUser, data, {})
      .pipe(catchError(this.handleError));
  }


  userLogin(data) {
    debugger
    return this.commonApiCallService
        .post('http://127.0.0.1:8000/users/login/', data)
        .pipe(
            catchError((error) => {
                console.error("API Error:", error);
                // Return a user-friendly error message
                return of({ success: false, message: error.error?.message || 'An error occurred. Please try again.' });
            })
        );
}

  getUserList() {
    return this.commonApiCallService
      .get(apiurls.getUsers,)
      .pipe(catchError(this.handleError));
  }

  getUserRole() {
    return this.commonApiCallService
      .getWithHeader(apiurls.getRole, {})
      .pipe(catchError(this.handleError));
  }

  getUserDivision() {
    return this.commonApiCallService
      .getWithHeader(apiurls.getDivision, {})
      .pipe(catchError(this.handleError));
  }

  getDesignationsInfo() {
    return this.commonApiCallService
      .getWithHeader(apiurls.getDesignations, {})
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
