import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
export interface UserModel {
    UserID: number | null;
    UserName: string | null;
    Email: string | null;
    RequestIP: string | null;
   
  }
@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

   

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }


    userLogin(data) {
        debugger
        return this._httpClient.post(apiurls.userLogin, data)
            .pipe(
                catchError((error) => {
                    console.error("API Error:", error);
                    // Return a user-friendly error message
                    return of({ success: false, message: error.error?.message || 'An error occurred. Please try again.' });
                })
            );
    }
    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Sign in using the token
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) =>
            {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if ( response.accessToken )
                {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    check(): Observable<boolean> {
        const token = this.accessToken;
        if (token) {
            return of(true);
        }
        return of(false);
    }

    getAuthData() {
        const token = localStorage.getItem('accessToken');
        const decodeToken = this.decodeToken(token);
        const employeeDetails = JSON.parse(decodeToken?.employeeDetails);
        const authData: UserModel = {
            UserID: Number(decodeToken.UserId),
            UserName: decodeToken.UserName,
            Email: decodeToken.Email,
            RequestIP: ''
        };
        return authData;
      }

      private decodeToken(token: string): any {
        const payload = token.split('.')[1]; // Get the payload part of the JWT
        const decodedPayload = atob(payload); // Decode the Base64 string
        return JSON.parse(decodedPayload); // Parse the JSON string into an object
    }
}
