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
import { ImagePreviewFolderDailogComponent } from "../image-preview-folder-dailog/image-preview-folder-dailog.component";

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
  items: Items;
  finalYear: "year";
  year: string;
  caseNo: string;
  caseTypeId: string;
  fileTypeId: string;
  documentTypeId: string;
  selectAll: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private contentMngService: ContentMngService,
    private route: ActivatedRoute,
    private _searchDocService: SearchDocService,
    private dialog: MatDialog
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

  getFileExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext || "";
  }

  getFileIcon(extension: string): string {
    const iconMap: { [key: string]: string } = {
      jpg: "image",
      jpeg: "image",
      png: "image",
      pdf: "picture_as_pdf",
      doc: "description",
      docx: "description",
      xls: "table_chart",
      xlsx: "table_chart",
      txt: "text_snippet",
      // Add more mappings as needed
    };
    return iconMap[extension] || "insert_drive_file"; // Default icon
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

  base64ToBlob(base64: string, mime: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }
}
