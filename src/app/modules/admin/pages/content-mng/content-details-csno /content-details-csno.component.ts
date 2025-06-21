import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ContentMngService } from '../contentMng.service';
import { Item, Items } from '../interface/content.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImagePreviewFolderDailogComponent } from '../../folder-tree/pages/image-preview-folder-dailog/image-preview-folder-dailog.component';
import { MoveFileDialogComponent } from '../pages/move-file-dialog/move-file-dialog.component';

@Component({
  selector: 'app-content-details-caseno',
  standalone: true,
 imports: [
    NgIf,
    RouterLink,
    MatSelectModule,
    MatDatepickerModule,
    TranslocoModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    MatRippleModule,
    CurrencyPipe,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
     MatTooltipModule
  ],
  templateUrl: './content-details-csno.component.html',
  styleUrl: './content-details-csno.component.scss'
})
export class ContentDetailsCaseComponent implements OnInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;
 selectedItem: Item;
    items: Items;
  finalYear: "year";
  year: string;
  caseNo: string;
folderNameDropdown: string[] = [];
finalFileId: any;
  finalDestination: any;
  finalSelectedCaseNo: string;
  finalFileTypeId: any;
  finalcaseType: any;
  finalCaseNo: any;
  finalDocumentTypeId: any;
  constructor(
     
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private contentMngService: ContentMngService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
            private _snackBar: MatSnackBar
    )
    {
  this.route.queryParamMap.subscribe(params => {
      this.year = params.get('name');
       this.caseNo = params.get('caseNo');
      console.log('Name:', this.year);
       console.log('caseNo:', this.caseNo);
    });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
     
    this.getFolder();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
       
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

     getFolder() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    let payload={
      division_id:divisionID,
      year: this.year,
      caseNo:this.caseNo
    }
    this.contentMngService.getFolderData(payload).subscribe({
      next: (response: any) => {
       this.items = response;
       console.log("this.items",this.items)
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

 goToCaseTypeIdDetails(data: any) {
     this._router.navigate(['/content-management/folders/caseNo/caseTypeid'], {
      queryParams: { name: this.year ,caseNo:this.caseNo,caseTypeId:data.id}
    });
  }

  // getFileExtension(filename: string): string {
  //       const ext = filename.split(".").pop()?.toLowerCase();
  //       return ext || "";
  //     }
    
  //     getFileIcon(extension: string): string {
  //       const iconMap: { [key: string]: string } = {
  //         jpg: "image",
  //         jpeg: "image",
  //         png: "image",
  //         pdf: "picture_as_pdf",
  //         doc: "description",
  //         docx: "description",
  //         xls: "table_chart",
  //         xlsx: "table_chart",
  //         txt: "text_snippet",

  //       };
  //       return iconMap[extension] || "insert_drive_file"; 
  //     }
    
    getFileIcon(extension: string): string {
  const iconMap: { [key: string]: string } = {
    jpg: "assets/format_img/png.png",
    jpeg: "assets/format_img/png.png",
    png: "assets/format_img/png.png",
    pdf: "assets/format_img/pdf.gif",
    doc: "assets/format_img/word.png",
    docx: "assets/format_img/ppt.png",
    xls: "assets/format_img/xlxs.png",
    xlsx: "assets/format_img/xlxs.png",
    pptx: "assets/format_img/pptx.png",
    ppt: "assets/format_img/pptx.png",
    // Add more as needed
  };
  return iconMap[extension] || "assets/icons/file.png"; // Default icon
}

getFileExtension(filename: string): string {
  return filename?.split('.').pop()?.toLowerCase() || '';
}

      viewImage(data) {
        const dialogRef = this.dialog.open(ImagePreviewFolderDailogComponent, {
          data: data,
          width: "850px",
          maxWidth: "100vw",
          height: "90vh",
          panelClass: "custom-dialog-class",
        });
    
        dialogRef.afterClosed().subscribe(() => {
          this._changeDetectorRef.detectChanges();
        });
        return;
      }
    
   openMoveDialog(file: any) {
  const selectedFiles = [file];

  const dialogRef = this.dialog.open(MoveFileDialogComponent, {
    width: "550px",
    height: "450px",
    data: { selectedFiles },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      const {
        files,
        destination,
        year,
        caseNo,
        caseType,
        fileTypeId,
        documentTypeId,
        type,
      } = result;

      const selectedFileId = files?.[0]?.file_id;
      if (!selectedFileId) {
        console.error("No file ID selected from dialog result");
        return;
      }

      this.finalFileId = selectedFileId;
      this.finalYear = year ?? null;
      this.finalCaseNo = caseNo ?? null;
      this.finalcaseType = caseType ?? null;
      this.finalFileTypeId = fileTypeId ?? null;
      this.finalDocumentTypeId = documentTypeId ?? null;

      // Optional: Store the raw folders if you still need them
      this.finalDestination = Array.isArray(destination)
        ? destination.flatMap((d) => d.folders || [])
        : [];

      if (type === "move") {
        this.finallMoveFiles();
      } else if (type === "archive") {
        this.selectedFilesArchive();
      } else {
        console.warn("Unknown operation type:", type);
      }
    }
  });
}

finallMoveFiles() {
  const departmentID = Number(sessionStorage.getItem("departmentID"));
  if (!departmentID) {
    console.error("Department ID missing from session storage");
    return;
  }

  if (!this.finalFileId) {
    console.error("File ID is missing. Cannot move file.");
    return;
  }

  const payload: Record<string, any> = {
    deptId: departmentID,
    file_id: this.finalFileId,
  };

  if (this.finalYear) payload.year = this.finalYear;
  if (this.finalCaseNo) payload.caseNo = this.finalCaseNo;
  if (this.finalcaseType) payload.caseType = this.finalcaseType;
  if (this.finalFileTypeId) payload.file_type_id = this.finalFileTypeId;
  if (this.finalDocumentTypeId) payload.document_type_id = this.finalDocumentTypeId;

  console.log("Final move payload:", payload);

  this.contentMngService.moveFilesInfo(payload).subscribe({
    next: (response: any) => {
      this.items = response;
      this._snackBar.open("File moved successfully", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["green-snackbar"],
      });
      this.getFolder();
    },
    error: (error) => {
      console.error("Error moving file:", error);
      this._snackBar.open("Failed to move file. Please try again.", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    },
  });
}

  selectedFilesArchive() {
    const payload = {
      file_id: this.finalFileId,
    };

    this.contentMngService.archiveFiles(payload).subscribe({
      next: (res: Items) => {
        this._snackBar.open("File Archive successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.getFolder();
      },
      error: (err) => {
        console.error("Error archiving file:", err);
        this._snackBar.open("Failed to File Archive", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }
}