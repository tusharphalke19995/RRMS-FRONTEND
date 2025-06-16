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

  searchUser(data){
   return this._httpClient.post(apiurls.searchUsers,data,)
      .pipe(catchError(this.handleError));
  }


  updateUserById(userId: number, data: any) {
    const url = `${apiurls.updateUserById}${userId}`; // Construct the full URL with user ID
    return this._httpClient.patch(url, data, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

  getUserList(id:number) {
    const url = `${apiurls.getUsers}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}


  getUserRole(id: number) {
    const url = `${apiurls.getRole}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
  }

 
  getDivision(id:number) {
   
    const url = `${apiurls.getDivisionsMaster}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

getDesignationsInfo(id:number) {
    const url = `${apiurls.getDesignationsMaster}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}


  adminSetDefaultPwdInfo(userId: number, data: any) {
    const url = `${apiurls.adminSetDefaultPwd}${userId}`; // Construct the full URL with user ID
    return this._httpClient.post(url, data, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

  userSetPasswordInfo(userId: number, data: any) {
    const url = `${apiurls.userSetPassword}${userId}`; // Construct the full URL with user ID
    return this._httpClient.post(url, data, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}




getallRequests() {
    const url = `${apiurls.getallRequests}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

 setStatusPasswordReset(data) {
    return this._httpClient
      .post(apiurls.setStatusPasswordReset, data,)
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
