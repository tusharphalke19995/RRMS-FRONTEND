import { Injectable } from '@angular/core';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from './uploadDoc.types';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { apiurls } from 'app/shared/constants/api-urls.constant';

@Injectable({
  providedIn: 'root'
})
export class UploadDocumentService {

 /**
     * Constructor
     */
 constructor( private commonApiCallService: CommonApiCallService,private _httpClient: HttpClient)
 {
 }

   geDistrictByStateData(stateId: number) {
    const url = `${apiurls.getDistrictByStateId}${stateId}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(catchError(this.handleError));
}

getUnitsByDistictIdData(districtId: number) {
  const url = `${apiurls.getUnitsByDistictId}${districtId}`; 
  return this._httpClient.get(url, {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      })
  }).pipe(catchError(this.handleError));
}

   getState() {
    return this.commonApiCallService
      .get(apiurls.getState)
      .pipe(catchError(this.handleError));
  }

  uploadDocument(data:FormData) {
    return this.commonApiCallService.post(apiurls.uploadInfo, data).pipe(catchError(this.handleError));
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
