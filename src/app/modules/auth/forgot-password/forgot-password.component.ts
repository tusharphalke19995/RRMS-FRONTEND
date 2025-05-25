import { NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
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
import { AuthService } from "app/core/auth/auth.service";
import { notGmailValidator } from "app/shared/validators/notGmailValidator";
import { finalize } from "rxjs";

@Component({
  selector: "auth-forgot-password",
  styleUrl: "./forgot-password.component.scss",
  templateUrl: "./forgot-password.component.html",
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
export class AuthForgotPasswordComponent implements OnInit {
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  forgotPasswordForm: UntypedFormGroup;
  showAlert: boolean = false;
  divisionsRoles: any;
  authData: any;
  DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;
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
    // Create the form
    this.forgotPasswordForm = this._formBuilder.group({
      kgid: ["", [Validators.required]],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
  signIn(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.forgotPasswordForm.disable();
    this.showAlert = false;
    this._authService
      .forgotPassword(this.forgotPasswordForm.value.kgid)
      .subscribe({
        next: (response: any) => {
          console.log("response", response);
          this._snackBar.open("OTP sent to registered email.", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this.forgotPasswordForm.enable();
          this.forgotPasswordForm.reset();
          this._router.navigateByUrl('otp-verify')
        },
        error: (error) => {
          console.error("Login error:", error);
          this.showAlert = true;
          this.alert = {
            type: "error",
            message: "An error occurred during login. Please try again.",
          };
          this.forgotPasswordForm.enable();
        },
      });
  }

  allowNumbersAndLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z0-9\s]$/.test(char) && char !== "Backspace") {
      event.preventDefault();
    }
  }
}
