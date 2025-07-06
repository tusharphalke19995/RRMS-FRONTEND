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
    isDraft: boolean = false;
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
      
      // Ensure files have proper metadata structure with API subjects
      this.files.forEach((file) => {
        if (!file.metadata) {
          file.metadata = {
            subject: file.subject || "",
            fileType: file.fileType || "",
            classification: file.classification || "",
            hashTag: file.hashTag || "",
            documentType: file.documentType || "",
          };
        } else {
          // Ensure API subject is used if available
          if (file.subject && !file.metadata.subject) {
            file.metadata.subject = file.subject;
          }
        }
      });
      
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
          this._snackBar.open(`✓ Updated: ${file.name || file.fileName}`, 'Close', { 
            duration: 2000,
            horizontalPosition: "right",
            verticalPosition: "top", 
          });
        },
        error: (err) => {
          errorCount++;
          console.error('Upload failed', err);
          this._snackBar.open(`✗ Failed: ${file.name || file.fileName}`, 'Close', { 
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
    this._uploadDocumentService.setState(this.files, this.caseMetaData,true);
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
}
