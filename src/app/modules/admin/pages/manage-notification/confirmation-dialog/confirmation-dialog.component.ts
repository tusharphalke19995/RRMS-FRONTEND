import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { NotificationService } from '../notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirmation-dialog',
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
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
      encapsulation: ViewEncapsulation.None
})
export class ConfirmationDialogComponent {


  constructor( private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any )
{
console.log("data",this.data)
}


onCancel(): void {
  this.dialogRef.close(false);
}


onApprove(){
  this.notificationService.approveNotification(this.data.file.fileId).subscribe({
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
