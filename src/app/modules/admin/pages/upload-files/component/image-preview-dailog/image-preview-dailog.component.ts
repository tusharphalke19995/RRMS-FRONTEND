import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
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
export class ImagePreviewDailogComponent implements OnDestroy {
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
    if (!res) {
      console.error("No file data received");
      return;
    }

    let fileBlob: Blob;
    let fileType: string;
    let fileUrl: string;

    // Check if res is already a File or Blob object
    if (res instanceof File || res instanceof Blob) {
      fileBlob = res;
      fileType = res.type;
    } 
    // Check if res has base64_content (from API response)
    else if (res.base64_content || res.file?.base64_content) {
      const base64 = res.base64_content || res.file?.base64_content;
      fileType = res.mime_type || res.type || res.file?.mime_type || res.file?.type || '';
      
      // Convert base64 to Blob
      fileBlob = this.base64ToBlob(base64, fileType);
    }
    // Check if res.file exists and is a File/Blob
    else if (res.file && (res.file instanceof File || res.file instanceof Blob)) {
      fileBlob = res.file;
      fileType = res.file.type || res.mime_type || res.type || '';
    }
    // If none of the above, try to use res directly (might be a File object)
    else {
      console.error("Invalid file data format:", res);
      return;
    }

    if (!fileBlob) {
      console.error("Could not create blob from data");
      return;
    }

    // Create object URL from Blob
    fileUrl = URL.createObjectURL(fileBlob);
    this.fileInfo.push(fileUrl);

    const lowerFileType = (fileType || '').toLowerCase();
    const officeMimeTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    // Office files: direct download only (no preview)
    if (officeMimeTypes.includes(lowerFileType)) {
      const fileName =
        res?.file_name ||
        res?.fileName ||
        res?.file?.file_name ||
        res?.file?.fileName ||
        (res instanceof File ? res.name : "document");

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      this.dialogRef.close();
      return;
    }

    // Route based on file type
    if (lowerFileType.startsWith("image/")) {
      this.imageFiles.push(fileUrl);
    } else if (lowerFileType === "application/pdf") {
      this.base64pdf = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      this.pdfFiles.push(fileUrl);
    } else if (lowerFileType.startsWith("audio/")) {
      this.audioFiles.push(fileUrl);
    } else if (lowerFileType.startsWith("video/")) {
      this.videoFiles.push(fileUrl);
    } else {
      console.warn("Unsupported file type:", fileType);
    }
  }

  /**
   * Convert base64 string to Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
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

      return new Blob(byteArrays, { type: mimeType });
    } catch (error) {
      console.error("Error converting base64 to Blob:", error);
      throw error;
    }
  }

  isImage(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("image/");
  }

  isPdf(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("pdf");
  }

  ngOnDestroy() {
    // Revoke all object URLs to prevent memory leaks
    this.fileInfo.forEach((fileUrl) => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    });
    
    // Also revoke URLs from arrays
    [...this.imageFiles, ...this.audioFiles, ...this.videoFiles, ...this.pdfFiles].forEach((fileUrl) => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
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