import { NgIf } from "@angular/common";
import { HttpClient } from "@angular/common/http";
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
import { DialogService } from "app/modules/admin/pages/common/dialog.service";
import { emailDomainValidator } from "app/shared/validators/emailDomainValidator";

@Component({
  selector: "auth-req-admin-reset",
  templateUrl: "./req-admin-reset.component.html",
  styleUrl: "./req-admin-reset.component.scss",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    FuseAlertComponent,
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
export class RequestAdminResetComponent implements OnInit {
  @ViewChild("signInNgForm") signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  requestAdminResetForm: UntypedFormGroup;
  showAlert: boolean = false;
  divisionsRoles: any;
  authData: any;
  DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;

  MINUTES_UNITL_AUTO_LOGOUT = 10; // in mins
  lock_account_user: any;
  CHECK_INTERVAL = 300000; // in ms
  logout_Due_To_Inactivity: any;
  STORE_KEY = "lastAction";
  /**
   * Constructor
   */
  constructor(
         private http: HttpClient,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private dialogService:DialogService,
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
    this.requestAdminResetForm = this._formBuilder.group({
      kgid: ["", [Validators.required]],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
       email: [
              '',
              [Validators.required, Validators.email],
              [emailDomainValidator('https://rrms-backend.onrender.com/mdm/domain/names', this.http)]
            ],
        mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
    });
  }

   get email() {
    return this.requestAdminResetForm.get('email');
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
  signIn(): void {
    if (this.requestAdminResetForm.invalid) {
      return;
    }
    this.requestAdminResetForm.disable();
    this.showAlert = false;

    const payload = {
      kgid: this.requestAdminResetForm.value.kgid,
      first_name: this.requestAdminResetForm.value.firstName,
      last_name: this.requestAdminResetForm.value.lastName,
      email: this.requestAdminResetForm.value.email,
      mobileno:this.requestAdminResetForm.value.mobileNo,
    };

    this._authService.requestAdminReset(payload).subscribe({
      next: (response: any) => {
      
         this.dialogService.openSuccessDialog(
            "Success",
            "Request received by admin. You shall be notified shortly."
          );
           this.requestAdminResetForm.enable();
          this.requestAdminResetForm.reset();
          this._router.navigateByUrl("/sign-in")
      },
              error: (error) => {
          console.error("Login error:", error);
          this.showAlert = true;
          this.alert = {
            type: "error",
            message: error.error.error,
          };
           this._snackBar.open( error.error.error, "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
          this.requestAdminResetForm.enable();
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

  /*+++++++++++++++++++++++++++++++++++++ End  refreshCaptcha().+++++++++++++++++++++++++*/

  allowNumbersAndLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z0-9\s]$/.test(char) && char !== "Backspace") {
      event.preventDefault();
    }
  }
    allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

}
