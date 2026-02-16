import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { CommonModule, NgIf } from "@angular/common";
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificationService } from "app/modules/admin/pages/manage-notification/notification.service";
import { initial } from "lodash";
import { SearchUserService } from "app/modules/admin/pages/manage-user/search-userlist/searchUser.service";

@Component({
  selector: "app-user-data-show",
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslocoModule,
  ],
  templateUrl: "./user-data-show.component.html",
  styleUrl: "./user-data-show.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class UserDataShowComponent {
  passwordFieldType = "password";
  manageNotificationConfirmation: FormGroup;
  paloadApproveDenied: any;
  showPasswordField = false;
  payloadAppDenied: {
    file_id: any;
    division_id: number;
    is_approved: boolean;
    comments: any;
  };
  userDataShow: any;
  constructor(
    private SearchUserService: SearchUserService,
    private _snackBar: MatSnackBar,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<UserDataShowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _notify: NotificationService
  ) {
    console.log("datass", data);
    if (this.data) {
      this.getUsersDataById(data.passwordResetRequestId);
    }
  }

  initialForm() {
    this.manageNotificationConfirmation = this._formBuilder.group({
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnInit(): void {
    this.initialForm();
  }

  resetData() {
    this.showPasswordField = true;
    this.onSubmit();
  }

  rejectData() {
    this.onClickReject();
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }

  onSubmit() {
    if (this.manageNotificationConfirmation.valid) {
      if (this.showPasswordField) {
        let payload = {
          password: this.manageNotificationConfirmation.value.password,
        };
        this.SearchUserService.userSetPasswordInfo(
          this.data.kgid,
          payload
        ).subscribe({
          next: () => {
            this._snackBar.open(
              "Default Password set for the user successfully",
              "Close",
              {
                duration: 3000,
                horizontalPosition: "right",
                verticalPosition: "top",
                panelClass: ["green-snackbar"],
              }
            );
            this.afterSubmitdata();
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error("Error resetting password:", error);
          },
        });
      } else {
        // Handle other form data submission
      }
    }
  }

  onClickReject() {
    let payload = {
      pwdId: this.data.passwordResetRequestId,
      status: "rejected",
    };
    this.SearchUserService.setStatusPasswordReset(payload).subscribe({
      next: () => {
        this._snackBar.open(
          "Request has been rejected.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
          }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error("Error resetting password:", error);
      },
    });
  }

  getUsersDataById(id) {
    this._notify.getUsersData(id).subscribe({
      next: (response: any[]) => {
        console.log("Res show", response);
        this.userDataShow = response;
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  afterSubmitdata(){
       let payload = {
      pwdId: this.data.passwordResetRequestId,
      status: "approved",
    };
    this.SearchUserService.setStatusPasswordReset(payload).subscribe({
      next: () => {
  
      },
      error: (error) => {
        console.error("Error resetting password:", error);
      },
    });
  }
}
