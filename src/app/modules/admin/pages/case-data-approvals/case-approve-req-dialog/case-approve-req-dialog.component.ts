import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { ConfirmationDialogComponent } from 'app/modules/admin/pages/manage-notification/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'app/modules/admin/pages/manage-notification/notification.service';
import { DashbaordService } from 'app/modules/admin/dashbaord/dashboard.service';

@Component({
  selector: 'app-case-approve-req-dialog',
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
  templateUrl: './case-approve-req-dialog.component.html',
  styleUrl: './case-approve-req-dialog.component.scss',
     encapsulation: ViewEncapsulation.None
})
export class CaseApproveReqDialogComponent {
  approvalReqlForm:FormGroup;
  payloadAppDenied: {  is_approved: boolean; comments: any; };

  constructor( private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any , private _formBuilder:FormBuilder,
  private dashbaordService:DashbaordService
)
{

}


onCancel(): void {
  this.dialogRef.close(false);
}

ngOnInit(): void {
  this.initiateForm();
}

initiateForm() {
  this.approvalReqlForm = this._formBuilder.group({
    remarks: [""],
  });
}



approveRequestData(status: string): void {
  const remarksControl = this.approvalReqlForm.get('remarks');
  remarksControl?.clearValidators();
  remarksControl?.updateValueAndValidity();
if(status==="true"){
  this.payloadAppDenied =  {
    is_approved:true,
    comments: remarksControl?.value || ''
  };
}else {
   this.payloadAppDenied = {
    is_approved:false,
    comments: remarksControl?.value || ''
  };
}

  this.dashbaordService.fileAccessByRequestid(this.data.id,this.payloadAppDenied).subscribe({
    next: (response: any) => {
      this._snackBar.open("Request Approved successfully", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });   
      this.dialogRef.close(true);
    },
    error: (error) => {
      this._snackBar.open(error.message || "Error creating user", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    },
  });
}
}
