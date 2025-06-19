import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchiveTreeService {


 /**
     * Constructor
     */
 constructor( private commonApiCallService: CommonApiCallService,private _httpClient: HttpClient)
 {
 }


    
  getArchiveFolderTree(id:number) {
     const url = `${apiurls.archiveFolderTreeView}?division_id=${id}`
    return this.commonApiCallService.get(url).pipe(catchError(this.handleError));
  }

  unarchiveFolderTreeView(data:any) {
     const url = `${apiurls.unarchiveFolderTreeView}`
    return this.commonApiCallService.post(url,data).pipe(catchError(this.handleError));
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
