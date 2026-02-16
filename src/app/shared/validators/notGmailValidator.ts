import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notGmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (email && email.toLowerCase().endsWith('@gmail.com')) {
      return { 'notGmail': true }; // Custom error key
    }
    return null; // Valid email
  };
}
