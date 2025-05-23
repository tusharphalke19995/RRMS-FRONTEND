import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedService } from 'app/shared/shared.service';
import { SearchDocService } from '../../../search-document/searchDoc.service';
import { UploadedFilesComponent } from '../../../search-document/uploaded-files/uploaded-files.component';

@Component({
  selector: 'app-image-preview-dailog',
  standalone: true,
  imports: [CommonModule,
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
  templateUrl: './image-preview-dailog.component.html',
  styleUrl: './image-preview-dailog.component.scss',
   encapsulation: ViewEncapsulation.None,
})
export class ImagePreviewDailogComponent {
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
  constructor(
    private sanitizer: DomSanitizer,
        private dataService: SharedService,
    private _searchDocService: SearchDocService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewDailogComponent>
  ) {
    console.log("dadsfvta",data)
  
   this.getUploadMetaDataFiles(data)
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  getUploadMetaDataFiles(res): void {
 if (res) {
          const fileUrl = URL.createObjectURL(res);
          const fileType = res.type;
           if (fileType.startsWith("image/")) {
            this.imageFiles.push(fileUrl);
          } else if (fileType === "application/pdf") {
            this.base64pdf = fileUrl;
            this.pdfFiles.push(fileUrl);
          } else if (fileType.startsWith("audio/")) {
            this.audioFiles.push(fileUrl);
          } else if (fileType.startsWith("video/")) {
            this.videoFiles.push(fileUrl);
          } else if (
            fileType === "application/msword" ||
            fileType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            const googleDocsViewerUrl = `https://rrms-backend.onrender.com/viewer?url=${encodeURIComponent(
              fileUrl
            )}&embedded=true`;

            this.wordViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsViewerUrl);
                        console.log("Word document URL:", googleDocsViewerUrl);
            this.wordFiles.push(googleDocsViewerUrl);
          }
          // Handle Excel files (.xls, .xlsx)
          else if (
            fileType === "application/vnd.ms-excel" ||
            fileType ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ) {
            const googleDocsViewerUrl = `https://rrms-backend.onrender.com/viewer?url=${encodeURIComponent(
              fileUrl
            )}&embedded=true`;

     
              this.excelViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsViewerUrl);
            console.log("Excel document URL:", googleDocsViewerUrl);

            this.excelFiles.push(googleDocsViewerUrl);
          } else {
            console.warn("Unsupported file type:", fileType);
          }
        } else {
          console.error("No file data received");
        }
  }

  isImage(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("image/");
  }

  isPdf(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("pdf");
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

  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  
}
