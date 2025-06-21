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
  public safeUrl: SafeResourceUrl;
  public fileType: string;
  public finalUrl: string;
  public fileName: string;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewFolderDailogComponent>
  ) {
    const file = this.data;
    this.fileName = file.name;
    const extension = this.getExtension(file.name);
    this.finalUrl = decodeURIComponent(file.path);

    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const audioTypes = ["mp3", "wav", "ogg"];
    const videoTypes = ["mp4", "webm"];
    const pdfTypes = ["pdf"];
    const downloadTypes = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

    if (imageTypes.includes(extension)) {
      this.fileType = "image";
    } else if (audioTypes.includes(extension)) {
      this.fileType = "audio";
    } else if (videoTypes.includes(extension)) {
      this.fileType = "video";
    } else if (pdfTypes.includes(extension)) {
      this.fileType = "pdf";
    } else if (downloadTypes.includes(extension)) {
      this.downloadFile(this.finalUrl);
      this.dialogRef.close();
      return;
    } else {
      console.warn("Unsupported file type:", extension);
      this.downloadFile(this.finalUrl);
      this.dialogRef.close();
      return;
    }
    
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.finalUrl);
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  downloadFile(url: string) {
    window.open(url, "_blank");
  }

  getExtension(filename: string): string {
    return filename?.split(".").pop()?.toLowerCase() || "";
  }
}
