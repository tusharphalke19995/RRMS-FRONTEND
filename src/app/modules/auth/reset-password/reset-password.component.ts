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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService, UserModel } from "app/core/auth/auth.service";

@Component({
  selector: "auth-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrl: './reset-password.component.scss',
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
  divisionsRoles:any;
  authData:any;
    DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;
  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.resetPasswordForm = this._formBuilder.group({
      // currentPassword: [
      //   "",
      //   [
      //     Validators.required,
      //     // Validators.pattern(
      //     //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      //     // ),
      //   ],
      // ],
      // newPassword: [
      //   "",
      //   [
      //     Validators.required,
      //     // Validators.pattern(
      //     //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      //     // ),
      //   ],
      // ],
      //  confirmPassword: [
      //   "",
      //   [
      //     Validators.required,
      //     // Validators.pattern(
      //     //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      //     // ),
      //   ],
      // ],
       firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      emailID: ["", [Validators.required, Validators.email]],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
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
        return;
    }
    this.resetPasswordForm.disable();
    this.showAlert = false;

    const payload = {
        kgid: this.resetPasswordForm.value.kgid,
        password: this.resetPasswordForm.value.password,
    };

    this._authService.userLogin(payload).subscribe({
        next: (response: any) => {
            console.log("response", response);
              if (response.statusCode ==200) {
                this._authService.accessToken = response.responseData.access; 
                setTimeout(() => {
                  this.checkDesignationObj();
                }, 2000);

            } else {
          
                this.showAlert = true;
                this.alert = { type: 'error', message: 'Login failed. Please check your credentials.' };
                this.resetPasswordForm.enable();
            }
        },
        error: (error) => {
            console.error("Login error:", error);
            this.showAlert = true;
            this.alert = { type: 'error', message: 'An error occurred during login. Please try again.' };
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
  
  checkDesignationObj() {
    this.extractDivisionAndDepartmentIds();
    const divisionCount = this.DivisionIdsUserLogin?.length || 0;
    const departmentCount = this.DepartmentIdsUserLogin?.length || 0;

    if (divisionCount > 1 || departmentCount > 1) {
      this._router.navigateByUrl("/division-selection");
    } else {
      this._router.navigateByUrl("/dashboard");
    }
  }

  extractDivisionAndDepartmentIds(): void {
    this.authData = this._authService.getAuthData();
    this.DivisionIdsUserLogin = this.authData.Divisions.flatMap(division => division.divisionIds);
    this.DepartmentIdsUserLogin = this.authData.Divisions.flatMap(division => division.departmentIds);

    // Store divisionID
    if (this.DivisionIdsUserLogin.length === 1) {
      sessionStorage.setItem("divisionID", String(this.DivisionIdsUserLogin[0]));
    } else {
      sessionStorage.setItem("divisionID", JSON.stringify(this.DivisionIdsUserLogin));
    }

    // Store departmentID
    if (this.DepartmentIdsUserLogin.length === 1) {
      sessionStorage.setItem("departmentID", String(this.DepartmentIdsUserLogin[0]));
    } else {
      sessionStorage.setItem("departmentID", JSON.stringify(this.DepartmentIdsUserLogin));
    }
  }
  
  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

}
