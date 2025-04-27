import { Component,Inject,ViewEncapsulation} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { NotificationService } from '../../../manage-notification/notification.service';
import { UploadDocumentService } from '../../../upload-document/uploadDoc.service';

@Component({
  selector: 'app-content-manager-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
          TranslocoModule],
  templateUrl: './content-manager-dialog.component.html',
  styleUrl: './content-manager-dialog.component.scss'
})
export class ContentManagerDialogComponent {
  contentMangerListForm:FormGroup;
  contentManagerDropdown: any;
  constructor(private _formBuilder:FormBuilder,private _uploadDocumentService:UploadDocumentService ,private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ContentManagerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any )
{
  console.log("datadata",data)
  this.initiateForm();
this.getFileAccess();

}

  initiateForm() {
    this.contentMangerListForm = this._formBuilder.group({
      contentMangId: [""],
      remarks: [""],
    });
  }

onCancel(): void {
  this.dialogRef.close(false);
}

getFileAccess() {
 const payload= {
	division_id:sessionStorage.getItem("designationRoleId"),
	role_id:4 
}
  this._uploadDocumentService.getCmoradmins(payload,).subscribe({
    next: (response: any) => {
      this.contentManagerDropdown = response.users;
    },
    error: (error) => {},
  });
}


onApprove(): void {
  let payload = {
    fileHash:this.data.fileHash,
    requested_to:this.contentMangerListForm.value.contentMangId
  };
  this._uploadDocumentService.filePrevieAccessReqByUser(payload).subscribe({
    next: (response: any) => {
        this._snackBar.open('Access request sent. Waiting for approval.', "Close", {
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
