import { Component, Input } from "@angular/core";
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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { TranslocoModule } from "@ngneat/transloco";
import { UploadFilesComponent } from "../../upload-files/upload-files/upload-files.component";
import { SharedService } from "app/shared/shared.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UploadDocumentService } from "../../upload-document/uploadDoc.service";
import { FileWithMetadata } from "../../upload-files/model/upload-files.models";
import { AuthService } from "app/core/auth/auth.service";
import { MasterService } from "../../Master/master.service";

@Component({
  selector: "app-get-doc",
  standalone: true,
  animations: fuseAnimations,
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
    MatProgressBarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    UploadFilesComponent,
  ],
  templateUrl: "./get-doc.component.html",
  styleUrl: "./get-doc.component.scss",
})
export class GetDocComponent {
  isLoading: boolean = false;

  files: any[] = [];

  caseMetaData: any;
  
  alert: { type: string; message: string };

  @Input() selectedFiles: FileWithMetadata[] = [];

  selectedMetadata: any[] = [];

  authData: any;

  canEdit: boolean = false;
  fileClassificationDropDown: [];
  fileTypesDropDown: [];

  fileToView: any = null;

  constructor(
    private dataService: SharedService,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _masterService:MasterService,
    private authenticationService:AuthService
  ) {
    this.authData = this.authenticationService.getAuthData();
  
  }

  ngOnInit() {
    this.dataService.setFileBoolean(false);
    this.getFilesWithMetadataSelected();
    this.getCasedataSelected();
    this.getFileClassificationInfo();
    this.getFileTypesInfo();
  }

  getFilesWithMetadataSelected() {
    this.dataService.getFilesData().subscribe((files) => {
      this.files = files;
    });
  }

  getCasedataSelected() {
    this.dataService.getCaseData().subscribe((caseData) => {
      this.caseMetaData = caseData;
    });
  }

  onFilesWithMetadataSelectedUpdate(data: {
    files: FileWithMetadata[];
    metadata: any[];
  }) {
    this.selectedFiles = data.files; 
    this.selectedMetadata = data.metadata;
   
    console.log("Files selected:", this.selectedFiles); 
    console.log("Metadata selected:", this.selectedMetadata);
  }

  updateUploadedFile() {
    const formData = new FormData();
    formData.append("caseDetails", JSON.stringify(this.caseMetaData));
    console.log("file", this.selectedFiles);
    const fileDetailsArray = this.selectedFiles.map((file) => ({
      hashTag: file.metadata.hashTag
        ? file.metadata.hashTag
            .split(",")
            .map((tag) => tag.trim())
            .join(",")
        : "",
      subject: file.metadata.subject || "",
      classification: file.metadata.classification || "",
      fileType: file.metadata.fileType || "",
    }));
    formData.append("fileDetails", JSON.stringify(fileDetailsArray));

    this.selectedFiles.forEach((file) => {
      formData.append(`Files`, file);
    });
    this._uploadDocumentService
      .updateUploadedDoc(this.caseMetaData.CaseInfoDetailsId, formData)
      .subscribe({
        next: (response: any) => {
          this._snackBar.open("File Updated successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this._router.navigateByUrl("search-document");
          this.selectedFiles = [];
        },
        error: (error) => {
          this._snackBar.open(error.message || "Error creating user", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
        },
      });
  }
  
  getFileClassificationInfo() {
    this._masterService.getFileClassification().subscribe({
      next: (response: any) => {
        this.fileClassificationDropDown= response;
      },
      error: (error) => {},
    });
  }

    getFileTypesInfo() {
      this._masterService.getFileTypes().subscribe({
        next: (response: any) => {
         this.fileTypesDropDown= response;
        },
        error: (error) => {},
      });
    } 

  isImage(file: any): boolean {
    return file && file.type && file.type.startsWith('image/');
  }

  isPdf(file: any): boolean {
    return file && file.type === 'application/pdf';
  }

  viewFile(file: any) {
    this.fileToView = file;
  }
}
