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

        // Log the request for debugging
        console.log('Intercepting request:', request);

        if (token && !request.url.includes(this.LOGIN_URL)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': this.CONTENT_TYPE,
                    Accept: this.ACCEPT
                }
            });
        }

        return next.handle(request); 
    }
}