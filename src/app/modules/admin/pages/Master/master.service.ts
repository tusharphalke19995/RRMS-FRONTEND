import { Injectable } from "@angular/core";
import { take } from "lodash";
import { catchError, Observable, switchMap, throwError } from "rxjs";
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
export class MasterService {
  constructor(
    private _httpClient: HttpClient,
    private commonApiCallService: CommonApiCallService
  ) {}


  updateRole(role_id: number, data: any) {
    const url = `${apiurls.saveRole}/${role_id}`; // Construct the full URL with user ID
    return this._httpClient.put(url, data, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

updateDesignations(designation_id: number, data: any) {
  const url = `${apiurls.saveDesignations}/${designation_id}`; // Construct the full URL with user ID
  return this._httpClient.put(url, data,{
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}

updateDivision(division_id: number, data: any) {
  const url = `${apiurls.saveDivision}/${division_id}`; // Construct the full URL with user ID
  return this._httpClient.put(url, data, {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}


deleteRole(role_id: number) {
  const url = `${apiurls.saveRole}/${role_id}`; // Construct the full URL with user ID
  return this._httpClient.delete(url, {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}

deleteDesignations(designation_id: number) {
const url = `${apiurls.saveDesignations}/${designation_id}`; // Construct the full URL with user ID
return this._httpClient.delete(url,{
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}

deleteDivision(division_id: number) {
const url = `${apiurls.saveDivision}/${division_id}`; // Construct the full URL with user ID
return this._httpClient.delete(url, {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}

createDivision(data) {
  return this._httpClient
    .post(apiurls.saveDivision, data,)
    .pipe(catchError(this.handleError));
}

createDesignations(data) {
  return this._httpClient
    .post(apiurls.saveDesignations, data,)
    .pipe(catchError(this.handleError));
}

createRole(data) {
  return this._httpClient
    .post(apiurls.saveRole, data,)
    .pipe(catchError(this.handleError));
}

  getRole() {
    return this._httpClient
      .get(apiurls.getRolesMatser)
      .pipe(catchError(this.handleError));
  }

  getDivision() {
    return this._httpClient
      .get(apiurls.getDivisionsMaster)
      .pipe(catchError(this.handleError));
  }

  getDesignationsInfo() {
    return this._httpClient
      .get(apiurls.getDesignationsMaster)
      .pipe(catchError(this.handleError));
  }


  getFileTypes() {
    return this._httpClient
      .get(apiurls.getFileTypes)
      .pipe(catchError(this.handleError));
  }

  
deleteFileTypes(fileTypeId: number) {
  const url = `${apiurls.getFileTypes}/${fileTypeId}`; // Construct the full URL with user ID
  return this._httpClient.delete(url, {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}

updateFilesTypeById(fileTypeId: number, data: any) {
  const url = `${apiurls.getFileTypes}/${fileTypeId}`; // Construct the full URL with user ID
  return this._httpClient.put(url, data,{
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}


createFileType(data) {
  return this._httpClient
    .post(apiurls.getFileTypes, data,)
    .pipe(catchError(this.handleError));
}





getFileClassification() {
  return this._httpClient
    .get(apiurls.getFileClassification)
    .pipe(catchError(this.handleError));
}


deleteFileClassification(fileTypeId: number) {
const url = `${apiurls.getFileClassification}/${fileTypeId}`; // Construct the full URL with user ID
return this._httpClient.delete(url, {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}

updateFileClassificationById(fileTypeId: number, data: any) {
const url = `${apiurls.getFileClassification}/${fileTypeId}`; // Construct the full URL with user ID
return this._httpClient.put(url, data,{
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}


createFileClassification(data) {
return this._httpClient
  .post(apiurls.getFileClassification, data,)
  .pipe(catchError(this.handleError));
}



getCaseStatus() {
  return this._httpClient
    .get(apiurls.getCaseStatus)
    .pipe(catchError(this.handleError));
}


deleteCaseStatusById(caseStatusId: number) {
const url = `${apiurls.getCaseStatus}/${caseStatusId}`; // Construct the full URL with user ID
return this._httpClient.delete(url, {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}

updateCaseStatusById(caseStatusId: number, data: any) {
const url = `${apiurls.getCaseStatus}/${caseStatusId}`; // Construct the full URL with user ID
return this._httpClient.put(url, data,{
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
}).pipe(catchError(this.handleError));
}


createCaseStatus(data) {
return this._httpClient
  .post(apiurls.getCaseStatus, data,)
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
