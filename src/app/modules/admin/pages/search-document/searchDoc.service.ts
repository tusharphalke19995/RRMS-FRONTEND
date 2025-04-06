import { Injectable } from '@angular/core';
import { take } from 'lodash';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { InventoryProduct } from '../upload-document/uploadDoc.types';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';

@Injectable({
  providedIn: 'root'
})
export class SearchDocService {

  constructor(private _httpClient: HttpClient,private commonApiCallService: CommonApiCallService) { }

  getUploadDocMetaData(data:any) {
    return this.commonApiCallService.post(apiurls.getUploadInfo, data).pipe(catchError(this.handleError));
  }


  filePreviewData(data: any) {
    return this._httpClient.post(apiurls.filePreview, data, {
      responseType: 'blob', 
    }).pipe(
      catchError((error) => {
        console.error('Error in filePreviewData API:', error);
        return of(null); 
      })
    );
  }


   createProduct() 
   {
    this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {})
   }

   updateProduct()
   {
    this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {})
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
