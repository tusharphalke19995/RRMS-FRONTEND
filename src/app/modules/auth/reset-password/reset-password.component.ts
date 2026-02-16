import { NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  MaxLengthValidator,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService, UserModel } from "app/core/auth/auth.service";
import { CustomValidators } from "app/shared/validators/customValidators";

@Component({
  selector: "auth-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FuseAlertComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild("signInNgForm") signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  resetPasswordForm: UntypedFormGroup;
  showAlert: boolean = false;
  divisionsRoles: any;
  authData: any;
  DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;
   kgid:any;
  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
     private _snackBar: MatSnackBar
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
     this.kgid = sessionStorage.getItem('id');
    // Create the form
    this.resetPasswordForm = this._formBuilder.group({
      // kgid: ["", [Validators.required]],
     newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validator: CustomValidators.passwordsMatch('newPassword', 'confirmPassword'),
      
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
submit(): void {
  if (this.resetPasswordForm.invalid) {
    // Trigger validation error for the custom password mismatch
    this.resetPasswordForm.markAllAsTouched();  // This will show validation errors
    return;
  }

  this.resetPasswordForm.disable();
  this.showAlert = false;
  const payload = {
    kgid: this.kgid,
    password: this.resetPasswordForm.value.newPassword,
  };

  this._authService.resetPassword(payload).subscribe({
    next: (response: any) => {
      console.log("Password reset response:", response);
    this._snackBar.open("Password reset successful.", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
          });
           this.resetPasswordForm.enable();
           this.resetPasswordForm.reset();
           this._router.navigateByUrl("sign-in");
    },
    error: (error) => {
      this.showAlert = true;
      this.alert = {
        type: "error",
        message: error.error.error,
      };
      // Re-enable the form in case of error
      this.resetPasswordForm.enable();
    },
  });
}


  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow only digits (0–9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  allowNumbersAndLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z0-9\s]$/.test(char) && char !== "Backspace") {
      event.preventDefault();
    }
  }
}
