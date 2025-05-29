import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { ConfirmationDialogComponent } from 'app/modules/admin/pages/manage-notification/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'app/modules/admin/pages/manage-notification/notification.service';
import { DashbaordService } from 'app/modules/admin/dashbaord/dashboard.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DialogService } from '../../common/dialog.service';
import { WarningDialogDataComponent } from '../warning-dialog-data/warning-dialog-data.component';

@Component({
  selector: 'app-request-access-dialog',
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
           TranslocoModule,MatDatepickerModule],
  templateUrl: './request-access-dialog.component.html',
  styleUrl: './request-access-dialog.component.scss',
     encapsulation: ViewEncapsulation.None
})
export class RequestDialogComponent {
  approvalReqlForm:FormGroup;
  payloadAppDenied: {  is_approved: boolean; comments: any;start_date:string; end_date:string};

  constructor(     public dialog: MatDialog,private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any , private _formBuilder:FormBuilder,private dialogService:DialogService,
  private dashbaordService:DashbaordService
)
{

}


onCancel(): void {
  this.dialogRef.close(false);
}

ngOnInit(): void {
  this.initiateForm();
  this.patchTodayDate();
}

initiateForm() {
  this.approvalReqlForm = this._formBuilder.group({
    remarks: [""],
    start_date:[""],
    end_date:[""]
  });
}

patchTodayDate() {
  const today = new Date();
  this.approvalReqlForm.patchValue({ start_date: today });
}


getDateOnly(dateInput: any): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && dateInput.includes('T')) {
    return dateInput.split('T')[0];
  }
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return '';
}

// approveRequestData(status: string): void {
//   const remarksControl = this.approvalReqlForm.get('remarks');
//   const startDateControl = this.approvalReqlForm.get('start_date');
//   const endDateControl = this.approvalReqlForm.get('end_date');
//   remarksControl?.clearValidators();
//   startDateControl?.clearValidators();
//   endDateControl?.clearValidators();

//   if (status === "true") {
//     startDateControl?.setValidators([Validators.required]);
//   } else if (status === "false") {
//     remarksControl?.setValidators([Validators.required]);
//   }
//    else {
//     remarksControl?.clearValidators();
//     startDateControl?.clearValidators();
//     endDateControl?.clearValidators();
//   }
//   remarksControl?.updateValueAndValidity();
//   startDateControl?.updateValueAndValidity();
//   endDateControl?.updateValueAndValidity();
//   if (status === "true") {
//     if (startDateControl?.value && !endDateControl?.value) {
//       this.dialogService.warningInfoDialog(
//         'Success',
//         'Access is Open-ended. Do you confirm without end date?'
//       );
//     }
//     return;
//   } 
//    else if (status === "false" && this.approvalReqlForm.invalid) {
//     this._snackBar.open("Is it mandatory to provide remarks, Deny a request?", "Close", {
//       duration: 3000,
//       horizontalPosition: "right",
//       verticalPosition: "top",
//       panelClass: ["error-snackbar"],
//     });
//     return;
//   } 
  
//   else 
//   this.payloadAppDenied = {
//     is_approved: status === "true",
//     comments: remarksControl?.value || '',
//     start_date: this.getDateOnly(startDateControl?.value) || null,
//     end_date: this.getDateOnly(endDateControl?.value) || null,
//   };

//   this.dashbaordService.fileAccessByRequestid(this.data.id, this.payloadAppDenied).subscribe({
//     next: (response: any) => {
//       this._snackBar.open("Request Approved successfully", "Close", {
//         duration: 3000,
//         horizontalPosition: "right",
//         verticalPosition: "top",
//         panelClass: ["success-snackbar"],
//       });
//       this.dialogRef.close(true);
//     },
//     error: (error) => {
//       this._snackBar.open(error.message || "Error creating user", "Close", {
//         duration: 3000,
//         horizontalPosition: "right",
//         verticalPosition: "top",
//         panelClass: ["error-snackbar"],
//       });
//     },
//   });
// }

approveRequestData(status: string): void {
  const remarksControl = this.approvalReqlForm.get('remarks');
  const startDateControl = this.approvalReqlForm.get('start_date');
  const endDateControl = this.approvalReqlForm.get('end_date');
  remarksControl?.clearValidators();
  startDateControl?.clearValidators();
  endDateControl?.clearValidators();
  if (status === "true") startDateControl?.setValidators([Validators.required]);
  else if (status === "false") remarksControl?.setValidators([Validators.required]);
  remarksControl?.updateValueAndValidity();
  startDateControl?.updateValueAndValidity();
  endDateControl?.updateValueAndValidity();
  if (status === "true" && startDateControl?.value && !endDateControl?.value) {
     const dialogRef = this.dialog.open(WarningDialogDataComponent, {
      width: "677px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.submitRequest(status, remarksControl, startDateControl, endDateControl);
      this.dialogRef.close(true);
    });
    return;
  }
  if (status === "false" && this.approvalReqlForm.invalid) {
    this._snackBar.open("Remarks are mandatory to deny a request.", "Close", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
    });
    return;
  }
  this.submitRequest(status, remarksControl, startDateControl, endDateControl);
}

private submitRequest(status: string, remarksControl: any, startDateControl: any, endDateControl: any): void {
  this.payloadAppDenied = {
    is_approved: status === "true",
    comments: remarksControl?.value || '',
    start_date: this.getDateOnly(startDateControl?.value) || null,
    end_date: this.getDateOnly(endDateControl?.value) || null,
  };
  this.dashbaordService.fileAccessByRequestid(this.data.id, this.payloadAppDenied).subscribe({
    next: () => this._snackBar.open("Request Process successfully", "Close", {
      duration: 3000, horizontalPosition: "right", verticalPosition: "top", panelClass: ["success-snackbar"],
    }),
    error: (error) => this._snackBar.open(error.message || "Error", "Close", { duration: 3000 }),
  });
   this.dialogRef.close(true);
}

}
