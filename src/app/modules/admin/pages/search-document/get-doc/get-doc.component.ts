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
import { SearchDocService } from "../searchDoc.service";
import { CaseDataApprovalService } from "../../case-data-approvals/case-data-approvals.service";

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
  originalFiles: FileWithMetadata[] = [];  
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
  checkGetFile: boolean;
  finalUserID: number;
  showRequestConent:boolean=true;
  masterData: any;
  constructor(
    private dataService: SharedService,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _masterService:MasterService,
    private authenticationService:AuthService,
    private searchDocService:SearchDocService,
    private caseDataApprovalService:CaseDataApprovalService
  ) {
    this.authData = this.authenticationService.getAuthData();
  
  }

  ngOnInit() {
    this.dataService.setFileBoolean(false);
    this.getFilesWithMetadataSelected();
    this.getCasedataSelected();
    this.getMasterDropDown()
    this.getFilesCheck();
    this.finalUserID =  this.authData.UserID;
  }

  getFilesWithMetadataSelected() {
    this.dataService.getFilesData().subscribe((files) => {
      this.files = files;
       this.originalFiles = JSON.parse(JSON.stringify(files));
      if(this.files.length>0){
      this.showRequestConent= false;
      }
    })
     
  }


  getFilesCheck() {
    this.dataService.getFileBoolean().subscribe((res) => {
      this.checkGetFile = res;
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
  }

updateUploadedFile() {
  const filesToUpdate = this.selectedFiles?.length > 0 ? this.selectedFiles : this.files;

  filesToUpdate.forEach((file) => {
    const metadata = file.metadata || file;

    const original = this.originalFiles.find(f => f.fileId === file.fileId);
    const originalMetadata = original?.metadata || original;

    if (!file.fileId || !metadata || !originalMetadata) {
      console.warn("Missing metadata or fileId", file);
      return;
    }

    // Compare fields
    const hasChanged = ['classification', 'documentType', 'hashTag', 'fileType', 'subject']
      .some(key => metadata[key] !== originalMetadata[key]);

    if (!hasChanged) {
      console.log(`No changes for fileId: ${file.fileId}, skipping update`);
      return;
    }

    const payload = {
      classification: metadata.classification,
      documentType: metadata.documentType,
      hashTag: metadata.hashTag,
      fileType: metadata.fileType,
      subject: metadata.subject,
    };

    this.caseDataApprovalService.updateFileDataById(file.fileId, payload).subscribe({
      next: () => {
        this._snackBar.open('File metadata updated', 'Close', {  duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top", });
      },
      error: (err) => {
        console.error('Upload failed', err);
        this._snackBar.open('Update failed', 'Close', { duration: 3000,horizontalPosition: "right",
            verticalPosition: "top", });
      }
    });
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

hasRoleInDivision(...roles: string[]): boolean {
  if (roles.includes(this.authData.Role)) {
    return true;
  }
}

  getMasterDropDown() {
    this._uploadDocumentService.getMasterDropDownData().subscribe({
      next: (response: any) => {
       this.fileClassificationDropDown =response.ClassificationType;
       this.fileTypesDropDown =response.FileType;
       this.masterData =response;
      },
      error: (error) => {},
    });
  } 

  goToAddDoc(){
    this._uploadDocumentService.setState(this.files, this.caseMetaData,true);
    this._router.navigateByUrl('upload-document');
  }
  
}
