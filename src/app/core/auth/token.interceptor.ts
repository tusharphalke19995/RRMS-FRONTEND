import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private readonly LOGIN_URL = 'users/login/'; // Constant for login URL
    private readonly CONTENT_TYPE = 'application/json';
    private readonly ACCEPT = 'application/json';

    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.accessToken; 

        if (token && !request.url.includes(this.LOGIN_URL)) {
            // Don't set Content-Type for FormData - browser needs to set it with boundary
            const isFormData = request.body instanceof FormData;
            const headers: any = {
                Authorization: `Bearer ${token}`,
                Accept: this.ACCEPT
            };
            
            // Only set Content-Type if it's NOT FormData
            if (!isFormData) {
                headers['Content-Type'] = this.CONTENT_TYPE;
            }
            
            request = request.clone({
                setHeaders: headers
            });
        }

        return next.handle(request);
    }
}