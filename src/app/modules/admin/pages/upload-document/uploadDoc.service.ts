import { Injectable } from '@angular/core';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from './uploadDoc.types';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { FileWithMetadata } from '../upload-files/model/upload-files.models';


@Injectable({
  providedIn: 'root'
})
export class UploadDocumentService {
private fileData: FileWithMetadata[] = [];
  private caseData: any;
  isPatch: boolean;
 /**
     * Constructor
     */
 constructor( private commonApiCallService: CommonApiCallService,private _httpClient: HttpClient)
 {
 }

geDistrictByStateData(
  stateId: number,
  divisionId: number
) {
  const url = `${apiurls.getDistrictByStateId}${stateId}?division_id=${divisionId}`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  return this.commonApiCallService.get(url)
    .pipe(catchError(this.handleError));
}


getUnitsByDistictIdData(
  districtId: number,
  divisionId: number
) {
  const url = `${apiurls.getUnitsByDistictId}${districtId}?division_id=${divisionId}`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  return this.commonApiCallService.get(url)
    .pipe(catchError(this.handleError));
}


  getState(id: number) {
    const url = `${apiurls.getState}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
  }

  uploadDocument(data:FormData) {
    return this.commonApiCallService.post(apiurls.uploadInfo, data).pipe(catchError(this.handleError));
  }


    updateCaseDetailsByIdData(id: number,data:FormData) {
       const url = `${apiurls.updateCaseDetailsById}/${id}/upload`;
    return this.commonApiCallService.post(url,data).pipe(catchError(this.handleError));
  }
  
  getMasterDropDownData() {
    return this.commonApiCallService.get(apiurls.getMasterDropDown).pipe(catchError(this.handleError));
  }

  updateUploadedDoc(pk: number, caseData: any) {
    const url = `${apiurls.casedataUpdate}${pk}`;
    return this.commonApiCallService.put(url, caseData); // or use .patch if partial update
  }

  markAsFavourite(fileId: number,divisionID:number) {
    const url = `${apiurls.favourite}/${fileId}/favourite?division_id=${divisionID}`;
    return this.commonApiCallService.post(url,{});
  }

  markAsUnFavourite(fileId: number,divisionID) {
    const url = `${apiurls.favourite}/${fileId}/unfavourite?division_id=${divisionID}`;
    return this.commonApiCallService.delete(url, {});
  }

  getCmoradmins(data:any) {
    const url = `${apiurls.getCmoradmins}`; 
    return this._httpClient.post(url,data, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
  }

  filePrevieAccessReqByUser(data: any) {
    return this._httpClient.post(apiurls.caseDataFilePreview, data, {
      responseType: 'blob', 
    }).pipe(
      catchError((error) => {
        console.error('Error in filePreviewData API:', error);
        return of(null); 
      })
    );
  }

   setState(files: FileWithMetadata[], caseData: any, isPatch:boolean) {
    this.fileData = files;
    this.caseData = caseData;
    this.isPatch = isPatch
  }

  getStateData() {
    return { files: this.fileData, caseData: this.caseData, isPatch: this.isPatch };
  }

  clearState() {
    this.fileData = [];
    this.caseData = null;
    this.isPatch=false;
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
