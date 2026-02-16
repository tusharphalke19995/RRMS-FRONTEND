import { Injectable, inject } from '@angular/core';
import { take } from 'lodash';
import { catchError, Observable, of, switchMap, throwError, retry, timeout, delay } from 'rxjs';
import { InventoryProduct } from '../upload-document/uploadDoc.types';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonApiCallService } from 'app/shared/services/common-api-call.service';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { ErrorResponseModel } from 'app/shared/models/error-model';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SearchDocService {

  private _authService = inject(AuthService);

  constructor(private _httpClient: HttpClient,private commonApiCallService: CommonApiCallService) { }

  getUploadDocMetaData(data:any) {
    return this.commonApiCallService.post(apiurls.getUploadInfo, data).pipe(catchError(this.handleError));
  }
  
  filePreviewData(data: any): Observable<any> {
    // Use XMLHttpRequest for large files to avoid Angular HttpClient limitations
    return new Observable(observer => {
      let xhr: XMLHttpRequest | null = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptRequest = () => {
        if (xhr) {
          try { xhr.abort(); } catch (e) {}
        }
        
        xhr = new XMLHttpRequest();
        // Set a very long timeout for large files (30 minutes)
        xhr.timeout = 30 * 60 * 1000; // 30 minutes
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Check if response is empty
            if (!xhr.responseText || xhr.responseText.trim() === '') {
              console.warn('Empty response from filePreview API');
              observer.next(null);
              observer.complete();
              return;
            }
            
            // Try to parse JSON
            let response;
            try {
              response = JSON.parse(xhr.responseText);
            } catch (parseError) {
              // If JSON parsing fails, log the error and return null
              console.error('Failed to parse JSON response from filePreview API:', parseError);
              console.error('Response text (first 500 chars):', xhr.responseText.substring(0, 500));
              console.error('Response type:', xhr.responseType);
              console.error('Content-Type:', xhr.getResponseHeader('Content-Type'));
              
              // Return null instead of error to maintain backward compatibility
              observer.next(null);
              observer.complete();
              return;
            }
            
            // Check if response has error or is empty
            if (!response || (response.error && !response.base64_content && !response.mime_type)) {
              console.warn('Response indicates error or no data:', response);
              observer.next(null);
              observer.complete();
              return;
            }
            
            // Success - return the response
            observer.next(response);
            observer.complete();
          } else {
            const error = new HttpErrorResponse({ 
              error: xhr.responseText || 'Server error', 
              status: xhr.status, 
              statusText: xhr.statusText, 
              url: apiurls.filePreview 
            });
            
            // Retry on 5xx errors or connection issues
            if ((xhr.status >= 500 || xhr.status === 0) && retryCount < maxRetries) {
              retryCount++;
              const delayMs = 5000 * retryCount; // 5s, 10s, 15s
              console.log(`Retry attempt ${retryCount} for filePreview. Waiting ${delayMs/1000}s...`);
              setTimeout(() => attemptRequest(), delayMs);
            } else {
              observer.error(error);
            }
          }
        });

        xhr.addEventListener('error', () => {
          if (retryCount < maxRetries) {
            retryCount++;
            const delayMs = 5000 * retryCount;
            console.log(`Retry attempt ${retryCount} for filePreview after connection error. Waiting ${delayMs/1000}s...`);
            setTimeout(() => attemptRequest(), delayMs);
          } else {
            observer.error(new HttpErrorResponse({ 
              error: 'Connection failed. The file may be too large (>1GB) or the server is unavailable. Please try again or contact administrator.', 
              status: 0, 
              statusText: 'Connection Error', 
              url: apiurls.filePreview 
            }));
          }
        });

        xhr.addEventListener('timeout', () => {
          if (retryCount < maxRetries) {
            retryCount++;
            const delayMs = 5000 * retryCount;
            console.log(`Retry attempt ${retryCount} for filePreview after timeout. Waiting ${delayMs/1000}s...`);
            setTimeout(() => attemptRequest(), delayMs);
          } else {
            observer.error(new HttpErrorResponse({ 
              error: 'Request timeout. The file may be too large (>1GB) or the server is slow. Please try again or contact administrator.', 
              status: 408, 
              statusText: 'Request Timeout', 
              url: apiurls.filePreview 
            }));
          }
        });

        // Get auth token
        const token = this._authService.accessToken;
        
        xhr.open('POST', apiurls.filePreview, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        // Set responseType to 'text' to handle both JSON and non-JSON responses
        xhr.responseType = 'text';
        
        try {
          xhr.send(JSON.stringify(data));
        } catch (e) {
          observer.error(new HttpErrorResponse({ 
            error: 'Failed to send request: ' + (e as Error).message, 
            status: 0, 
            statusText: 'Send Error', 
            url: apiurls.filePreview 
          }));
        }
      };

      attemptRequest();
      
      return () => { 
        try { 
          xhr?.abort(); 
        } catch (e) {} 
      };
    }).pipe(
      catchError((error) => {
        console.error('Error in filePreviewData API:', error);
        // Return null instead of throwing to maintain backward compatibility
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
