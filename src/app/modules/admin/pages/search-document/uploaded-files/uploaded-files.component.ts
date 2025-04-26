import { Component, Inject, ViewEncapsulation } from "@angular/core";
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
import { SearchDocService } from "../searchDoc.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-uploaded-files",
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
  templateUrl: "./uploaded-files.component.html",
  styleUrl: "./uploaded-files.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class UploadedFilesComponent {
  fileInfo: string[] = [];
  imageFiles: string[] = [];
  pdfFiles: string[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private _searchDocService: SearchDocService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadedFilesComponent>
  ) {
    console.log(this.data);
    this.getUploadMetaDataFiles();
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }
  
  getUploadMetaDataFiles(): void {
      let payload = {
        fileHash: this.data.fileHash,
      };

      this._searchDocService.filePreviewData(payload).subscribe({
        next: (res: Blob | null) => {
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
        },
        error: (error) => {
          console.error("Error fetching file preview:", error);
        },
      });
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
