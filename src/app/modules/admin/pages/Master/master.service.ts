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
  ) { }


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
    return this._httpClient.put(url, data, {
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
    return this._httpClient.delete(url, {
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

  getRole(id: number) {
    const url = `${apiurls.getRolesMatser}=${id}`
    return this._httpClient.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }


  getDivision(id: number) {

    const url = `${apiurls.getDivisionsMaster}=${id}`;
    return this._httpClient.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  getDesignationsInfo(id: number) {
    const url = `${apiurls.getDesignationsMaster}=${id}`;
    return this._httpClient.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
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
    return this._httpClient.put(url, data, {
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
    return this._httpClient.put(url, data, {
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
    return this._httpClient.put(url, data, {
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


  getDepartments() {
    return this._httpClient
      .get(apiurls.departmentsAddUpdateDelete)
      .pipe(catchError(this.handleError));
  }

  deleteDepartmentById(departmentId: number) {
    const url = `${apiurls.departmentsAddUpdateDelete}/${departmentId}`; // Construct the full URL with user ID
    return this._httpClient.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  updatDepartmentById(departmentId: number, data: any) {
    const url = `${apiurls.departmentsAddUpdateDelete}/${departmentId}`; // Construct the full URL with user ID
    return this._httpClient.put(url, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  createDepartments(data) {
    return this._httpClient
      .post(apiurls.departmentsAddUpdateDelete, data,)
      .pipe(catchError(this.handleError));
  }

  getDesignationHierachy() {
    return this._httpClient
      .get(apiurls.designationsHierachyAdd)
      .pipe(catchError(this.handleError));
  }

  updatDesignationHierachyById(data: any) {
    const url = `${apiurls.designationsHierachyAdd}`; // Construct the full URL with user ID
    return this._httpClient.put(url, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  createDesignationHierachy(data) {
    return this._httpClient
      .post(apiurls.designationsHierachyAdd, data,)
      .pipe(catchError(this.handleError));
  }


  getCaseFiles() {
    return this._httpClient
      .get(apiurls.caseFiles)
      .pipe(catchError(this.handleError));
  }

  deleteCaseFilesById(fileTypeId: number) {
    const url = `${apiurls.caseFiles}/${fileTypeId}`; // Construct the full URL with user ID
    return this._httpClient.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  updateCaseFilesById(fileTypeId: number, data: any) {
    const url = `${apiurls.caseFiles}/${fileTypeId}`; // Construct the full URL with user ID
    return this._httpClient.put(url, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }


  createCaseFiles(data) {
    return this._httpClient
      .post(apiurls.caseFiles, data,)
      .pipe(catchError(this.handleError));
  }

  getCorrespondenceFiles() {
    return this._httpClient
      .get(apiurls.correspondenceFiles)
      .pipe(catchError(this.handleError));
  }

  deleteCorrespondenceFilesById(fileTypeId: number) {
    const url = `${apiurls.correspondenceFiles}/${fileTypeId}`; // Construct the full URL with user ID
    return this._httpClient.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  updateCorrespondenceFilesById(fileTypeId: number, data: any) {
    const url = `${apiurls.correspondenceFiles}/${fileTypeId}`; // Construct the full URL with user ID
    return this._httpClient.put(url, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }


  createCorrespondenceFilesdata(data: any) {
    return this._httpClient
      .post(apiurls.correspondenceFiles, data,)
      .pipe(catchError(this.handleError));
  }


  designationsFilterByDepartmentId(id:number) {
    const url = `${apiurls.designationsFilterByDepartmentId}=${id}`; 
    return this._httpClient.get(url, {
    }).pipe(catchError(this.handleError));
}


  divisionsFilterByDepartmentId(id:number) {
    const url = `${apiurls.divisionsFilterByDepartmentId}=${id}`; 
    return this._httpClient.get(url, {
    }).pipe(catchError(this.handleError));
}

  designationsFilterByDivisionId(id:number) {
    const url = `${apiurls.designationsFilterByDivisionId}=${id}`; 
    return this._httpClient.get(url, {
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
