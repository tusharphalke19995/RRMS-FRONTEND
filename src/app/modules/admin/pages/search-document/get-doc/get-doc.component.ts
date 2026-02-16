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
import { Dialog } from "@angular/cdk/dialog";
import { MatDialog } from "@angular/material/dialog";
import { CaseTransferDialogComponent } from "../../case-tranfer/case-tranfer-dialog.component";

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
  isOwner: boolean = false;

  fileToView: any = null;
  checkGetFile: boolean;
  finalUserID: number;
  showRequestConent:boolean=true;
  masterData: any;
  isDraft: boolean = false;
  isCheckDIG:boolean;
  constructor(
    private dataService: SharedService,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _masterService:MasterService,
    private authenticationService:AuthService,
    private searchDocService:SearchDocService,
    private caseDataApprovalService:CaseDataApprovalService,
     private dialog: MatDialog
  ) {
    this.authData = this.authenticationService.getAuthData();
    console.log("this.authData",this.authData)
  }

  ngOnInit() {
    this.dataService.setFileBoolean(false);
    this.getFilesWithMetadataSelected();
    this.getCasedataSelected();
    this.getMasterDropDown()
    this.getFilesCheck();
    this.finalUserID =  this.authData.UserID;
    this.checkDIGUser();
  }
  
checkDIGUser() {
  this.isCheckDIG = (this.authData?.DesignationName || [])
    .some(d => /ADG|DIG/.test(d.designationName));
}


  getFilesWithMetadataSelected() {
    this.dataService.getFilesData().subscribe((files) => {
      this.files = files;
      this.originalFiles = JSON.parse(JSON.stringify(files));
      
      // Check if current user is the owner of any files
      this.checkIfUserIsOwner();
      
      // Ensure files have proper metadata structure with API subjects and fileName
      this.files.forEach((file) => {
        // Ensure fileName is preserved from API response
        if (!file.fileName && (file as any).fileName) {
          file.fileName = (file as any).fileName;
        }
        
        // If subject doesn't match fileName, use fileName as subject for display
        if (file.fileName && file.subject && file.subject !== file.fileName) {
          // Check if multiple files share the same subject (indicating incorrect subject)
          const sameSubjectCount = this.files.filter(f => f.subject === file.subject).length;
          if (sameSubjectCount > 1) {
            // Multiple files share this subject, use fileName as subject
            file.subject = file.fileName;
          }
        } else if (file.fileName && !file.subject) {
          // If no subject, use fileName
          file.subject = file.fileName;
        }
        
        if (!file.metadata) {
          file.metadata = {
            subject: file.subject || file.fileName || "",
            fileType: file.fileType || "",
            classification: file.classification || "",
            hashTag: file.hashTag || "",
            documentType: file.documentType || "",
          };
        } else {
          // Ensure API subject/fileName is used if available
          if (file.fileName && (!file.metadata.subject || file.metadata.subject !== file.fileName)) {
            // Use fileName as subject if it's more accurate
            file.metadata.subject = file.fileName;
          } else if (file.subject && !file.metadata.subject) {
            file.metadata.subject = file.subject;
          }
        }
      });
      
      if(this.files.length>0){
        this.showRequestConent= false;
      }
    })
  }

  checkIfUserIsOwner(): void {
    if (this.files && this.files.length > 0 && this.authData?.UserID) {
      // Check if any file has uploaded_by matching the current user's UserID
      this.isOwner = this.files.some(file => file.uploaded_by === this.authData.UserID);
    } else {
      this.isOwner = false;
    }
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
    // Get files to update - either selected files or all files
    const filesToUpdate = this.selectedFiles?.length > 0 ? this.selectedFiles : this.files;

    if (!filesToUpdate || filesToUpdate.length === 0) {
      this._snackBar.open('No files to update', 'Close', { 
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top", 
      });
      return;
    }

    // Get only changed files for update
    const changedFiles = filesToUpdate.filter(file => {
      const metadata = file.metadata || file;
      const original = this.originalFiles.find(f => (f as any).fileId === (file as any).fileId);
      const originalMetadata = original?.metadata || original;

      if (!(file as any).fileId || !metadata || !originalMetadata) {
        return false;
      }

      // Check if any field has changed
      return ['classification', 'documentType', 'hashTag', 'fileType', 'subject']
        .some(key => metadata[key] !== originalMetadata[key]);
    });

    if (changedFiles.length === 0) {
      this._snackBar.open('No files have been modified', 'Close', { 
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top", 
      });
      return;
    }

    let updateCount = 0;
    let errorCount = 0;

    // Show progress message
    this._snackBar.open(`Updating ${changedFiles.length} modified file(s)...`, 'Close', { 
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top", 
    });

    changedFiles.forEach((file) => {
      // Use the enhanced metadata preparation method
      const metadata = file.metadata || file;
      const original = this.originalFiles.find(f => (f as any).fileId === (file as any).fileId);
      const originalMetadata = original?.metadata || original;

      if (!(file as any).fileId || !metadata || !originalMetadata) {
        console.warn("Missing metadata or fileId", file);
        errorCount++;
        return;
      }

      // Prepare payload using the enhanced method
      const payload = {
        classification: metadata.classification,
        documentType: metadata.documentType,
        hashTag: metadata.hashTag,
        fileType: metadata.fileType,
        subject: metadata.subject,
      };

      this.caseDataApprovalService.updateFileDataById((file as any).fileId, payload).subscribe({
        next: () => {
          updateCount++;
          
          // Update the original files array to reflect the changes
          const originalIndex = this.originalFiles.findIndex(f => (f as any).fileId === (file as any).fileId);
          if (originalIndex !== -1) {
            this.originalFiles[originalIndex] = JSON.parse(JSON.stringify(file));
          }

          // Show individual success message
          this._snackBar.open(`✓ Updated: ${file.fileName || file.name || 'File'}`, 'Close', { 
            duration: 2000,
            horizontalPosition: "right",
            verticalPosition: "top", 
          });
        },
        error: (err) => {
          errorCount++;
          console.error('Upload failed', err);
          this._snackBar.open(`✗ Failed: ${file.fileName || file.name || 'File'}`, 'Close', { 
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top", 
          });
        }
      });
    });

    // Show final summary after all updates
    setTimeout(() => {
      if (updateCount > 0) {
        this._snackBar.open(`Successfully updated ${updateCount} of ${changedFiles.length} files${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'Close', { 
          duration: 5000,
          horizontalPosition: "right",
          verticalPosition: "top", 
          panelClass: ["green-snackbar"],
        });
      }
    }, 1000);
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
    // Ensure case data has proper structure for upload-document component
    const formattedCaseData = {
      ...this.caseMetaData,
      // Map the correct field names for upload-document component
      stateId: this.caseMetaData.stateId || this.caseMetaData.stateID,
      districtId: this.caseMetaData.districtId || this.caseMetaData.districtID,
      unitId: this.caseMetaData.unitId || this.caseMetaData.unitID,
      Office: this.caseMetaData.Office || this.caseMetaData.office,
      caseType: this.caseMetaData.caseType || this.caseMetaData.caseTypeId,
      caseStatus: this.caseMetaData.caseStatus || this.caseMetaData.statusId,
      year: this.caseMetaData.year || this.caseMetaData.yearId
    };
    
    console.log('Formatted case data for upload:', formattedCaseData);
    this._uploadDocumentService.setState(this.files, formattedCaseData, true);
    this._router.navigateByUrl('upload-document');
  }
  
  /**
   * Get tracking summary from upload-files component
   */
  getTrackingSummary(): any {
    // This will be called from the template to get tracking info
    return {
      totalFiles: this.files.length,
      selectedFiles: this.selectedFiles?.length || 0,
      originalFiles: this.originalFiles.length
    };
  }

  /**
   * Get changed files count for display
   */
  getChangedFilesCount(): number {
    if (!this.files || this.files.length === 0) return 0;
    
    return this.files.filter(file => {
      const metadata = file.metadata || file;
      const original = this.originalFiles.find(f => (f as any).fileId === (file as any).fileId);
      const originalMetadata = original?.metadata || original;

      if (!(file as any).fileId || !metadata || !originalMetadata) {
        return false;
      }

      return ['classification', 'documentType', 'hashTag', 'fileType', 'subject']
        .some(key => metadata[key] !== originalMetadata[key]);
    }).length;
  }

  caseTransfer(data){
      this.caseMetaData = data;
    const dialogRef = this.dialog.open(CaseTransferDialogComponent, {
        width: "799px",
        data:  this.caseMetaData,
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
  }
}
