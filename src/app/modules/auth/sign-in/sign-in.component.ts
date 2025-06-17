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
  selector: "auth-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrl: "./sign-in.component.scss",
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
export class AuthSignInComponent implements OnInit {
  @ViewChild("signInNgForm") signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  signInForm: UntypedFormGroup;
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
    this.signInForm = this._formBuilder.group({
      kgid: ["", [Validators.required]],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
      // rememberMe: [''],
    });

    this.check();
    this.initListener();
    this.initInterval();
    sessionStorage.setItem(this.STORE_KEY, Date.now().toString());
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
  signIn(): void {
    if (this.signInForm.invalid) {
      return;
    }
    this.signInForm.disable();
    this.showAlert = false;

    const payload = {
      kgid: this.signInForm.value.kgid,
      password: this.signInForm.value.password,
    };

    this._authService.userLogin(payload).subscribe({
      next: (response: any) => {
        console.log("response", response);
        if (response.statusCode == 200) {
          if (response.passwordSet === false) {
            sessionStorage.setItem('id',this.signInForm.value.kgid)
            this._router.navigateByUrl("reset-password");
          } else {
            this._authService.accessToken = response.responseData.access;
            setTimeout(() => {
              this.checkDesignationObj();
            }, 2000);
          }
        } else {
          this.showAlert = true;
          this.alert = {
            type: "error",
            message: "Login failed. Please check your credentials.",
          };
          this.signInForm.enable();
        }
      },
      error: (error) => {
        console.error("Login error:", error);
        this.showAlert = true;
        this.alert = {
          type: "error",
          message: "An error occurred during login. Please try again.",
        };
        this.signInForm.enable();
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
    this.DivisionIdsUserLogin = this.authData.Divisions.flatMap(
      (division) => division.divisionIds
    );
    this.DepartmentIdsUserLogin = this.authData.Divisions.flatMap(
      (division) => division.departmentIds
    );

    // Store divisionID
    if (this.DivisionIdsUserLogin.length === 1) {
      sessionStorage.setItem(
        "divisionID",
        String(this.DivisionIdsUserLogin[0])
      );
    } else {
      sessionStorage.setItem(
        "divisionID",
        JSON.stringify(this.DivisionIdsUserLogin)
      );
    }

    // Store departmentID
    if (this.DepartmentIdsUserLogin.length === 1) {
      sessionStorage.setItem(
        "departmentID",
        String(this.DepartmentIdsUserLogin[0])
      );
    } else {
      sessionStorage.setItem(
        "departmentID",
        JSON.stringify(this.DepartmentIdsUserLogin)
      );
    }
  }

  check() {
    const now = Date.now();
    const timeleft =
      this.getLastAction() + this.MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;

    const isTimeout = diff < 0;

    if (isTimeout) {
      this.logout();
    }
  }

  getLastAction() {
    return parseInt(sessionStorage.getItem(this.STORE_KEY));
  }
  setLastAction(lastAction: number) {
    sessionStorage.setItem(this.STORE_KEY, lastAction.toString());
  }

  /**
   *Created At:19/05/2025
   *Updated At:
   * Method for onPaste().
   * Check user do click, keydown, keyup, keypress, scroll */
  initListener() {
    document.body.addEventListener("click", () => this.reset());
    document.body.addEventListener("keydown", () => this.reset());
    document.body.addEventListener("keyup", () => this.reset());
    document.body.addEventListener("keypress", () => this.reset());
    document.body.addEventListener("scroll", () => this.reset());
  }

  /*+++++++++++++++++++++++++++++++++++++ End  refreshCaptcha().+++++++++++++++++++++++++*/

  /**
   *Created At:19/05/2025
   *Updated At:
   * Method for initInterval(). */

  initInterval() {
    setInterval(() => {
      this.check();
    }, this.CHECK_INTERVAL);
  }

  /*+++++++++++++++++++++++++++++++++++++ End  initInterval().+++++++++++++++++++++++++*/

  /**
   *Created At:19/5/2025
   *Updated At:
   * Method for onPaste(). */
  reset() {
    this.setLastAction(Date.now());
  }

  logout() {
    sessionStorage.clear();
    this._router.navigateByUrl("sign-out");
  }

  allowNumbersAndLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z0-9\s]$/.test(char) && char !== "Backspace") {
      event.preventDefault();
    }
  }
}
