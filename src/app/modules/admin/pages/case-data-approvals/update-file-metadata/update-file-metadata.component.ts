import {
  Component,
  ViewEncapsulation,
  OnInit,
  Input,
  Inject,
} from "@angular/core";
import { CommonModule, NgIf } from "@angular/common";
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
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UploadDocumentService } from "../../upload-document/uploadDoc.service";
import { CaseDataApprovalService } from "../case-data-approvals.service";
// import { FileMetadataService } from 'path-to-your-service';
// import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: "app-update-file-metadata",
  standalone: true,
  imports: [
    NgIf,
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
  ],
  templateUrl: "./update-file-metadata.component.html",
  styleUrl: "./update-file-metadata.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class UpdateFileMetadataComponent implements OnInit {
  metadataForm: FormGroup;
  isSubmitting = false;
  ClassificationTypeDropDown: any[] = [];
  FileTypeDropDown: any[] = [];
  DocumentTypeDropDown: any[] = [];
  @Input() fileToEdit: any;
  masterData: any;

  constructor(
    public dialogRef: MatDialogRef<UpdateFileMetadataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _uploadDocumentService: UploadDocumentService,
    private caseDataApprovalService: CaseDataApprovalService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getMasterDropDown();
    if (this.data) {
      this.patchForm(this.data);
      this.getMasterDropDown();
    }
  }

  initForm() {
    this.metadataForm = this.fb.group({
      subject: ["", Validators.required],
      documentType: [null, Validators.required],
      fileType: [null, Validators.required],
      classification: [null, Validators.required],
      hashTag: [""],
      description: [""],
      keywords: [""],
    });
  }

  patchForm(data: any) {
    this.metadataForm.patchValue({
      subject: data.file.subject || "",
      documentType: data.file.documentType || null,
      fileType: data.file.fileType || null,
      classification: data.file.classification || null,
      hashTag: data.file.hashTag || "",
    });
    this.onFileTypeChange(data.file.documentType);
  }

  updateMetadata() {
    if (this.metadataForm.invalid) return;
    this.isSubmitting = true;
    const payload = {
      classification: this.metadataForm.value.classification,
      documentType: this.metadataForm.value.documentType,
      hashTag: this.metadataForm.value.hashTag,
    };
    this.caseDataApprovalService
      .updateFileDataById(this.fileToEdit?.id,payload)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
           this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
        },
      });
  }

  onHashTagKeyUp(event: KeyboardEvent): void {
    if (event.key === " ") {
      const hashTagControl = this.metadataForm.get("hashTag");
      const hashTagValue = hashTagControl.value;
      const words = hashTagValue
        .split(" ")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
      const updatedHashTag = words.join(" ");
      hashTagControl.setValue(updatedHashTag);
    }
  }

  getMasterDropDown() {
    this._uploadDocumentService.getMasterDropDownData().subscribe({
      next: (response: any) => {
        this.masterData = response;
        this.ClassificationTypeDropDown = response.ClassificationType;
        this.FileTypeDropDown = response.FileType;
      },
      error: (error) => {},
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

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onFileTypeChange(data) {
    if (data.value || data == 3) {
      this.DocumentTypeDropDown = this.masterData.CaseFiles;
    } else if (data.value || data == 4) {
      this.DocumentTypeDropDown = this.masterData.Correspondence;
    }
  }
}
