import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { ContentMngService } from "../contentMng.service";
import { Item, Items } from "../interface/content.model";
import { FileIconPipe } from "../pipe/fileIcon";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { MatDialog } from "@angular/material/dialog";
import { ImagePreviewDailogComponent } from "../../upload-files/component/image-preview-dailog/image-preview-dailog.component";
import { ImagePreviewFolderDailogComponent } from "../pages/image-preview-folder-dailog/image-preview-folder-dailog.component";
import { MoveFileDialogComponent } from "../pages/move-file-dialog/move-file-dialog.component";
  import { forkJoin } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
@Component({
  selector: "app-content-details-documenttypeid",
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
    MatTooltipModule,
    FileIconPipe,
  ],
  templateUrl: "./content-details-documenttypeid.component.html",
  styleUrl: "./content-details-documenttypeid.component.scss",
})
export class ContentCaseDocumentTypeIdDetailsComponent implements OnInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;
  selectedItem: Item;
  items: any[] = [];
  finalYear: "year";
  year: string;
  caseNo: string;
  caseTypeId: string;
  fileTypeId: string;
  documentTypeId: string;
  selectAll = false;
folderNameDropdown: string[] = [];
  finalFileId: any;
  finalDestination: any;
  finalSelectedCaseNo: string;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private contentMngService: ContentMngService,
    private route: ActivatedRoute,
    private _searchDocService: SearchDocService,
    private dialog: MatDialog,
     private _snackBar: MatSnackBar
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.year = params.get("name");
      this.caseNo = params.get("caseNo");
      this.caseTypeId = params.get("caseTypeId");
      this.fileTypeId = params.get("filetypeid");
      this.documentTypeId = params.get("documentTypeId");
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getFolder();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * On backdrop clicked
   */
  onBackdropClicked(): void {}

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFolder() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    let payload = {
      division_id: divisionID,
      year: this.year,
      caseType: this.caseTypeId,
      caseNo: this.caseNo,
      fileTypeId: this.fileTypeId,
      documentTypeId: this.documentTypeId,
    };
    this.contentMngService.getFolderData(payload).subscribe({
      next: (response: any) => {
        this.items = response;
        console.log("this.items", this.items);
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  //  goToCaseDetails(data: any) {
  //      this._router.navigate(['/content-management/folders/caseNo'], {
  //       queryParams: { name: this.year ,caseNo:data.name}
  //     });
  //   }

  // getFileExtension(filename: string): string {
  //   const ext = filename.split(".").pop()?.toLowerCase();
  //   return ext || "";
  // }

  // getFileIcon(extension: string): string {
  //   const iconMap: { [key: string]: string } = {
  //     jpg: "image",
  //     jpeg: "image",
  //     png: "image",
  //     pdf: "picture_as_pdf",
  //     doc: "description",
  //     docx: "description",
  //     xls: "table_chart",
  //     xlsx: "table_chart",
  //     txt: "text_snippet",
      
  //   };
  //   return iconMap[extension] || "insert_drive_file"; // Default icon
  // }

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
      height:"450px",
      data: { selectedFiles
       },
    });

    dialogRef.afterClosed().subscribe((result) => {
       if (result) {
      const { files, destination,caseNo } = result;
      if (!destination || destination.length === 0) {
        console.warn("No destination selected");
        return;
      }
      console.log("wcaseNo",caseNo)
      this.finalSelectedCaseNo=caseNo;
      const selectedFileId = files[0]?.file_id;
      this.finalFileId = selectedFileId;
       const folderList = Array.isArray(destination)
      ? destination.flatMap(d => d.folders || [])
      : [];
      this.finalDestination = folderList;
      console.log("  this.finalDestination",  this.finalDestination)

      this.finallMoveFiles();
    }
    });
  }

 finallMoveFiles() {
  const departmentID = Number(sessionStorage.getItem("departmentID"));

  if (!this.finalDestination || !this.finalFileId) {
    console.error("Missing required data for file move.");
    return;
  }
  const folderMap = this.finalDestination.reduce((acc, folder) => {
    console.log("folder",folder)
    switch (folder.level) {
      case 'caseNo':
        acc.caseNo = folder.name;
        break;
      case 'caseType':
        acc.caseType = folder.id;
        break;
      case 'filetype':
        acc.file_type_id = folder.id;
        break;
      case 'documenttype':
        acc.document_type_id = folder.id;
        break;
    }
    return acc;
  }, {} as any);
  const payload = {
    deptId: departmentID,
    file_id: this.finalFileId,
    caseNo: this.finalSelectedCaseNo,
    ...folderMap,
  };

  console.log("Final move payload:", payload);

  this.contentMngService.moveFilesInfo(payload).subscribe({
    next: (response: any) => {
      this.items = response;
       this._snackBar.open('File moved successfully', "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });
    this.getFolder()
    },
    error: (error) => {
      console.error("Error moving file:", error);
    },
  });
}


}
