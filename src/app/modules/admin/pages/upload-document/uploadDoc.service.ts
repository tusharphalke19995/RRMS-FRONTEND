import { Injectable } from '@angular/core';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from './uploadDoc.types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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


   getUserDistrict() {
     return this.commonApiCallService
       .getWithHeader(apiurls.getDistrict, {})
       .pipe(catchError(this.handleError));
   }

   getState() {
    return this.commonApiCallService
      .getWithHeader(apiurls.getState, {})
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
