import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { CommonModule, NgFor, NgForOf, NgIf } from "@angular/common";
import {
  FormArray,
  FormControl,
  FormGroup,
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
import { FuseAlertComponent } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { interval, Observable, Subscription } from "rxjs";
import { FuseAlertType } from "@fuse/components/alert";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-otp-verify",
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
    NgFor,
    NgForOf,
  ],
  templateUrl: "./otp-verify.component.html",
  styleUrl: "./otp-verify.component.scss",
})
export class OtpVerifyComponent implements OnInit {
  @ViewChildren("otpInput") otpInputs!: QueryList<ElementRef>;
  otpForm = new FormGroup({
    otp: new FormArray(
      Array.from(
        { length: 6 },
        () =>
          new FormControl("", [
            Validators.required,
            Validators.pattern("[0-9]"),
          ])
      )
    ),
  });
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  get otpControls() {
    return (this.otpForm.get("otp") as FormArray).controls;
  }
  showAlert: boolean = false;
  divisionsRoles: any;
  authData: any;
  countdown: number = 600;
  countdownSubscription!: Subscription;
  kgid:any;
  /**
   * Constructor
   */
  constructor(
      private cdRef: ChangeDetectorRef,
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
    this.startCountdown();
  }

startCountdown(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.cdRef.detectChanges(); // Manually trigger change detection
      }
    });
  }

 timer(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  isTimerExpired(): boolean {
    return this.countdown <= 0;
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow only digits (0–9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const next = this.otpInputs.toArray()[index + 1];
    if (input.value && next) {
      next.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === "Backspace" && !input.value && index > 0) {
      const prev = this.otpInputs.toArray()[index - 1];
      prev.nativeElement.focus();
    }
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      const otp = this.otpForm.value.otp.join("");
      console.log("Entered OTP:", otp);
      this.otpForm.disable();
      this.showAlert = false;
      let payload = {
        otp: otp,
        kgid:  this.kgid,
      };
      this._authService.verifyOtp(payload).subscribe({
        next: (response: any) => {
          console.log("response", response);
          this._snackBar.open("OTP Verify Successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
           this.otpForm.enable();
            this.otpForm.reset();
           this._router.navigateByUrl('reset-password');
        },
        error: (error) => {
          this.showAlert = true;
          this.alert = {
            type: "error",
            message: error.error.error,
          };
          this.otpForm.enable();
        },
      });
    }
  }
}
