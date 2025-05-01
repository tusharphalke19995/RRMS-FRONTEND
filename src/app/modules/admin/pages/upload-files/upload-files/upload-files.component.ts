import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
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
import { SharedService } from "app/shared/shared.service";
import { UploadedFilesComponent } from "../../search-document/uploaded-files/uploaded-files.component";
import { UploadDocumentService } from "../../upload-document/uploadDoc.service";
import { AuthService } from "app/core/auth/auth.service";
import { MasterService } from "../../Master/master.service";
import { ContentManagerDialogComponent } from "../component/content-manager-dialog/content-manager-dialog.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
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
  };
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
    MatCheckboxModule
  ],
  templateUrl: "./upload-files.component.html",
  styleUrls: ["./upload-files.component.scss"],
})
export class UploadFilesComponent implements OnInit, OnChanges {
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

  @Output() formReady = new EventEmitter<FormGroup>();
  @Output() filesSelected = new EventEmitter<IVerificationFileUploadModel[]>();
  // @ViewChildren(UploadDocsComponent) childGames!: QueryList<UploadDocsComponent>;
  @Input() loadingVisible: boolean;
  @Input() isCheckModalConfirmaion: boolean;
  loading$ = new BehaviorSubject<boolean>(false);
  files = {
    selectedFiles: [] as IFileUploadModel[],
    removedFiles: [] as IFileUploadModel[],
  };
  filesSlected: any[] = [];
  @Input() formGroup: FormGroup;
  @Input() filesDataSearch: any[] = [];
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
  @Input() fileTypesDropDown = [];
  @Input() fileClassificationDropDown = [];
  @Input() contentManagerDropdown = [];
  @Input() crimeNo: string;
  metadataForm: FormGroup;
  openFileModal: boolean;
  fileToEdit: FileWithMetadata | null = null;
  maxFileSize = 50 * 1024 * 1024 * 1024;
  minFileSize = 100 * 1024; // 100KB
  checkGetFile: boolean;
  caseDetails: any[];
  authData: any;
  DivisionsRoles: any;
  // canEdit: boolean = false;
  // canDelete: boolean = false;
  selectedIndexes = new Set<number>();
  fileStageDropDown=[{value:"Enquiry",fileStageName:"Enquiry"},
    {value:"I/O",fileStageName:"I/O"},
    {value:"Crime",fileStageName:"Crime"}
  ]
  constructor(
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dataService: SharedService,
    private _router: Router,
    private _masterService: MasterService,
    private authenticationService: AuthService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _uploadDocumentService: UploadDocumentService
  ) {
    this.authData = this.authenticationService.getAuthData();
    this.metadataForm = this.fb.group({
      subject: ["", Validators.required],
      fileType: ["", Validators.required],
      classification: ["", Validators.required],
      hashTag: [""],
      fileStage:[""]
    });
  }

  ngOnInit() {
    this.getFilesCheck();
    this.initializeFormControls();
    this.updateViewState();
  }

  initializeFormControls() {
    if (!this?.formGroup.get("file")) {
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
        panelClass: ["success-snackbar"],
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
    this.selectedFiles = this.getfiles;
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
        panelClass: ["success-snackbar"],
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
        panelClass: ["success-snackbar"],
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

    // If file has existing metadata, populate the form
    if (file.metadata) {
      this.metadataForm.patchValue(file.metadata);
    }
    if (file) {
      this.metadataForm.patchValue(file);
    }
    if (this.checkGetFile) {
      this.metadataForm.patchValue({
        subject: this.fileToEdit.name,
      });
    }
    this.openFileModal = true;
  }

  closeFileModal(): void {
    this.openFileModal = false;
    this.fileToEdit = null;
  }

  submitMetadata(): void {
    if (this.metadataForm.valid) {
      const metadata = this.metadataForm.value;
      if (this.selectedFiles.length === 1) {
        // If only one file, always apply metadata
        this.selectedFiles[0].metadata = { ...this.selectedFiles[0].metadata, ...metadata };
        this._snackBar.open("Metadata added to file", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.openFileModal = false;
        this.selectedIndexes.clear();
        return;
      }
      let anySelected = false;
      this.selectedIndexes.forEach(index => {
        const file = this.selectedFiles[index];
        if (file) {
          file.metadata = { ...file.metadata, ...metadata };
          anySelected = true;
        }
      });
      if (anySelected) {
        this._snackBar.open("Metadata added to selected files", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.openFileModal = false;
        this.selectedIndexes.clear();
      } else {
        this._snackBar.open("Please select at least one file", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      }
    }
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (files.length > 0) {
      const newFiles = Array.from(files)
        .map((file) => this.validateFile(file as FileWithMetadata))
        .filter((file) => file.validationErrors?.length === 0);
      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      // Emit the selected files and their metadata to the parent
      this.filesWithMetadataSelected.emit({
        files: this.selectedFiles,
        metadata: this.selectedFiles.map((file) => file.metadata),
      });

      this.formGroup.patchValue({
        file: this.selectedFiles,
      });
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
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
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
    if (this.formGroup.valid && this.selectedFiles.length > 0) {
      this.loadingVisible = true;

      setTimeout(() => {
        // console.log("Files uploaded:", this.selectedFiles);
        this.loadingVisible = false;
        this.selectedFiles = [];
        this.formGroup.reset();
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
    });
  }

  viewImage(data) {
    const dialogRef = this.dialog.open(UploadedFilesComponent, {
      data: data,
    width: '850px', // or '100vw' for full width
    maxWidth: '100vw',
    height: '90vh',
    panelClass: 'custom-dialog-class'
  });
    dialogRef.afterClosed().subscribe((result) => {
      this._changeDetectorRef.detectChanges();
    });
  }

  // checkPermissions() {
  //   const userPermissions = this.authData.Permission;
  //   const roleName = this.authData.role_name;
  //   console.log("userPermissions", userPermissions);
  //   this.canEdit = userPermissions.includes("change_filedetails");
  //   this.canDelete = userPermissions.includes("delete_filedetails");
  // }

  toggleFavourite(file: any) {
    // console.log("is_favourited", file.is_favourited);
    if (file.is_favourited) {
      this.markUnFavourite(file);
    } else {
      this.markFavourite(file);
    }
  }

  markUnFavourite(data: any) {
    const divisionID = JSON.parse(sessionStorage.getItem('divisionID'))
    this._uploadDocumentService.markAsUnFavourite(data.fileId,divisionID).subscribe({
      next: (response: any) => {
        this._snackBar.open("Mark As Un Favourite successfully", "Close", {
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

  markFavourite(data: any) {
    const divisionID = JSON.parse(sessionStorage.getItem('divisionID'))
    this._uploadDocumentService.markAsFavourite(data.fileId,divisionID).subscribe({
      next: (response: any) => {
        this._snackBar.open("Mark As Favourite successfully", "Close", {
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
      this._changeDetectorRef.detectChanges();
    });
  }

  getFileTypeNameById(fileTypeId: number): string {
    const type = this.fileTypesDropDown?.find(
      (t) => t.fileTypeId === fileTypeId
    );
    return type ? type.fileTypeName : "Unknown";
  }

  getFileClassificationNameById(classificationId: number): string {
    const classification = this.fileClassificationDropDown?.find(
      (c) => c.fileClassificationId === classificationId
    );
    return classification ? classification.fileClassificationName : "Unknown";
  }

  getUserRoleName(): string | null {
    const userRole = this.authData.DivisionsRoles.find(
      (role) => role.role_name === "User"
    );
    // console.log("userRole",userRole)
    return userRole ? userRole.role_name : null;
  }

  canRequestAccess(file: any): boolean {
    // console.log("canRequestAccess",file)
    const userRole = this.authData.DivisionsRoles.find(
      (role) => role.role_name === "User"
    );
    return (
      (file.metadata?.classification_name || file.classification_name) ===
        "Confidential" &&
      !file.is_request_raised &&
      !file.is_access_request_approved &&
      userRole.role_name === "User"
    );
  }

  hasRole(...roles: string[]): boolean {
    return this.authData.DivisionsRoles.some(role =>
      roles.includes(role.role_name)
    );
  }

  isRestrictedToView(file: any): boolean {
    const classification = file.metadata?.classification_name || file.classification_name;
    const role = this.getUserRoleName();
    return classification === 'Confidential' && role === 'User' && !file.is_access_request_approved;
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
}