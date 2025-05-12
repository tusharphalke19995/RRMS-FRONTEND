import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../manage-notification/notification.service';

@Component({
  selector: 'app-confirmation-caseData-dialog',
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
  templateUrl: './confirmation-caseData-dialog.component.html',
  styleUrl: './confirmation-caseData-dialog.component.scss',
      encapsulation: ViewEncapsulation.None
})
export class ConfirmationDialogCaseDataApprovalComponent {
  manageNotificationConfirmation:FormGroup;
  paloadApproveDenied:any;
  payloadAppDenied: { upload_approval_id: any; division_id: number; is_approved: boolean; comments: any; };
  constructor( private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ConfirmationDialogCaseDataApprovalComponent>, @Inject(MAT_DIALOG_DATA) public data: any , private _formBuilder:FormBuilder)
{

}


onCancel(): void {
  this.dialogRef.close(false);
}

ngOnInit(): void {
  this.initiateForm();
}

initiateForm() {
  this.manageNotificationConfirmation = this._formBuilder.group({
    remarks: [""],
  });
}

onApprove(status: string): void {
  console.log("status",status)
  const remarksControl = this.manageNotificationConfirmation.get('remarks');
  remarksControl?.clearValidators();
  remarksControl?.updateValueAndValidity();

  const divisionID = Number(sessionStorage.getItem('divisionID') || 'null');

  if(status==="true"){
    this.payloadAppDenied =  {
      upload_approval_id: this.data.id,
      division_id: divisionID,
      is_approved:true,
      comments: remarksControl?.value || ''
    };
  }else if(status==="false"){
     this.payloadAppDenied = {
      upload_approval_id: this.data.id,
      division_id: divisionID,
      is_approved:false,
      comments: remarksControl?.value || ''
    };
  }
  this.notificationService.approveNotification(this.payloadAppDenied).subscribe({
    next: (response: any) => {
      const message = status === 'true' ? "Request Approved successfully" : "Request Denied successfully";
      this._snackBar.open(message, "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });
      this.dialogRef.close(true);
      // this.markAsRead();
    },
    error: (error) => {
      this._snackBar.open(error.message || "Error processing request", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    },
  });
}

markAsRead() {
  let paloadData={
   notification_id:this.data.id
  }
   this.notificationService.markasreadNotificationInfo(paloadData).subscribe({
       next: (response: any) => {
  
       },
       error: (error) => {
           console.error("Error fetching latest files:", error);
       },
   });
 }
   
}
