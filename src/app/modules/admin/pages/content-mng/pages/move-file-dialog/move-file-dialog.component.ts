import {
  Component,
  ViewEncapsulation,
  Inject,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { CommonModule, NgFor } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
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
import { ContentMngService } from "../../contentMng.service";
import { Items } from "../../interface/content.model";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-move-file-dialog",
  standalone: true,
  imports: [
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
    NgFor,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: "./move-file-dialog.component.html",
  styleUrl: "./move-file-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class MoveFileDialogComponent {
  items: Items;
  year: any;
  caseTypeId: any;
  caseNo: any;
  fileTypeId: any;
  navigationStack: Items[] = [];
  constructor(
     private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MoveFileDialogComponent>,
    private contentMngService: ContentMngService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedFiles: any[] }
  ) {
  
    this.getFolder(); // Load root level
  }

 confirmMove() {
  const payload: any = {
    files: this.data.selectedFiles,
    destination: this.navigationStack.concat(this.items),
    type: 'move'
  };
if (this.year) payload.year = this.year;
if (this.caseNo) payload.caseNo = this.caseNo;
if (this.caseTypeId) payload.caseType = this.caseTypeId;
if (this.fileTypeId) payload.fileTypeId = this.fileTypeId;
  
  this.dialogRef.close(payload);
}


  confirmArchived() {
    this.dialogRef.close({
      files: this.data.selectedFiles,
       type:'archive'
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  // getFolder() {
  //   const divisionID = Number(sessionStorage.getItem("divisionID"));
  //   const payload = {
  //     division_id: divisionID,
  //   };

  //   this.contentMngService.getFolderData(payload).subscribe({
  //     next: (res: Items) => (this.items = res),
  //     error: (err) => console.error("Error fetching root folders:", err),
  //   });
  // }

  // getFolderYear(folder: any) {
  //   const divisionID = Number(sessionStorage.getItem("divisionID"));
  //   this.year = folder.name
  //   const payload = {
  //     division_id: divisionID,
  //     year: this.year,
  //   };

  //   this.contentMngService.getFolderData(payload).subscribe({
  //     next: (res: Items) => (this.items = res),
  //     error: (err) => console.error("Error fetching root folders:", err),
  //   });
  // }


  // goToCaseNoDetails(folder: any) {
  //   this.caseNo = folder.name;
  //   const divisionID = Number(sessionStorage.getItem("divisionID"));
  //   const payload = {
  //     division_id: divisionID,
  //     year: this.year,
  //     caseNo: this.caseNo,
  //   };

  //   this.contentMngService.getFolderData(payload).subscribe({
  //     next: (res: Items) => (this.items = res),
  //     error: (err) => console.error("Error fetching caseNo level:", err),
  //   });
  // }

  // goToCaseFileTypIdDetails(folder: any) {
  //   this.caseTypeId = folder.id; 
  //   const divisionID = Number(sessionStorage.getItem("divisionID"));
  //   const payload = {
  //     division_id: divisionID,
  //     year: this.year,
  //     caseNo: this.caseNo,
  //     caseType: this.caseTypeId,
  //   };

  //   this.contentMngService.getFolderData(payload).subscribe({
  //     next: (res: Items) => (this.items = res),
  //     error: (err) => console.error("Error fetching caseTypeId level:", err),
  //   });
  // }


  // goToFileTypeIdDetails(folder: any) {
  //   this.fileTypeId = folder.id;
  //   const divisionID = Number(sessionStorage.getItem("divisionID"));
  //   const payload = {
  //     division_id: divisionID,
  //     year: this.year,
  //     caseType: this.caseTypeId,
  //     caseNo: this.caseNo,
  //     fileTypeId: this.fileTypeId,
  //   };

  //   this.contentMngService.getFolderData(payload).subscribe({
  //     next: (res: Items) => (this.items = res),
  //     error: (err) => console.error("Error fetching fileTypeId level:", err),
  //   });
  // }


  getFolder() {
  const divisionID = Number(sessionStorage.getItem("divisionID"));
  const payload = { division_id: divisionID };

  // Reset all navigation states
  this.year = null;
  this.caseNo = null;
  this.caseTypeId = null;
  this.fileTypeId = null;

  this.contentMngService.getFolderData(payload).subscribe({
    next: (res: Items) => (this.items = res),
    error: (err) => console.error("Error fetching root folders:", err),
  });
}

getFolderYear(folder: any) {
  const divisionID = Number(sessionStorage.getItem("divisionID"));
  this.year = folder.name;
  this.caseNo = null;
  this.caseTypeId = null;
  this.fileTypeId = null;

  const payload = {
    division_id: divisionID,
    year: this.year,
  };

  this.contentMngService.getFolderData(payload).subscribe({
    next: (res: Items) => (this.items = res),
    error: (err) => console.error("Error fetching year level folders:", err),
  });
}

goToCaseNoDetails(folder: any) {
  this.caseNo = folder.name;
  const divisionID = Number(sessionStorage.getItem("divisionID"));
  this.caseTypeId = null;
  this.fileTypeId = null;

  const payload = {
    division_id: divisionID,
    year: this.year,
    caseNo: this.caseNo,
  };

  this.contentMngService.getFolderData(payload).subscribe({
    next: (res: Items) => (this.items = res),
    error: (err) => console.error("Error fetching caseNo level:", err),
  });
}

goToCaseFileTypIdDetails(folder: any) {
  this.caseTypeId = folder.id;
  const divisionID = Number(sessionStorage.getItem("divisionID"));
  this.fileTypeId = null;
  const payload = {
    division_id: divisionID,
    year: this.year,
    caseNo: this.caseNo,
    caseType: this.caseTypeId,
  };

  this.contentMngService.getFolderData(payload).subscribe({
    next: (res: Items) => (this.items = res),
    error: (err) => console.error("Error fetching caseTypeId level:", err),
  });
}

goToFileTypeIdDetails(folder: any) {
  this.fileTypeId = folder.id;
  const divisionID = Number(sessionStorage.getItem("divisionID"));
  const payload = {
    division_id: divisionID,
    year: this.year,
    caseNo: this.caseNo,
    caseType: this.caseTypeId,
    fileTypeId: this.fileTypeId,
  };

  this.contentMngService.getFolderData(payload).subscribe({
    next: (res: Items) => (this.items = res),
    error: (err) => console.error("Error fetching fileTypeId level:", err),
  });
}

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  handleFolderClick(folder: any) {
    if (!this.year) {
      this.getFolderYear(folder);
    }else if (!this.caseNo) {
      this.goToCaseNoDetails(folder);
    } 
     else if (!this.caseTypeId) {
      this.goToCaseFileTypIdDetails(folder);
    } else if (!this.fileTypeId) {
      this.goToFileTypeIdDetails(folder);
    }
  }

  goToNextLevel(res: Items) {
    this.navigationStack.push(this.items);
    this.items = res;
  }

  goBack() {
    if (this.navigationStack.length > 0) {
      this.items = this.navigationStack.pop();
    }
  }

}
