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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "auth-sign-in",
  templateUrl: "./sign-in.component.html",
  // styleUrl: './sign-in.component.scss',
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
      password: ["", Validators.required],
      // rememberMe: [''],
    });
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
            if (response.access) {
              // if (response.statusCode ==200) {
                // this._authService.accessToken = response.responseData.access; 
                this._authService.accessToken = response.access; 
                this._router.navigateByUrl("/dashboard");
            } else {
          
                this.showAlert = true;
                this.alert = { type: 'error', message: 'Login failed. Please check your credentials.' };
                this.signInForm.enable();
            }
        },
        error: (error) => {
            console.error("Login error:", error);
            this.showAlert = true;
            this.alert = { type: 'error', message: 'An error occurred during login. Please try again.' };
            this.signInForm.enable(); 
        },
    });
  }
}
