import { Injectable, inject } from '@angular/core';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from './uploadDoc.types';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError, retry, timeout } from 'rxjs';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { FileWithMetadata } from '../upload-files/model/upload-files.models';
import { AuthService } from 'app/core/auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class UploadDocumentService {
private fileData: FileWithMetadata[] = [];
  private caseData: any;
  isPatch: boolean;
  draftInfo:any;
  isDraft:boolean;
 /**
     * Constructor
     */
 private _authService = inject(AuthService);
 
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

  private uploadWithXHR(url: string, data: FormData, reportProgress: boolean, progressCallback?: (progress: number, loaded: number, total: number) => void): Observable<any> {
    return new Observable(observer => {
      let xhr: XMLHttpRequest | null = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptUpload = () => {
        if (xhr) {
          try { xhr.abort(); } catch (e) {}
        }
        
        xhr = new XMLHttpRequest();
        xhr.timeout = 0; // No timeout
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && reportProgress) {
            const progress = Math.round((e.loaded / e.total) * 100);
            progressCallback?.(progress, e.loaded, e.total);
            observer.next({ type: HttpEventType.UploadProgress, loaded: e.loaded, total: e.total });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              observer.next({ type: HttpEventType.Response, body: JSON.parse(xhr.responseText) });
            } catch {
              observer.next({ type: HttpEventType.Response, body: xhr.responseText });
            }
            observer.complete();
          } else {
            observer.error(new HttpErrorResponse({ error: xhr.responseText, status: xhr.status, statusText: xhr.statusText, url }));
          }
        });

        xhr.addEventListener('error', () => {
          if (retryCount < maxRetries && xhr.status === 0) {
            retryCount++;
            const delay = 30000 * retryCount; // 30s, 60s, 90s
            console.log(`Retry attempt ${retryCount} for upload. Waiting ${delay/1000}s...`);
            setTimeout(() => attemptUpload(), delay);
          } else {
            observer.error(new HttpErrorResponse({ 
              error: 'Connection failed. The server may be rejecting large files. Please contact your administrator or try smaller files.', 
              status: 0, 
              statusText: 'Connection Reset', 
              url 
            }));
          }
        });

        xhr.addEventListener('abort', () => {
          observer.error(new HttpErrorResponse({ error: 'Upload aborted', status: 0, statusText: 'Aborted', url }));
        });

        // Get auth token for header
        const token = this._authService.accessToken;
        
        xhr.open('POST', url, true);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        // DO NOT set Content-Type - browser will set it with boundary for multipart/form-data
        
        xhr.send(data);
      };

      attemptUpload();
      return () => { try { xhr?.abort(); } catch (e) {} };
    }).pipe(catchError(this.handleError));
  }

  uploadDocument(data: FormData, reportProgress: boolean = true, progressCallback?: (progress: number, loaded: number, total: number) => void): Observable<any> {
    return this.uploadWithXHR(apiurls.caseDataSubmit, data, reportProgress, progressCallback);
  }


  saveDraftInfo(data:FormData) {
    return this.commonApiCallService.post(apiurls.saveDraft, data).pipe(catchError(this.handleError));
  }


    updateCaseDetailsByIdData(id: number, data: FormData, reportProgress: boolean = true, progressCallback?: (progress: number, loaded: number, total: number) => void): Observable<any> {
      return this.uploadWithXHR(`${apiurls.updateCaseDetailsById}/${id}/upload`, data, reportProgress, progressCallback);
    }
  
  getMasterDropDownData() {
    return this.commonApiCallService.get(apiurls.getMasterDropDown).pipe(catchError(this.handleError));
  }
    
  getCaseDataDraftsData(id:number) {
     const url = `${apiurls.getCaseDataDrafts}/${id}`
    return this.commonApiCallService.get(url).pipe(catchError(this.handleError));
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

    setDraftData(draftInfo:any) {
    this.draftInfo = draftInfo;
  }

  getDraftData() {
    return { draftInfo: this.draftInfo};
  }

  clearDraft() {
    this.draftInfo = null;
  }

   finalreportCaseStatusById(id: number) {
    const url = `${apiurls.finalreportCaseStatus}=${id}`; 
    return this._httpClient.get(url, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
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
