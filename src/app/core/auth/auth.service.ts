import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { apiurls } from 'app/shared/constants/api-urls.constant';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
export interface UserModel {
    UserID: number | null;
    UserName: string | null;
    Email: string | null;
    Role: number | null;
    Permission:[],
    RoleName:string | null,
    DesignationName:string | null,
    DivisionsRoles:[],
    SuperAdmin:boolean,
    DivisionIds:[],
    DepartmentIds:[],
    Divisions:[]
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

    forgotPassword(kgid:any) {
    const url = `${apiurls.forgotPassword}/${kgid}`;
    return this._httpClient.post(url,{});
  }

    /**
     * Reset password
     *
     * @param password
     */
    setPassword(data:any): Observable<any>
    {
        return this._httpClient.post(apiurls.setPassword, data)
    }

    /**
     * Verify Otp
     *
     * @param password
     */
    verifyOtp(data:any): Observable<any>
    {
        return this._httpClient.post(apiurls.verifyOtp, data)
    }

      /**
     * Reset Password
     *
     * @param password
     */
    resetPassword(data:any): Observable<any>
    {
        return this._httpClient.post(apiurls.resetPassword, data)
    }



    userLogin(data): Observable<any> {
        return this._httpClient.post(apiurls.userLogin, data)
            .pipe(
                catchError((error) => {
                    console.error("API Error:", error);
                    return of({ success: false, message: error.error?.message || 'An error occurred. Please try again.' });
                }),
                switchMap((response: any) => {
                    if (response.responseData.access) {
                        this.accessToken = response.responseData.access; // Set the token
                    }
                    return of(response);
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

    private decodeToken(token: string): any {
        if (!token) {
            return null; 
        }
        const payload = token.split('.')[1]; 
        const decodedPayload = atob(payload); 
        return JSON.parse(decodedPayload);
    }

    // Method to get user data from the token
    getAuthData() {
        const token = this.accessToken;
        const decodedToken = this.decodeToken(token);
        console.log("decodedToken",decodedToken)
        if (decodedToken) {
            const authData: UserModel = {
                UserID: Number(decodedToken.user_id),
                UserName: decodedToken.full_name,
                Email: decodedToken.email,
                Role: decodedToken.role,
                Permission: decodedToken.permissions,
                RoleName: decodedToken.role_name,
                DesignationName: decodedToken.designation_name,
                DivisionsRoles:decodedToken.divisions_roles,
                SuperAdmin:decodedToken.is_superadmin,
                DivisionIds:decodedToken.divisionIds,
                DepartmentIds:decodedToken.departmentIds,
                Divisions:decodedToken.divisions
            };
            return authData; 
        }
        return null;
    }

    // Method to check if the token is expired
    isTokenExpired(): boolean {
        const token = this.accessToken;
        if (token) {
            const decodedToken = this.decodeToken(token);
            const expirationDate = decodedToken?.exp ? new Date(decodedToken.exp * 1000) : null;
            return expirationDate ? expirationDate < new Date() : true; // Check if the token is expired
        }
        return true; // Token is not present or expired
    }
}
