import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static passwordsMatch(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey);
      const confirmPassword = group.get(confirmPasswordKey);

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordsMismatch: true };
      }

      return null; 
    };
  }
}
