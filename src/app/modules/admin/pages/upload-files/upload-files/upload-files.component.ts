import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BehaviorSubject, of, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  IFileUploadModel,
  IVerificationFileUploadModel,
} from "../model/upload-files.models";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SharedService } from "app/shared/shared.service";
import { UploadedFilesComponent } from "../../search-document/uploaded-files/uploaded-files.component";
import { UploadDocumentService } from "../../upload-document/uploadDoc.service";
import { AuthService } from "app/core/auth/auth.service";
import { MasterService } from "../../Master/master.service";
import { ContentManagerDialogComponent } from "../component/content-manager-dialog/content-manager-dialog.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ImagePreviewDailogComponent } from "../component/image-preview-dailog/image-preview-dailog.component";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { FuseDrawerComponent } from "@fuse/components/drawer";
import { FuseDrawerService } from "@fuse/components/drawer";
// import { saveAs } from 'file-saver';

interface CustomFile extends File {
  validationErrors?: string[];
}

interface FileWithMetadata extends CustomFile {
  metadata?: {
    subject: string;
    fileType: string;
    classification: string;
    hashTag: string;
    documentType: string;
  };
  fileName?: string;
  subject?: string;
}

@Component({
  selector: "app-upload-files",
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    CommonModule,
    FuseDrawerComponent,
    ImagePreviewDailogComponent,
  ],
  templateUrl: "./upload-files.component.html",
  styleUrls: ["./upload-files.component.scss"],
})
export class UploadFilesComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Output() filesWithMetadataSelected = new EventEmitter<{
    files: FileWithMetadata[];
    metadata: any;
  }>(); // Emit files and metadata
  sourceFile: any = null;
  fileRestrictions: any;
  isConfirmRemoveOpen: boolean = false; // Control the visibility of the confirmation dialog
  fileToRemoveIndex: number | null = null; // Store the index of the file to be removed

  @Input() filesData: any[] = [];
  @Input() getfiles: any[] = [];
  @Input() ClassificationTypeDropDown: any[] = [];
  @Input() DocumentTypeDropDown: any[] = [];
  @Input() FileTypeDropDown: any[] = [];
  @Input() masterData: any;
  @Output() formReady = new EventEmitter<FormGroup>();
  @Output() filesSelected = new EventEmitter<IVerificationFileUploadModel[]>();
  // @ViewChildren(UploadDocsComponent) childGames!: QueryList<UploadDocsComponent>;
  @ViewChild('pdfPreviewDrawer') pdfPreviewDrawer: FuseDrawerComponent;
  previewData: any = null;
  @Input() loadingVisible: boolean;
  @Input() isCheckModalConfirmaion: boolean;
  @Input() checkFileSatus: boolean;
  loading$ = new BehaviorSubject<boolean>(false);
  files = {
    selectedFiles: [] as IFileUploadModel[],
    removedFiles: [] as IFileUploadModel[],
  };
  filesSlected: any[] = [];
  @Input() formGroup: FormGroup;
  @Input() filesDataSearch: any[] = [];
  @Input() finalUserID: number;
  isUploadInProgress = false;
  isSaveDraftInProgress = false;
  openUploadDialog = false;
  openUploadDialogHistory = false;
  isViewUploadedFlow = false;
  isFileUploadFailedFromAPI = false;
  isViewUploadedFlowHistory = false;
  isSubmitInProgress = false;
  isView: boolean;
  isViewSearch: string;
  showTextNoData: boolean;
  textNoDocument = "No Document Found";
  errorMessage: string;

  @Input() uploadButtonText = "verification.uploadTitle";
  @Input() selectedFiles: FileWithMetadata[] = [];
  @Input() isFileUploadVisible = true;
  @Output() save = new EventEmitter<object>();
  @Output() cancel = new EventEmitter();
  @Output() delete = new EventEmitter<object>();
  allFiles: Array<File> = null;
  openFileDialog = false;
  showLoader = false;
  previewNavLoading = false;
  previewNavTitle = "Opening preview…";
  controlId: number = 0;
  removedFiles: IVerificationFileUploadModel[] = [];
  selectedFilesTemp: IVerificationFileUploadModel[] = [];
  @Input() selectedFilesIndex = [];
  public totalFileByIndex = [];
  public currentIndex = 0;
  isDisableCheck: boolean;
  disabled = false;
  showLoaderShow = false;
  fileToRemove: IVerificationFileUploadModel | null = null;
  isFileModalOpen = false;
  @Input() isViewAction: boolean;
  isViewSearchAction: string;
  private subscriptions = new Subscription();
  @Input() contentManagerDropdown = [];
  @Input() crimeNo: string;
  metadataForm: FormGroup;
  openFileModal: boolean;
  fileToEdit: FileWithMetadata | null = null;
  maxFileSize = 50 * 1024 * 1024 * 1024;
  minFileSize = 1 * 1024; // 1KB
  checkGetFile: boolean;
  caseDetails: any[];
  authData: any;
  DivisionsRoles: any;
  filteredDocumentTypes: DocumentType[] = [];
  documentTypeSearchTimeout: any;
  selectedIndexes = new Set<number>();
  userLoginId: any;
  previewUrl: string | null = null;
  previewType: "image" | "video" | "audio" | "pdf" | "other" = "other";
  showEditUserUpload: boolean;
  @Input() caseMetaData: any;
  @Input() isDraft: boolean;

  constructor(
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dataService: SharedService,
    private _router: Router,
    private _masterService: MasterService,
    private authenticationService: AuthService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _uploadDocumentService: UploadDocumentService,
    private _searchDocService: SearchDocService,
    private _fuseDrawerService: FuseDrawerService
  ) {
    this.authData = this.authenticationService.getAuthData();
    this.metadataForm = this.fb.group({
      subject: ["", Validators.required],
      fileType: ["", Validators.required],
      classification: ["", Validators.required],
      hashTag: [""],
      documentType: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.getFilesCheck();
    this.initializeFormControls();
    this.updateViewState();

    // Ensure preview loader stops after navigation completes/cancels/errors
    this.subscriptions.add(
      this._router.events.subscribe((evt: any) => {
        const name = evt?.constructor?.name;
        if (!this.previewNavLoading) return;
        if (name === "NavigationEnd" || name === "NavigationCancel" || name === "NavigationError") {
          this._setPreviewNavLoading(false);
        }
      })
    );
  }

  ngAfterViewInit() {
    // ViewChild is now available
    // Drawer will be ready when viewImage is called
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private _setPreviewNavLoading(on: boolean, title?: string): void {
    this.previewNavLoading = on;
    if (title) this.previewNavTitle = title;
    this._changeDetectorRef.detectChanges();
  }

  onDrawerClose() {
    this.previewData = null;
    this._setPreviewNavLoading(false);
    if (this.pdfPreviewDrawer) {
      this.pdfPreviewDrawer.close();
    }
    this._changeDetectorRef.detectChanges();
  }

  initializeFormControls() {
    if (this.formGroup && !this.formGroup.get("file")) {
      this.formGroup.addControl(
        "file",
        this.fb.control("", Validators.required)
      );
    }
  }

  private updateViewState() {}

  public toggleFilesPopUp(isUploadedViewFlow: boolean = false): void {
    if (this.isUploadInProgress || this.isSaveDraftInProgress) {
      this._snackBar.open("File upload is in progress", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["green-snackbar"],
      });
      return;
    }
    this.openUploadDialog = !this.openUploadDialog;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["formGroup"] && this.formGroup) {
      this.patchData(this.formGroup.value);
    }
    this.showTextNoData = !this.filesData?.length;
    
    // Handle file changes - either from getfiles input or filesData
    if (changes["getfiles"] && this.getfiles) {
      this.selectedFiles = [...this.getfiles];
    } else if (changes["filesData"] && this.filesData) {
      this.selectedFiles = [...this.filesData];
    }
    
    if (this.checkFileSatus == true) {
      this.metadataForm.reset();
      this.selectedFiles = [];
      this.filesWithMetadataSelected.emit({ files: [], metadata: [] });
    }
    
    // Ensure all files have proper fileName and subject with fallback
    if (this.selectedFiles.length > 0) {
      this.showEditUserUpload = true;
      this.selectedFiles.forEach((file, idx) => {
        // Prioritize fileName from API, then name property, then fallback
        file.fileName = file.fileName || file.name || `File${idx+1}`;
        
        // For files from API (search document), use fileName as subject if subject is missing or incorrect
        // Check if this is an API file (has fileId or fileHash)
        const isApiFile = (file as any).fileId || (file as any).fileHash;
        
        if (isApiFile) {
          // For API files, prioritize fileName over subject if subject is missing or seems incorrect
          // If subject doesn't match fileName, use fileName as subject
          if (!file.subject || file.subject === undefined || file.subject.trim() === '') {
            file.subject = file.fileName;
          } else if (file.fileName && file.subject !== file.fileName) {
            // If subject exists but doesn't match fileName, check if it's a duplicate
            // If multiple files have the same subject but different fileNames, use fileName
            const sameSubjectCount = this.selectedFiles.filter(f => f.subject === file.subject).length;
            if (sameSubjectCount > 1) {
              // Multiple files share this subject, use fileName instead
              file.subject = file.fileName;
            }
          }
        } else {
          // For newly uploaded files, use existing logic
          const firstSubject = this.selectedFiles[0]?.subject;
          if (!file.subject || file.subject === firstSubject || file.subject === undefined) {
            file.subject = file.fileName;
          }
        }
        
        // Always set metadata and metadata.subject with fallback
        if (!file.metadata) {
          file.metadata = {
            subject: file.subject || file.fileName || `File${idx+1}`,
            fileType: (file as any).fileType || "",
            classification: (file as any).classification || "",
            hashTag: (file as any).hashTag || "",
            documentType: (file as any).documentType || "",
          };
        } else {
          // For API files, ensure metadata.subject uses fileName if subject was corrected
          if (isApiFile && file.fileName && file.subject === file.fileName) {
            file.metadata.subject = file.fileName;
          } else {
            const apiSubject = file.subject;
            const existingSubject = file.metadata.subject;
            file.metadata.subject = apiSubject || existingSubject || file.fileName || `File${idx+1}`;
          }
        }
      });
      this.filesWithMetadataSelected.emit({
        files: this.selectedFiles,
        metadata: this.selectedFiles.map((file) => file.metadata),
      });
    }
  }

  patchData(formData: any) {
    if (!this.formGroup) return;
    this.formGroup.patchValue({});
  }

  downloadFile(file: any) {}

  public onSelectFile(fileList: FileList): void {
    // this.selectedFilesTemp = [...this.selectedFiles];
    const validFiles: CustomFile[] = [];
    const invalidFiles: { file: File; error: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = this.getFileValidationError(file);
      if (!validationError) {
        validFiles.push(file as CustomFile);
      } else {
        invalidFiles.push({ file, error: validationError });
      }
    }

    this.handleFileSelection(validFiles, invalidFiles);
  }

  private handleFileSelection(
    validFiles: CustomFile[],
    invalidFiles: { file: any; error: string }[]
  ): void {
    if (invalidFiles.length > 0) {
      this.errorMessage =
        "Some files do not meet the restrictions:\n" +
        invalidFiles
          .map(
            (invalidFile) => `${invalidFile.file.name}: ${invalidFile.error}`
          )
          .join("\n");
      this._snackBar.open(this.errorMessage, "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["green-snackbar"],
      });
    }
  }

  private getFileValidationError(file: any): string | null {
    const { allowedExtensions, maxFileSize, minFileSize } =
      this.fileRestrictions;
    const extension = file.extension.toLowerCase();
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2); // Size in MB
    const fileSizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2); // Size in GB

    // Check if file type is allowed
    if (!allowedExtensions.includes(extension)) {
      return "Invalid file type.";
    }

    // Check if file size is too small
    if (file.size < minFileSize) {
      return `File size is too small. Minimum size is ${
        minFileSize / (1024 * 1024)
      } MB. Current file size is ${fileSizeMB} MB.`;
    }

    // Check if file size exceeds max allowed size
    if (file.size > maxFileSize) {
      return `File size is too large. Maximum size is ${
        maxFileSize / (1024 * 1024 * 1024)
      } GB. Current file size is ${fileSizeGB} GB.`;
    }

    return null;
  }

  get disableSaveButton() {
    return !this.selectedFiles;
  }

  public onSaveClick(): void {
    if (!this.selectedFiles.every((f) => !f.validationErrors?.length)) {
      this._snackBar.open("csi.fileValidationErrorMessage", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["green-snackbar"],
      });
      return;
    }
    this.totalFileByIndex = this.selectedFilesIndex[this.currentIndex];
    this.openUploadDialog = false;
  }

  public onCancelClick(): void {
    this.removedFiles = [];
    this.openUploadDialog = false;
  }

  public onRemoveFile(file: IVerificationFileUploadModel, index: number): void {
    if (file) {
      this.totalFileByIndex.splice(index, 1);
      this.removedFiles.push(file);
      this.selectedFiles = this.selectedFiles.filter(
        (f) => f.name !== file.name
      );
      if (this.selectedFiles.length < 1) {
        this.openUploadDialog = false;
      }
    }
  }

  openSelectedFileModal(file: FileWithMetadata): void {
    this.fileToEdit = file;
    this.metadataForm.reset();

    // For API files, prioritize fileName; for new files, prioritize name
    const isApiFile = (file as any).fileId || (file as any).fileHash;
    const fileName = isApiFile 
      ? (file.fileName || file.name || '')
      : (file.name || file.fileName || '');
    
    const metadataToUse = {
      subject: file.subject || file.metadata?.subject || (fileName ? (this.crimeNo ? `${this.crimeNo}_${fileName}` : fileName) : ''),
      fileType: (file as any).fileType || file.metadata?.fileType || "",
      documentType: (file as any).documentType || file.metadata?.documentType || "",
      classification: (file as any).classification || file.metadata?.classification || "",
      hashTag: (file as any).hashTag || file.metadata?.hashTag || "",
    };

    // Update document type dropdown based on file's fileType
    this.updateDocumentTypes(metadataToUse.fileType);

    // Subscribe to fileType changes to update DocumentType dropdown
    this.subscriptions.add(
      this.metadataForm.get('fileType')?.valueChanges.subscribe(fileTypeId => {
        this.updateDocumentTypes(fileTypeId);
        if (fileTypeId && this.metadataForm.get('documentType')?.value) {
          this.metadataForm.patchValue({ documentType: null }, { emitEvent: false });
        }
      })
    );

    this.metadataForm.patchValue(metadataToUse);
    this.openFileModal = true;
    this._changeDetectorRef.detectChanges();
  }

  closeFileModal(): void {
    this.openFileModal = false;
    this.fileToEdit = null;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this._changeDetectorRef.detectChanges();
  }

  openMetadataForSelected(): void {
    // Reset the metadata form
    this.metadataForm.reset();

    // If multiple files are selected, create a dynamic subject
    if (this.selectedIndexes.size > 0) {
      // For both "Edit All" and "Edit Selected" cases, we'll use the first file's data
      const firstFileIndex = Array.from(this.selectedIndexes)[0];
      const firstFile = this.selectedFiles[firstFileIndex];

      if (firstFile) {
        // For API files, prioritize fileName; for new files, prioritize name
        const isApiFile = (firstFile as any).fileId || (firstFile as any).fileHash;
        const fileName = isApiFile 
          ? (firstFile.fileName || firstFile.name || '')
          : (firstFile.name || firstFile.fileName || '');
        
        // Prepare metadata object with API data priority
        const metadataToUse = {
          subject: firstFile.subject || firstFile.metadata?.subject || (fileName ? (this.crimeNo ? `${this.crimeNo}_${fileName}` : fileName) : ''),
          fileType: (firstFile as any).fileType || firstFile.metadata?.fileType || "",
          documentType: (firstFile as any).documentType || firstFile.metadata?.documentType || "",
          classification: (firstFile as any).classification || firstFile.metadata?.classification || "",
          hashTag: (firstFile as any).hashTag || firstFile.metadata?.hashTag || "",
        };

        // Update document type dropdown based on file's fileType BEFORE patching form
        this.updateDocumentTypes(metadataToUse.fileType);
        
        // Populate the form with the metadata
        this.metadataForm.patchValue(metadataToUse);
      }

      // Force change detection
      this._changeDetectorRef.detectChanges();
    }

    // Open the metadata modal
    this.openFileModal = true;

    // Clear the fileToEdit since we're applying to multiple files
    this.fileToEdit = null;
  }

  getFileSubject(file: FileWithMetadata): string {
    // Handle null or undefined file
    if (!file) {
      return 'UnknownFile';
    }
    
    // For API files (from search document), prioritize fileName
    const isApiFile = (file as any).fileId || (file as any).fileHash;
    let displayName: string;
    
    if (isApiFile) {
      // For API files, use fileName first, then subject, then name
      displayName = file.fileName || file.subject || file.name || 'UnknownFile';
    } else {
      // For newly uploaded files, use name first, then fileName, then subject
      displayName = file.name || file.fileName || file.subject || 'UnknownFile';
    }
    
    // If we have a valid displayName, use it
    if (displayName && displayName !== 'UnknownFile') {
      // For API files, return fileName as-is (it already has case number if needed)
      if (isApiFile) {
        return displayName;
      }
      
      // For new files, add case number if needed
      const caseNo = this.crimeNo && this.crimeNo !== 'undefined' ? this.crimeNo : '';
      if (!caseNo) {
        return displayName;
      }
      
      // Clean the base name by removing any existing case numbers
      const cleanBase = displayName.replace(/^\d+_/, '');
      
      // If base already starts with caseNo, don't prepend
      if (displayName.startsWith(caseNo)) {
        return displayName;
      }
      
      return `${caseNo}_${cleanBase}`;
    }
    
    return 'UnknownFile';
  }

  submitMetadata(): void {
    if (this.metadataForm.valid) {
      const metadata = this.metadataForm.value;

      // If only one file, always apply metadata
      if (this.selectedFiles.length === 1) {
        this.selectedFiles[0].metadata = {
          ...this.selectedFiles[0].metadata,
          ...metadata,
        };
      }
      // If checkboxes are selected, apply to those files
      else if (this.selectedIndexes.size > 0) {
        this.selectedIndexes.forEach((index) => {
          const file = this.selectedFiles[index];
          if (file) {
            // Apply metadata with all updated fields
            file.metadata = {
              ...file.metadata,
              ...metadata,
            };
          }
        });
      }
      // If no checkboxes are selected, apply to the file for which modal was opened
      else if (this.fileToEdit) {
        const file = this.selectedFiles.find(
          (f) => f === this.fileToEdit || f.name === this.fileToEdit.name
        );
        if (file) {
          file.metadata = {
            ...file.metadata,
            ...metadata,
          };
        }
      }

      // Emit the updated files with metadata to the parent component
      this.filesWithMetadataSelected.emit({
        files: this.selectedFiles,
        metadata: this.selectedFiles.map((file) => file.metadata),
      });

      this._snackBar.open("Metadata updated successfully", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["green-snackbar"],
      });
      this.openFileModal = false;
      this.selectedIndexes.clear();
      
      // Refresh the card display
      this.refreshCardDisplay();
    }
  }

  onFileChange(event: any) {
    this.showEditUserUpload = true;
    const files: FileList = event.target.files;

    if (files.length > 0) {
      const newFiles = Array.from(files)
        .map((file) => this.validateFile(file as FileWithMetadata))
        .filter((file) => file.validationErrors?.length === 0);
      
      // Add default metadata with subject for new files
      newFiles.forEach((file) => {
        const fileName = file.name || file.fileName || 'UnknownFile';
        const subjectWithCaseNo = file.subject || `${this.crimeNo}_${fileName}`;
        
        if (!file.metadata) {
          file.metadata = {
            subject: subjectWithCaseNo,
            fileType: "",
            classification: "",
            hashTag: "",
            documentType: "",
          };
        } else if (!file.metadata.subject) {
          // If metadata exists but no subject, use API subject or create default
          file.metadata.subject = subjectWithCaseNo;
        }
        
        // Set the subject on the file as well
        file.subject = subjectWithCaseNo;
      });
      
      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      // Emit the selected files and their metadata to the parent
      this.filesWithMetadataSelected.emit({
        files: this.selectedFiles,
        metadata: this.selectedFiles.map((file) => file.metadata),
      });

      if (this.formGroup) {
        this.formGroup.patchValue({
          file: this.selectedFiles,
        });
      }
    }
  }

  validateFile(file: FileWithMetadata): FileWithMetadata {
    file.validationErrors = [];

    if (file.size > this.maxFileSize) {
      file.validationErrors.push("File size exceeds 2MB limit");
      this._snackBar.open("File size exceeds 2MB limit", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    }

    if (file.size < this.minFileSize) {
      file.validationErrors.push("File size is less than 100KB minimum");
      this._snackBar.open("File size is less than 100KB minimum", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    }

    // Add additional validation if needed
    // Example: file type validation
  //   const allowedTypes = [
  //     "image/jpeg",
  //     "image/png",
  //     "audio/mpeg",
  //     "video/mp4",
  //     "application/pdf",
  //     "application/msword",
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //     "application/vnd.ms-excel",
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //      "application/vnd.ms-powerpoint", 
  // "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  //   ];

  const allowedTypes = [
  "image/jpeg",  // JPG
  "image/png",   // PNG

  "video/mp4",   // MP4
  "video/mpeg",  // MPEG

  "audio/mpeg",  // MP3
  "audio/wav",   // WAV

  "application/pdf", // PDF

  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX

  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "text/csv", // CSV

  "application/vnd.ms-powerpoint", // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // PPTX
];
    if (!allowedTypes.includes(file.type)) {
      file.validationErrors.push("Invalid file type");
      this._snackBar.open("Invalid file type", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    }

    return file;
  }

  removeFile(index: number) {
    this.fileToRemoveIndex = index;
    this.isConfirmRemoveOpen = true;
  }

  confirmRemoveFile() {
    if (this.fileToRemoveIndex !== null) {
      this.selectedFiles.splice(this.fileToRemoveIndex, 1);
      this.fileToRemoveIndex = null;
      this.isConfirmRemoveOpen = false;
    }
  }

  uploadFiles() {
    if (this.formGroup && this.formGroup.valid && this.selectedFiles.length > 0) {
      this.loadingVisible = true;

      setTimeout(() => {
        // console.log("Files uploaded:", this.selectedFiles);
        this.loadingVisible = false;
        this.selectedFiles = [];
        if (this.formGroup) {
          this.formGroup.reset();
        }
      }, 2000);
    }
  }

  getFilesCheck() {
    this.dataService.getFileBoolean().subscribe((res) => {
      this.checkGetFile = res;
      // console.log("checkGetFile", this.checkGetFile);
    });
  }

  patchDataGetCall(formData: any) {
    debugger;
    if (!this.formGroup) return;
    this.formGroup.patchValue({
      subject: formData.subject || "",
      hashTag: formData.hashTag || "",
      fileType: formData.fileType || "",
      classification: formData.classification || "",
      documentType: formData.documentType || "",
    });
  }

  viewImage(data) {
    console.log("Data", data);

    // If checkGetFile is true, use data directly without API call
    if (this.checkGetFile === true) {
      const fileType = data?.file?.mime_type || data?.file?.type || data?.mime_type || data?.type || data?.file?.mimeType;
      const lowerFileType = fileType?.toLowerCase() || '';
      const nameGuess =
        data?.name ||
        data?.file?.name ||
        data?.file?.file_name ||
        data?.file_name ||
        data?.fileName ||
        data?.file?.fileName ||
        '';
      const fileExt = (nameGuess || '').toString().split('.').pop()?.toLowerCase() || '';
      const isImage = lowerFileType?.startsWith("image/");
      const isVideo = lowerFileType?.startsWith("video/");
      const isAudio = lowerFileType?.startsWith("audio/");
      const isPdf = lowerFileType === "application/pdf";

      // Office document types (xlsx, docx) - no preview at upload time
      const officeMimeTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

      if (officeMimeTypes.includes(lowerFileType) || officeExts.includes(fileExt)) {
        // Download directly for office documents
        const fileObj: File | null = data?.file instanceof File ? data.file : (data instanceof File ? data : null);
        if (fileObj) {
          const url = window.URL.createObjectURL(fileObj);
          const link = document.createElement("a");
          link.href = url;
          link.download = (fileObj as any).name || data?.file_name || data?.fileName || "document";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          return;
        }

        // Fallback: if we have base64 content in-memory, download it
        const base64 = data?.file?.base64_content || data?.base64_content || data?.base64Content;
        const fileName = data?.file?.file_name || data?.file_name || data?.fileName || "document";
        if (base64) {
          const blob = this.base64ToBlob(base64, fileType || "application/octet-stream");
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          return;
        }

        this._snackBar.open("File download will be available after upload.", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["info-snackbar"],
        });
        return;
      }

      // For images, videos, audio, and PDFs - open in dialog (normal preview, no search)
      if (isImage || isVideo || isAudio || isPdf) {
        const dialogRef = this.dialog.open(ImagePreviewDailogComponent, {
          width: '96vw',
          maxWidth: '1000px',
          height: '96vh',
          maxHeight: '96vh',
          panelClass: 'pdf-preview-dialog',
          data: data,
          disableClose: false,
          autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Preview dialog closed');
        });
        return;
      }

      // For other file types - navigate to PDF preview page (fallback)
      this.savePdfPreviewData(data);
      this._setPreviewNavLoading(true, "Opening preview…");
      this._router.navigate(['/search-document/pdf-preview'], {
        state: { data: data }
      }).catch(() => this._setPreviewNavLoading(false));
      return;
    }

    // If checkGetFile is false, always call API first and check response mime_type
    const payload = {
      fileHash: data?.file?.fileHash || data?.fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id: this.caseMetaData?.CaseInfoDetailsId,
    };

    // Show loader immediately so user sees progress
    this._setPreviewNavLoading(true, "Preparing preview…");

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        if (!res) {
          console.error("No file data received");
          this._setPreviewNavLoading(false);
          this._snackBar.open("No file data received. The file may be too large (>1GB) or the server is unavailable. Please try again or contact administrator.", "Close", {
            duration: 8000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
          return;
        }

        // Check file type from API response
        const resFileType = res.mime_type || res.type;
        const base64 = res.base64_content;
        const fileName = res.file_name || "document";
        const fileExt = (fileName || '').toString().split('.').pop()?.toLowerCase() || '';

        if (!resFileType) {
          console.error("No mime type in API response");
          this._setPreviewNavLoading(false);
          this._snackBar.open("Unable to determine file type", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
          return;
        }

        const lowerFileType = resFileType.toLowerCase();
        const isImage = lowerFileType.startsWith("image/");
        const isVideo = lowerFileType.startsWith("video/");
        const isAudio = lowerFileType.startsWith("audio/");
        const isPdf = lowerFileType === "application/pdf";

        console.log('API response - fileType:', resFileType, 'isImage:', isImage, 'isVideo:', isVideo, 'isAudio:', isAudio, 'isPdf:', isPdf);

        // Office document types - download directly
        const officeMimeTypes = [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];
        const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

        if (officeMimeTypes.includes(lowerFileType) || officeExts.includes(fileExt)) {
          const blob = this.base64ToBlob(base64, resFileType || "application/octet-stream");
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          this._setPreviewNavLoading(false);
          return;
        }

        // For images, videos, and audio - open in ImagePreviewDailogComponent
        if (isImage || isVideo || isAudio) {
          const previewData = {
            base64_content: base64,
            mime_type: resFileType,
            type: resFileType,
            file_name: fileName,
            fileName: fileName,
            file: {
              base64_content: base64,
              mime_type: resFileType,
              type: resFileType,
              file_name: fileName,
              fileName: fileName
            }
          };

          console.log('Opening ImagePreviewDailogComponent with previewData');
          const dialogRef = this.dialog.open(ImagePreviewDailogComponent, {
            width: '96vw',
            maxWidth: '1400px',
            height: '96vh',
            maxHeight: '96vh',
            panelClass: 'pdf-preview-dialog',
            data: previewData,
            disableClose: false,
            autoFocus: false
          });

          dialogRef.afterClosed().subscribe(result => {
            console.log('Preview dialog closed');
          });
          this._setPreviewNavLoading(false);
          return;
        }

        // For PDFs - navigate to PdfPreviewPageComponent
        if (isPdf) {
          const previewData = {
            base64_content: base64,
            mime_type: resFileType,
            type: resFileType,
            file_name: fileName,
            fileName: fileName,
            file: {
              base64_content: base64,
              mime_type: resFileType,
              type: resFileType,
              file_name: fileName,
              fileName: fileName
            }
          };

          console.log('Navigating to PdfPreviewPageComponent');
          this.savePdfPreviewData(previewData);
          this._router.navigate(['/search-document/pdf-preview'], {
            state: { data: previewData }
          }).catch(() => this._setPreviewNavLoading(false));
          return;
        }

        // For other file types - navigate to PDF preview page (fallback)
        const previewData = {
          base64_content: base64,
          mime_type: resFileType,
          type: resFileType,
          file_name: fileName,
          fileName: fileName,
          file: {
            base64_content: base64,
            mime_type: resFileType,
            type: resFileType,
            file_name: fileName,
            fileName: fileName
          }
        };

        console.log('Navigating to PdfPreviewPageComponent (fallback)');
        this.savePdfPreviewData(previewData);
        this._router.navigate(['/search-document/pdf-preview'], {
          state: { data: previewData }
        }).catch(() => this._setPreviewNavLoading(false));
      },
      error: (error) => {
        console.error("Error fetching file preview:", error);
        this._setPreviewNavLoading(false);
        this._snackBar.open("Error fetching file preview", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  base64ToBlob(base64: string, mime: string): Blob {
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

    return new Blob(byteArrays, { type: mime });
  }

  toggleFavourite(file: any) {
    // console.log("is_favourited", file.is_favourited);
    if (file.is_favourited) {
      this.markUnFavourite(file);
    } else {
      this.markFavourite(file);
    }
  }

  markUnFavourite(data: any) {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._uploadDocumentService
      .markAsUnFavourite(data.fileId, divisionID)
      .subscribe({
        next: (response: any) => {
          this._snackBar.open("Mark As Un Favourite successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
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

  markFavourite(data: any) {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._uploadDocumentService
      .markAsFavourite(data.fileId, divisionID)
      .subscribe({
        next: (response: any) => {
          this._snackBar.open("Mark As Favourite successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
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

  onHashTagKeyUp(event: KeyboardEvent): void {
    if (event.key === " ") {
      const hashTagControl = this.metadataForm.get("hashTag");
      let hashTagValue = hashTagControl?.value || "";
      const words = hashTagValue
        .split(" ")
        .filter((word) => word.trim() !== "")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));

      const updatedHashTag = words.join(" ");

      hashTagControl?.setValue(updatedHashTag + " ");
    }
  }

  formatTags(tags: string): string[] {
    if (!tags) {
      return [];
    }
    return tags
      .split(" ")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  getAccessModalUser(data) {
    const dialogRef = this.dialog.open(ContentManagerDialogComponent, {
      width: "799px",
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        data.is_request_raised = true;
        data.is_access_request_approved = false;
        data.is_approved = false;
      }
      this._changeDetectorRef.detectChanges();
    });
  }

  getFileTypeNameById(fileTypeId: number): string {
    const type = this.DocumentTypeDropDown?.find((t) => t.id === fileTypeId);
    return type ? type.value : "Unknown";
  }

  getFileClassificationNameById(classificationId: number): string {
    const classification = this.ClassificationTypeDropDown?.find(
      (c) => c.id === classificationId
    );
    return classification ? classification.value : "Unknown";
  }

  getFolderNameById(id: number): string {
    const folderName = this.FileTypeDropDown?.find((c) => c.id === id);
    return folderName ? folderName.value : "Unknown";
  }

  getDocNameById(id: number, file?: any): string {
    // First check if documentTypeName is available directly from the file (from API)
    if (file && (file.documentTypeName || file.metadata?.documentTypeName)) {
      return file.documentTypeName || file.metadata?.documentTypeName;
    }
    // Fallback to looking up by ID in dropdown
    if (id && file) {
      // Get file type to determine which dropdown to use
      const fileTypeId = file?.metadata?.fileType || file?.fileType;
      
      // Determine which document type dropdown to search based on file type
      let documentTypesToSearch: any[] = [];
      if (fileTypeId === 3) {
        // Case Files
        documentTypesToSearch = this.masterData?.CaseFiles || [];
      } else if (fileTypeId === 4) {
        // Correspondence
        documentTypesToSearch = this.masterData?.Correspondence || [];
      } else {
        // Fallback to general DocumentTypeDropDown
        documentTypesToSearch = this.DocumentTypeDropDown || [];
      }
      
      // Look up document type by ID
      const docName = documentTypesToSearch.find((c) => c.id === id);
      if (docName) {
        return docName.value;
      }
    } else if (id) {
      // If no file provided, use general dropdown
      const docName = this.DocumentTypeDropDown?.find((c) => c.id === id);
      if (docName) {
        return docName.value;
      }
    }
    return "Unknown";
  }

  updateDocumentTypes(folderId: number): void {
    if (!folderId) {
      this.DocumentTypeDropDown = [];
      this._changeDetectorRef.detectChanges();
      return;
    }
    // Create new array reference to ensure change detection
    if (folderId === 3) {
      this.DocumentTypeDropDown = [...(this.masterData?.CaseFiles || [])];
    } else if (folderId === 4) {
      this.DocumentTypeDropDown = [...(this.masterData?.Correspondence || [])];
    } else {
      this.DocumentTypeDropDown = [];
    }
    this._changeDetectorRef.detectChanges();
  }

  hasRole(...roles: string[]): boolean {
    return this.authData.DivisionsRoles.some((role) =>
      roles.includes(role.role_name)
    );
  }

  selectAllFiles() {
    this.selectedFiles.forEach((_, i) => this.selectedIndexes.add(i));
  }

  deselectAllFiles() {
    this.selectedIndexes.clear();
  }

  onFileCheckboxChange(index: number, checked: boolean) {
    if (checked) {
      this.selectedIndexes.add(index);
    } else {
      this.selectedIndexes.delete(index);
    }
    this._changeDetectorRef.detectChanges();
  }

  get hasSelectedFiles(): boolean {
    return this.selectedIndexes.size > 0;
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.selectedFiles.forEach((_, i) => this.selectedIndexes.add(i));
    } else {
      this.selectedIndexes.clear();
    }
  }

  hasRoleInDivision(...roles: string[]): boolean {
    if (roles.includes(this.authData.Role)) {
      return true;
    }
  }
  isRestrictedToView(file: any): boolean {
    const classification = this.getFileClassificationNameById(
      file.classification
    );
    const role = this.authData.Role;
    const currentUserId = this.finalUserID;
    const uploaderUserId = file.uploaded_by || file.metadata?.uploaded_by;
    if (classification !== "Confidential") return false;
    if (currentUserId === uploaderUserId) return false;
    return role === "User" && !file.is_access_request_approved;
  }

  onFileTypeChangeEdit(data) {
    const fileTypeId = data.documentType || data.fileType;
    this.updateDocumentTypes(fileTypeId);
    this._changeDetectorRef.detectChanges();
  }

  onFileTypeChange(event: any): void {
    const fileTypeId = event?.value ?? null;
    this.updateDocumentTypes(fileTypeId);
    if (fileTypeId) {
      this.metadataForm.patchValue({ documentType: null }, { emitEvent: false });
    }
  }

  canRequestAccess(file: any): boolean {
    // Hide request access button when isDraft is true
    if (this.isDraft) {
      return false;
    }
    
    const hasUserRole = this.authData.Role === "User";
    if (!hasUserRole) {
      return false;
    }
    const classification = this.getFileClassificationNameById(
      file.classification
    );
    // Only allow request if not already raised or approved, and not uploader
    return (
      classification === "Confidential" &&
      !file.is_request_raised &&
      !file.is_access_request_approved &&
      file.uploaded_by !== this.finalUserID
    );
  }

  getAccessStatus(file: any): string {
    const classification = this.getFileClassificationNameById(
      file.classification
    );

    // Only show access status for Confidential files
    if (classification !== "Confidential") {
      return "";
    }
    if (file.uploaded_by === this.finalUserID) {
      return "";
    }
    if (
      file.is_request_raised &&
      file.is_approved &&
      !file.is_access_request_approved
    ) {
      return "Request Sent";
    }
    if (
      file.is_access_request_approved &&
      !file.is_approved &&
      !file.is_request_raised
    ) {
      return "Request Sent";
    }
    if (
      file.is_request_raised &&
      !file.is_access_request_approved &&
      !file.is_approved
    ) {
      return "Already Raised";
    }
    if (this.canRequestAccess(file)) {
      return "Request Access";
    }
    if (file.is_approved && file.is_access_request_approved) {
      return "Access Approved";
    }
    return "";
  }

  refreshCardDisplay(): void {
    // Force change detection to update the card display
    this._changeDetectorRef.detectChanges();
    
    // Emit updated files to parent component
    this.filesWithMetadataSelected.emit({
      files: this.selectedFiles,
      metadata: this.selectedFiles.map((file) => file.metadata),
    });
  }

  onFieldChange(event: any, fieldName: string): void {
    const newValue = event?.target?.value ?? event?.value ?? event;
    
    // Update the field in the current file being edited
    if (this.fileToEdit) {
      const file = this.selectedFiles.find(
        (f) => f === this.fileToEdit || f.name === this.fileToEdit.name
      );
      if (file) {
        if (!file.metadata) {
          file.metadata = {
            subject: "",
            fileType: "",
            classification: "",
            hashTag: "",
            documentType: "",
          };
        }
        file.metadata[fieldName] = newValue;
        
        // Refresh the card display
        this.refreshCardDisplay();
      }
    }
  }

  onSubjectChange(event: any): void {
    this.onFieldChange(event, 'subject');
  }

  private savePdfPreviewData(previewData: any): void {
    this.dataService.setPdfPreviewData(previewData);
    try {
      sessionStorage.setItem('pdfPreviewData', JSON.stringify(previewData));
    } catch (error) {
      console.warn('Failed to store pdf preview data in sessionStorage, using SharedService fallback.', error);
      try {
        sessionStorage.setItem('pdfPreviewData', JSON.stringify({ useShared: true }));
      } catch (e) {
        // ignore
      }
    }
  }
}
