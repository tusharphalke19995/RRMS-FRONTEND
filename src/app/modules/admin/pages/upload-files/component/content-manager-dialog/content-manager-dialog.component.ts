import { Component,Inject,ViewEncapsulation} from '@angular/core';
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
import { NotificationService } from '../../../manage-notification/notification.service';
import { UploadDocumentService } from '../../../upload-document/uploadDoc.service';
import { SharedService } from 'app/shared/shared.service';

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
  filteredContentManagers: any[] = [];
  private contentManagerSearchTimeout: any;
  caseMetaData: any;
  constructor(private _formBuilder:FormBuilder,private _uploadDocumentService:UploadDocumentService ,private _snackBar: MatSnackBar,private notificationService:NotificationService,public dialogRef: MatDialogRef<ContentManagerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,private dataService:SharedService )
{
  console.log("datadata",data)
  this.initiateForm();
this.getFileAccess();
this.getCasedataSelected();

}

  initiateForm() {
    this.contentMangerListForm = this._formBuilder.group({
      contentMangId: ["",[Validators.required]],
      remarks: ["",[Validators.required]],
    });
  }

onCancel(): void {
  this.dialogRef.close(false);
}

getFileAccess() {
 const payload= {
	division_id:sessionStorage.getItem("divisionID"),
	role_id:4 
}
  this._uploadDocumentService.getCmoradmins(payload,).subscribe({
    next: (response: any) => {
      this.contentManagerDropdown = response.users;
      this.filteredContentManagers = [...this.contentManagerDropdown];
    },
    error: (error) => {},
  });
}

filterContentManagers(event: any): void {
  const searchText = event.target.value.toLowerCase().trim();
  
  if (this.contentManagerSearchTimeout) {
    clearTimeout(this.contentManagerSearchTimeout);
  }

  this.contentManagerSearchTimeout = setTimeout(() => {
    if (!searchText) {
      this.filteredContentManagers = [...this.contentManagerDropdown];
    } else {
      this.filteredContentManagers = this.contentManagerDropdown.filter(manager => {
        const firstName = (manager.first_name || '').toLowerCase();
        return firstName.includes(searchText);
      });
    }
  }, 300);
}

getCasedataSelected() {
  this.dataService.getCaseData().subscribe((caseData) => {
    this.caseMetaData = caseData;
  });
}

onApprove(): void {
  let payload = {
    fileHash:this.data.fileHash,
    requested_to:this.contentMangerListForm.value.contentMangId,
      comments: this.contentMangerListForm.value.remarks,
      division_id: sessionStorage.getItem('divisionID'),
      case_id: this.caseMetaData.CaseInfoDetailsId,
  };
  this._uploadDocumentService.filePrevieAccessReqByUser(payload).subscribe({
    next: (response: any) => {
        this._snackBar.open('Access request sent. Waiting for approval.', "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
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
