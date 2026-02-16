import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, map, catchError, switchMap } from 'rxjs/operators';

export function emailDomainValidator(apiUrl: string, http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
    const email = control.value;
    if (!email) {
      return of(null); 
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return of({ invalidEmail: true }); 
    }

    return http.get<string[]>(apiUrl).pipe(
      debounceTime(300),
      switchMap((allowedDomains) => {
        return allowedDomains.includes(domain)
          ? of(null)
          : of({ domainNotAllowed: true });
      }),
      catchError(() => of(null)) 
    );
  };
}
