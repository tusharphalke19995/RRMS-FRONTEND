import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { FolderNode, FileNode } from '../models/folder-tree.model';
import { environment } from 'environments/environment';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { ErrorResponseModel } from 'app/shared/models/error-model';

@Injectable({
  providedIn: 'root'
})
export class FolderTreeService {
  private currentData = new BehaviorSubject<FolderNode[]>([]);


   constructor(
      private _httpClient: HttpClient,
      private commonApiCallService: CommonApiCallService
    ) {}
  
    folderTreeView(data: any) {
      return this._httpClient
        .post(apiurls.folderTreeView, data)
        .pipe(catchError(this.handleError));
    }
  

  getFolderData(data: any) {
    return this._httpClient
      .post(apiurls.folderTree, data)
      .pipe(catchError(this.handleError));
  }

  moveFilesInfo(data: any) {
    return this._httpClient
      .post(apiurls.moveFiles, data)
      .pipe(catchError(this.handleError));
  }

  archiveFiles(data: any) {
    return this._httpClient
      .post(apiurls.archiveFiles, data)
      .pipe(catchError(this.handleError));
  }

    copyFilesInfo(data: any) {
    return this._httpClient
      .post(apiurls.copyFiles, data)
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