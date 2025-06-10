import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'app/modules/admin/pages/manage-notification/notification.service';

@Component({
  selector: 'app-user-data-show',
  standalone: true,
  imports: [ NgIf,
       CommonModule,
           ReactiveFormsModule,
           MatDialogModule,
           MatIconModule,
           FormsModule,
           MatFormFieldModule,
           MatInputModule,
           MatSelectModule,
           MatButtonModule,
           TranslocoModule,],
  templateUrl: './user-data-show.component.html',
  styleUrl: './user-data-show.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class UserDataShowComponent {

  manageNotificationConfirmation:FormGroup;
  paloadApproveDenied:any;
  payloadAppDenied: { file_id: any; division_id: number; is_approved: boolean; comments: any; };
  constructor( private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<UserDataShowComponent>, @Inject(MAT_DIALOG_DATA) public data: any , private _formBuilder:FormBuilder, private _notify:NotificationService)
{
 console.log("datass",data)
}


onCancel(): void {
  this.dialogRef.close(false);
}

ngOnInit(): void {

}

onSumbit() {
    this._notify.sendPwdResetData(this.data.pwdResetRequestId).subscribe({
      next: (response: any[]) => {
         this._snackBar.open('Password Reset Link Sent Successfully', "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });
      this.dialogRef.close(true);

      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

}
