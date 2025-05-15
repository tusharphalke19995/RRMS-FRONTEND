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
import { DomSanitizer } from '@angular/platform-browser';
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

fileInfo: string[] = [];
  imageFiles: string[] = [];
  pdfFiles: string[] = [];
  caseMetaData: any;
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
          if (fileType.startsWith("image")) {
            this.imageFiles.push(fileUrl);
          } else if (fileType === "application/pdf") {
            this.pdfFiles.push(fileUrl);
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
