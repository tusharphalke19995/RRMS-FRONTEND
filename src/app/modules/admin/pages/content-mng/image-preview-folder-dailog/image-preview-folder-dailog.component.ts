import {
  Component,
  NO_ERRORS_SCHEMA,
  Inject,
  ViewEncapsulation,
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
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SharedService } from "app/shared/shared.service";

@Component({
  selector: "app-image-preview-folder-dailog",
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
  templateUrl: "./image-preview-folder-dailog.component.html",
  styleUrl: "./image-preview-folder-dailog.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ImagePreviewFolderDailogComponent {
  pdfFiles: string[] = [];
  audioFiles: string[] = [];
  videoFiles: string[] = [];
  fileInfo: string[] = [];
  imageFiles: string[] = [];
  caseMetaData: any;
  base64pdf: SafeResourceUrl | null = null;
  pdfTitle: string = "PDF Preview";
  wordFiles: string[] = [];
  excelFiles: string[] = [];
  excelViewerUrl: SafeResourceUrl;
  wordHtml: string;
  wordViewerUrl: SafeResourceUrl;
  public safeUrl: SafeResourceUrl;
  finalUrl: any;

  viewableTypes = [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "mp3",
    "wav",
    "ogg",
    "mp4",
    "webm",
    "ogg",
  ];

  downloadTypes = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

  constructor(
    private sanitizer: DomSanitizer,
    private dataService: SharedService,

    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewFolderDailogComponent>
  ) {
    const file = this.data;
    const extension = file.name.split(".").pop().toLowerCase();

    // Use sanitized path
    const formattedUrl = file.path.replace(/%20/g, "_");
    this.finalUrl = decodeURIComponent(formattedUrl);

    if (this.viewableTypes.includes(extension)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.finalUrl
      );
    } else if (this.downloadTypes.includes(extension)) {
      this.downloadFile(this.finalUrl);
      this.dialogRef.close(); // optionally auto-close modal
    } else {
      console.warn("Unsupported file type:", extension);
    }
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  ngOnDestroy() {
    this.fileInfo.forEach((fileUrl) => {
      URL.revokeObjectURL(fileUrl);
    });
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  downloadFile(url: string) {
   window.open(url, '_blank');
  }

  getExtension(filename: string): string {
    return filename?.split(".").pop()?.toLowerCase() || "";
  }
}
