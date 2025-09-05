import {
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormsModule,
  MaxLengthValidator,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { fuseAnimations } from "@fuse/animations";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Subject, timeout } from "rxjs";
import { InventoryVendor } from "./uploadDoc.types";
import { MatDividerModule } from "@angular/material/divider";
import { TranslocoModule } from "@ngneat/transloco";
import { Router, RouterLink } from "@angular/router";
import { MatSelectModule } from "@angular/material/select";
import { UploadDocumentService } from "./uploadDoc.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UploadFilesComponent } from "../upload-files/upload-files/upload-files.component";
import { FileWithMetadata } from "../upload-files/model/upload-files.models";
import { SharedService } from "app/shared/shared.service";
import { MasterService } from "../Master/master.service";
import { AuthService } from "app/core/auth/auth.service";
import { DraftDetailsComponent } from "./draft-details/draft-details.component";
import { MatTooltipModule } from "@angular/material/tooltip";

interface State {
  stateId: number;
  stateName: string;
}

interface District {
  districtId: number;
  districtName: string;
}

interface Unit {
  unitId: number;
  unitName: string;
}

interface CaseType {
  id: number;
  value: string;
}

interface CaseStatus {
  id: number;
  value: string;
}

@Component({
  selector: "app-upload-document",
  templateUrl: "./upload-document.component.html",
  styleUrl: "./upload-document.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
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
    MatDatepickerModule,
    UploadFilesComponent,
    DraftDetailsComponent,
    MatTooltipModule
  ],
})
export class UploadDocumentComponent implements OnInit, OnDestroy {
  selectedFiles: FileWithMetadata[] = []; // Store selected files
  selectedMetadata: any[] = []; // Store metadata
  uploadDocumentForm: UntypedFormGroup;
  @ViewChild("addcitizenfeedbackNgForm") addcitizenfeedbackNgForm: NgForm;
  maxFileSize = 10737418240;
  crimeNo: string = "";
  isLoading: boolean = false;
  formFieldHelpers: string[] = [""];
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  unitsDropdown: Unit[] = [];
  filteredUnits: Unit[] = [];
  filteredStates: State[] = [];
  filteredDistricts: District[] = [];
  filteredCaseTypes: CaseType[] = [];
  filteredCaseStatus: CaseStatus[] = [];
  private searchTimeout: any;
  private stateSearchTimeout: any;
  private districtSearchTimeout: any;
  private caseTypeSearchTimeout: any;
  private caseStatusSearchTimeout: any;

  districtDropdown: District[] = [];
  stateDropdown: State[] = [];
  caseStatusDropdown: CaseStatus[] = [];
  caseTypeDropDown: CaseType[] = [];
  yearDropDown: { yearId: number; yearName: number }[] = [];
  filteredYears: { yearId: number; yearName: number }[] = [];
  private yearSearchTimeout: any;
  authData: any;
  ClassificationTypeDropDown: any[] = [];
  FileTypeDropDown: any[] = [];
  DocumentTypeDropDown: any[] = [];
  selectedFCaseType: any;
  caseTypeFinalId: number;
  masterData: any;
  isSubmitting: boolean = false;
  isSaveDraft: boolean = false;
  checkFileSatus: boolean;
  finalFIRValue: any;
  patchDetailsfiles: any[] = [];
  dfaftfiles: any[] = [];
  caseMetaData: any;
  draftInfo: any;
  files: any[] = [];
  isPatchSearchPage: boolean;
  isDraft: boolean = false;
  maxDate: Date = new Date();

  // selectedFiles: any;
  /**
   * Ensures all files have the correct fileName and subject with the current caseNo.
   * Updates both new and old files in selectedFiles.
   */
  private getBaseFileName(file: any): string {
    if (file.originalFileName && file.originalFileName !== 'undefined') return file.originalFileName;
    if (file.name && file.name !== 'undefined') return file.name;
    if (file.fileName && file.fileName !== 'undefined') return file.fileName;
    if (file.subject && file.subject !== 'undefined') return file.subject;
    return 'UnknownFile';
  }

  private updateFileNamesWithCaseNo(): void {
    const caseNo = this.crimeNo || this.uploadDocumentForm.value.caseNo || 'undefined';
    this.selectedFiles.forEach((file: any) => {
      const baseName = this.getBaseFileName(file);

      // Update subject if needed
      if (!file.subject || !file.subject.startsWith(caseNo)) {
        file.subject = `${caseNo}_${baseName}`;
      }

      // Update metadata.subject if needed
      if (file.metadata) {
        if (!file.metadata.subject || !file.metadata.subject.startsWith(caseNo)) {
          file.metadata.subject = `${caseNo}_${baseName}`;
        }
      } else {
        file.metadata = { subject: `${caseNo}_${baseName}` };
      }

      // Update fileName if needed
      if (!file.fileName || !file.fileName.startsWith(caseNo)) {
        file.fileName = `${caseNo}_${baseName}`;
      }
    });
  }
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar,
    private dataService: SharedService,
    private _router: Router,
    private _masterService: MasterService,
    private authenticationService: AuthService,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.authData = this.authenticationService.getAuthData();
    this.dataService.setFileBoolean(true);
    for (let year = 2025; year >= 1990; year--) {
      this.yearDropDown.push({ yearId: year, yearName: year });
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.initForm();
    this.getUserDistrictDropdown();
    this.getUserStateDropdown();
    this.getMasterDropDown();
    
    // Initialize filtered arrays
    this.filteredStates = this.stateDropdown || [];
    this.filteredDistricts = this.districtDropdown || [];
    this.filteredCaseTypes = this.caseTypeDropDown || [];
    this.filteredCaseStatus = this.caseStatusDropdown || [];
    this.filteredYears = [...this.yearDropDown];
    
    // Load data immediately - the methods will handle whether there's data to patch
    this.getDataSearchForPatch();
    this.getDraftDataPatch();
    
    // Initialize default values only for fresh uploads (not when patching)
    if (!this.isPatchSearchPage && !this.isDraft) {
      this.onStateChange(16);
      this.onDisctrictChange(443);
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Clear all data when component is destroyed
    this.clearAllData();
    
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  initForm() {
    this.uploadDocumentForm = this._formBuilder.group({
      stateIDInfo: ["", [Validators.required]],
      districtId: ["", [Validators.required]],
      unitsId: ["", [Validators.required]],
      office: ["", [Validators.required]],
      letterNo: ["", [Validators.required]],
      caseNo: ["", [Validators.required]],
      caseType: ["", [Validators.required]],
      firNo: ["", [Validators.required]],
      author: ["", [Validators.required]],
      toAddr: ["", [Validators.required]],
      caseDate: [""],
      statusId: ["", [Validators.required]],
      yearId: ["", [Validators.required]],
    });
  }

  /**
   * Clear the form
   */
  clearForm(): void {
    // Reset the form
    this.addcitizenfeedbackNgForm.resetForm();
  }

  onFilesWithMetadataSelected(data: {
    files: FileWithMetadata[];
    metadata: any[];
  }) {
    this.selectedFiles = data.files;
    this.selectedMetadata = data.metadata;
    console.log("  this.selectedFiles ", this.selectedFiles);
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

  SelectDataCase(value) {}

  filterDropDownData(event) {}

  getUserDistrictDropdown() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this._uploadDocumentService
      .geDistrictByStateData(16, divisionId)
      .subscribe({
        next: (response: any) => {
          console.log("response", response);
          this.districtDropdown = response.responseData;
        },
        error: (error) => {},
      });
  }

  getUserStateDropdown() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));

    this._uploadDocumentService.getState(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.stateDropdown = response.responseData as State[];
        this.filteredStates = [...this.stateDropdown];
        this.stateDropdown.forEach((element: State) => {
          if (element.stateId == 16) {
            this.uploadDocumentForm.patchValue({
              stateIDInfo: element.stateId,
            });
          }
        });
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {},
    });
  }

  onStateChange(stateId: number): void {
    this.generateCrimeNo();
    if (stateId) {
      const divisionId = Number(sessionStorage.getItem("divisionID"));
      this._uploadDocumentService
        .geDistrictByStateData(stateId, divisionId)
        .subscribe(
          (districts: any) => {
            this.districtDropdown = districts.responseData as District[];
            this.filteredDistricts = [...this.districtDropdown];
            
            // Only set default district 443 for fresh uploads, not when patching from search
            if (!this.isPatchSearchPage) {
              this.uploadDocumentForm.get("districtId")?.setValue(443);
            }
            
            this._changeDetectorRef.detectChanges();
          },
          (error) => {
            console.error("Error fetching districts:", error);
          }
        );
    } else {
      this.districtDropdown = [];
      this.filteredDistricts = [];
    }
  }

  onDisctrictChange(stateId: number): void {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this._uploadDocumentService
      .getUnitsByDistictIdData(stateId, divisionId)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode == 200) {
            this.unitsDropdown = response.responseData;
            this.filteredUnits = [...this.unitsDropdown];
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          this.unitsDropdown = [];
          this.filteredUnits = [];
          this._changeDetectorRef.detectChanges();
        },
      });
  }
   convertUtcToIst(utcTime: string | null): string | null {
    if (!utcTime) {
      return null;
    }
    const date = new Date(utcTime);
    if (isNaN(date.getTime())) {
      return null;
    }
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString();
  }

  /**
   * Convert date string to Date object for Angular Material datepicker
   */
  convertToDatePickerFormat(dateString: string | null): Date | null {
    if (!dateString) {
      return null;
    }
    
    try {
      // Handle different date formats
      let date: Date;
      
      // If it's already a valid date string with time
      if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO format or UTC format
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        // MM/DD/YYYY or DD/MM/YYYY format
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Handle DD-MM-YYYY format (common in Indian date format)
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          // Check if it's DD-MM-YYYY format (day > 12 indicates DD-MM-YYYY)
          if (day > 12 && month <= 12) {
            // DD-MM-YYYY format
            date = new Date(year, month - 1, day); // month is 0-indexed
            console.log(`Parsed DD-MM-YYYY: ${dateString} -> ${date.toDateString()}`);
          } else if (month > 12 && day <= 12) {
            // MM-DD-YYYY format
            date = new Date(year, day - 1, month); // day and month swapped
            console.log(`Parsed MM-DD-YYYY: ${dateString} -> ${date.toDateString()}`);
          } else if (day <= 12 && month <= 12) {
            // Ambiguous case - prioritize DD-MM-YYYY for Indian date format
            // Check if the first part (day) is more likely to be a day
            if (day <= 31 && month <= 12) {
              // Assume DD-MM-YYYY format (Indian standard)
              date = new Date(year, month - 1, day);
              console.log(`Parsed DD-MM-YYYY (ambiguous): ${dateString} -> ${date.toDateString()}`);
            } else {
              // Fallback to standard parsing
              date = new Date(dateString);
              console.log(`Standard parsing (ambiguous): ${dateString} -> ${date.toDateString()}`);
            }
          } else {
            // Try standard parsing (assumes YYYY-MM-DD or MM-DD-YYYY)
            date = new Date(dateString);
            console.log(`Standard parsing: ${dateString} -> ${date.toDateString()}`);
          }
        } else {
          // Try standard parsing
          date = new Date(dateString);
        }
      } else {
        // Try parsing as is
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Error converting date:', dateString, error);
      return null;
    }
  }

  saveDraftUpload() {
    this.updateFileNamesWithCaseNo();
    if (this.isSaveDraft) return;
    this.isSaveDraft = true;
    this._changeDetectorRef.detectChanges();
    this.crimeNo = this.uploadDocumentForm.value.caseNo;
    const caseDateValue = this.uploadDocumentForm.value.caseDate;
    const finalCaseDate = this.convertUtcToIst(caseDateValue) || null;
    let uploadMetaData: any = {
      CaseInfoDetailsId: this.draftInfo?.CaseInfoDetailsId ?? 0,
      stateId: this.uploadDocumentForm.value.stateIDInfo || 16,
      districtId: this.uploadDocumentForm.value.districtId,
      unitId: this.uploadDocumentForm.value.unitsId,
      Office: this.uploadDocumentForm.value.office,
      letterNo: this.uploadDocumentForm.value.letterNo,
      caseNo: this.uploadDocumentForm.value.caseNo,
      caseType: this.uploadDocumentForm.value.caseType,
      firNo: this.uploadDocumentForm.value.firNo,
      author: this.uploadDocumentForm.value.author,
      toAddr: this.uploadDocumentForm.value.toAddr,
      caseStatus: this.uploadDocumentForm.value.statusId,
      year: this.uploadDocumentForm.value.yearId,
    };
    if (caseDateValue) {
      uploadMetaData.caseDate = finalCaseDate;
    }
    const formData = new FormData();
    formData.append("division_id", sessionStorage.getItem("divisionID"));
    formData.append("caseDetails", JSON.stringify(uploadMetaData));
    console.log(" this.selectedFiles", this.selectedFiles);
    const fileDetailsArray = this.selectedFiles.map((file: any) => {
      const metadata = file.metadata || file;

      return {
        fileId: file.fileId || null,
        hashTag: metadata.hashTag
          ? metadata.hashTag
              .split(",")
              .map((tag) => tag.trim())
              .join(",")
          : "",
        subject: metadata.subject || "",
        classification: metadata.classification || "",
        fileType: metadata.fileType || "",
        documentType: metadata.documentType || "",
      };
    });
    formData.append("is_draft", "true");
    formData.append("fileDetails", JSON.stringify(fileDetailsArray));
    formData.append("dept_id", sessionStorage.getItem("departmentID"));
    this.selectedFiles.forEach((file) => {
      const baseName = this.getBaseFileName(file);
      const caseNo = this.uploadDocumentForm.value.caseNo;
      let newFileName = baseName;
      if (!baseName.startsWith(caseNo + "_")) {
        newFileName = caseNo + "_" + baseName;
      }
      const newFile = new File([file], newFileName, { type: file.type });
      formData.append("Files", newFile);
    });

    this._uploadDocumentService.saveDraftInfo(formData).subscribe({
      next: (response: any) => {
        this._snackBar.open("Draft saved successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.addcitizenfeedbackNgForm.resetForm();
        // this._router.navigateByUrl("search-document");
        this.resetSelectedFiles();
        this.selectedFiles = [];
        this._uploadDocumentService.clearDraft();
        this.getDraftDataPatch()
        this._changeDetectorRef.detectChanges();
        this.isDraft =false;
      },

      error: (error) => {
        this._snackBar.open(error.message || "Error creating user", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
      complete: () => {
        this.isSaveDraft = false;
        this._changeDetectorRef.detectChanges();
      },
    });
  }

  sumbitUpload() {
    this.updateFileNamesWithCaseNo();
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this._changeDetectorRef.detectChanges();
    const caseDateValue = this.uploadDocumentForm.value.caseDate;
    const finalCaseDate = this.convertUtcToIst(caseDateValue) || null;
    let uploadMetaData: any = {
      CaseInfoDetailsId: this.draftInfo?.CaseInfoDetailsId ?? 0,
      stateId: this.uploadDocumentForm.value.stateIDInfo || 16,
      districtId: this.uploadDocumentForm.value.districtId,
      unitId: this.uploadDocumentForm.value.unitsId,
      Office: this.uploadDocumentForm.value.office,
      letterNo: this.uploadDocumentForm.value.letterNo,
      caseNo: this.uploadDocumentForm.value.caseNo,
      caseType: this.uploadDocumentForm.value.caseType,
      firNo: this.uploadDocumentForm.value.firNo,
      author: this.uploadDocumentForm.value.author,
      toAddr: this.uploadDocumentForm.value.toAddr,
      caseStatus: this.uploadDocumentForm.value.statusId,
      year: this.uploadDocumentForm.value.yearId,
    };
    if (caseDateValue) {
      uploadMetaData.caseDate = finalCaseDate;
    }
    const formData = new FormData();
    formData.append("caseDetails", JSON.stringify(uploadMetaData));
    const fileDetailsArray = this.selectedFiles.map((file: any) => {
      const metadata = file.metadata || file;

      return {
        fileId: file.fileId || null,
        hashTag: metadata.hashTag
          ? metadata.hashTag
              .split(",")
              .map((tag) => tag.trim())
              .join(",")
          : "",
        subject: metadata.subject || "",
        classification: metadata.classification || "",
        fileType: metadata.fileType || "",
        documentType: metadata.documentType || "",
      };
    });

    formData.append("fileDetails", JSON.stringify(fileDetailsArray));
    formData.append("division_id", sessionStorage.getItem("divisionID"));
    formData.append("dept_id", sessionStorage.getItem("departmentID"));
    this.selectedFiles.forEach((file) => {
      const baseName = this.getBaseFileName(file);
      const caseNo = this.uploadDocumentForm.value.caseNo;
      let newFileName = baseName;
      if (!baseName.startsWith(caseNo + "_")) {
        newFileName = caseNo + "_" + baseName;
      }
      const newFile = new File([file], newFileName, { type: file.type });
      formData.append("Files", newFile);
    });

    this._uploadDocumentService.uploadDocument(formData).subscribe({
      next: (response: any) => {
        this._snackBar.open("Case Details saved successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.addcitizenfeedbackNgForm.resetForm();
        // this._router.navigateByUrl("search-document");
        this.resetSelectedFiles();
        this.selectedFiles = [];
        this._uploadDocumentService.clearDraft();
        this.isDraft =false;
        this.checkFileSatus = true;
        setTimeout(() => { this.checkFileSatus = false; }, 100);
      },
      error: (error) => {
        this._snackBar.open(error.message || "Error creating user", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
      complete: () => {
        this.isSubmitting = false;
        this._changeDetectorRef.detectChanges();
      },
    });
  }

  updateUpload() {
    this.updateFileNamesWithCaseNo();
    if (this.isSubmitting) return;
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this._snackBar.open(
        "Upload one or more documents before updating the case",
        "Close",
        {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["warning-snackbar"],
        }
      );
      return;
    }
    this.isSubmitting = true;
    this._changeDetectorRef.detectChanges();
    const caseDateValue = this.uploadDocumentForm.value.caseDate;
    const finalCaseDate = this.convertUtcToIst(caseDateValue) || null;
    let uploadMetaData: any = {
      stateId: this.uploadDocumentForm.value.stateIDInfo || 16,
      districtId: this.uploadDocumentForm.value.districtId,
      unitId: this.uploadDocumentForm.value.unitsId,
      Office: this.uploadDocumentForm.value.office,
      letterNo: this.uploadDocumentForm.value.letterNo,
      caseNo: this.uploadDocumentForm.value.caseNo,
      caseType: this.uploadDocumentForm.value.caseType,
      firNo: this.uploadDocumentForm.value.firNo,
      author: this.uploadDocumentForm.value.author,
      toAddr: this.uploadDocumentForm.value.toAddr,
      caseStatus: this.uploadDocumentForm.value.statusId,
      year: this.uploadDocumentForm.value.yearId,
    };
    if (caseDateValue) {
      uploadMetaData.caseDate = finalCaseDate;
    }

    const formData = new FormData();
    formData.append("caseDetails", JSON.stringify(uploadMetaData));

    const fileDetailsArray = this.selectedFiles.map((file: any) => {
      const metadata = file.metadata || file;

      return {
        fileId: file.fileId || null,
        hashTag: metadata.hashTag
          ? metadata.hashTag
              .split(",")
              .map((tag) => tag.trim())
              .join(",")
          : "",
        subject: metadata.subject || "",
        classification: metadata.classification || "",
        fileType: metadata.fileType || "",
        documentType: metadata.documentType || "",
      };
    });

    formData.append("fileDetails", JSON.stringify(fileDetailsArray));
    formData.append("division_id", sessionStorage.getItem("divisionID"));
    formData.append("dept_id", sessionStorage.getItem("departmentID"));

    this.selectedFiles.forEach((file) => {
      const baseName = this.getBaseFileName(file);
      const caseNo = this.uploadDocumentForm.value.caseNo;
      let newFileName = baseName;
      if (!baseName.startsWith(caseNo + "_")) {
        newFileName = caseNo + "_" + baseName;
      }
      const newFile = new File([file], newFileName, { type: file.type });
      formData.append("Files", newFile);
    });

    this._uploadDocumentService
      .updateCaseDetailsByIdData(this.caseMetaData.CaseInfoDetailsId, formData)
      .subscribe({
        next: (response: any) => {
          this._snackBar.open("Case Details Updated successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
          });
          this.addcitizenfeedbackNgForm.resetForm();
          this._router.navigateByUrl("search-document");
          this.resetSelectedFiles();
          this.selectedFiles = [];
          this._uploadDocumentService.clearDraft();
          this.isDraft =false;

        },
        error: (error) => {
          this._snackBar.open(error.message || "Error updating case", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
        },
        complete: () => {
          this.isSubmitting = false;
          this._changeDetectorRef.detectChanges();
        },
      });
  }

  resetSelectedFiles() {
    this.checkFileSatus = true;
    const defaultStateId = 16;
    this.uploadDocumentForm.patchValue({
      stateIDInfo: defaultStateId,
    });
    this.uploadDocumentForm.get("districtId")?.setValue(443);
    this.selectedFiles = [];
    this.selectedMetadata = [];
  }

  generateCrimeNo(): void {
    const districtId = this.uploadDocumentForm.get("districtId")?.value;
    const unitId = this.uploadDocumentForm.get("unitsId")?.value;
    const yearId = this.uploadDocumentForm.get("yearId")?.value;
    // const firNo = this.uploadDocumentForm.get("firNo")?.value;
    if (districtId && unitId != null && yearId && this.finalFIRValue) {
      const paddedUnitId = String(unitId).padStart(4, "0");
      this.crimeNo = `${this.caseTypeFinalId}${districtId}${paddedUnitId}${yearId}${this.finalFIRValue}`;
      this.uploadDocumentForm.get("caseNo")?.setValue(this.crimeNo);
    }
  }

  onCaseTypeChange(event: any) {
    this.selectedFCaseType = event.value;
    if (this.selectedFCaseType == 1) {
      this.caseTypeFinalId = 10;
    } else if (this.selectedFCaseType == 2) {
      this.caseTypeFinalId = 20;
    }
    this.generateCrimeNo();
  }

  onDistrictChange(districtId: number): void {
    this.generateCrimeNo();
  }

  onUnitChange(unitId: number): void {
    this.generateCrimeNo();
  }

  onYearChange(yearId: number): void {
    this.generateCrimeNo();
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow only digits (0–9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  // get canSubmit(): boolean {
  //   if (this.isSubmitting) return false;
  //   if (this.uploadDocumentForm.invalid) return false;
  //   console.log("this.selectedFiles",this.selectedFiles)
  //   if (!this.selectedFiles || this.selectedFiles.length === 0) return false;
  //   for (const file of this.selectedFiles) {
  //     const meta = file.metadata;
  //     console.log("meta",meta)
  //     if (
  //       !meta ||
  //       !meta.subject ||
  //       !meta.fileType ||
  //       !meta.classification ||
  //       !meta.documentType
  //     ) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  get canSubmit(): boolean {
    if (this.isSubmitting) return false;

    if (this.uploadDocumentForm.invalid) return false;

    if (!Array.isArray(this.selectedFiles) || this.selectedFiles.length === 0)
      return false;

    for (const file of this.selectedFiles) {
      const meta = file.metadata ?? file; // Use metadata if available, otherwise fall back to file

      if (
        !meta.subject ||
        !meta.fileType ||
        !meta.classification ||
        !meta.documentType
      ) {
        return false;
      }
    }

    return true;
  }

  get canisSaveDraft(): boolean {
    if (this.isSaveDraft) return false;
    if (this.uploadDocumentForm.invalid) return false;
    // if (!this.selectedFiles || this.selectedFiles.length === 0) return false;
    for (const file of this.selectedFiles) {
      const meta = file.metadata;
      // if (
      //   !meta ||
      //   !meta.subject ||
      //   !meta.fileType ||
      //   !meta.classification ||
      //   !meta.documentType
      // ) {
      //   return false;
      // }
    }
    return true;
  }

  getMasterDropDown() {
    this._uploadDocumentService.getMasterDropDownData().subscribe({
      next: (response: any) => {
        this.masterData = response;
        this.caseTypeDropDown = response.CaseType as CaseType[];
        this.filteredCaseTypes = [...this.caseTypeDropDown];
        this.ClassificationTypeDropDown = response.ClassificationType;
        this.FileTypeDropDown = response.FileType;
        this.DocumentTypeDropDown = response.Category_4;
        this.caseStatusDropdown = response.CaseStatus as CaseStatus[];
        this.filteredCaseStatus = [...this.caseStatusDropdown];
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {},
    });
  }

  filterStates(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.stateSearchTimeout) {
      clearTimeout(this.stateSearchTimeout);
    }

    this.stateSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredStates = this.stateDropdown;
      } else {
        this.filteredStates = this.stateDropdown.filter((state) => {
          const stateName = (state.stateName || "").toLowerCase();
          return stateName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterDistricts(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.districtSearchTimeout) {
      clearTimeout(this.districtSearchTimeout);
    }

    this.districtSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDistricts = this.districtDropdown;
      } else {
        this.filteredDistricts = this.districtDropdown.filter((district) => {
          const districtName = (district.districtName || "").toLowerCase();
          return districtName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterUnits(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredUnits = this.unitsDropdown;
      } else {
        this.filteredUnits = this.unitsDropdown.filter((unit) => {
          const unitName = (unit.unitName || "").toLowerCase();
          return unitName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterCaseTypes(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.caseTypeSearchTimeout) {
      clearTimeout(this.caseTypeSearchTimeout);
    }

    this.caseTypeSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredCaseTypes = this.caseTypeDropDown;
      } else {
        this.filteredCaseTypes = this.caseTypeDropDown.filter((caseType) => {
          const caseTypeName = (caseType.value || "").toLowerCase();
          return caseTypeName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterCaseStatus(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.caseStatusSearchTimeout) {
      clearTimeout(this.caseStatusSearchTimeout);
    }

    this.caseStatusSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredCaseStatus = this.caseStatusDropdown;
      } else {
        this.filteredCaseStatus = this.caseStatusDropdown.filter((status) => {
          const statusName = (status.value || "").toLowerCase();
          return statusName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterYears(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.yearSearchTimeout) {
      clearTimeout(this.yearSearchTimeout);
    }

    this.yearSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredYears = [...this.yearDropDown];
      } else {
        this.filteredYears = this.yearDropDown.filter((year) => {
          const yearName = year.yearName.toString().toLowerCase();
          return yearName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  generateFIRNo(): void {
    const firControl = this.uploadDocumentForm.get("firNo");
    if (firControl) {
      let value = firControl.value;
      value = value?.replace(/\D/g, "");
      if (value && value.length < 4) {
        value = value.padStart(4, "0");
        firControl.setValue(value, { emitEvent: false });
      }
      this.finalFIRValue = value;
    }
    this.generateCrimeNo();
  }

  getDataSearchForPatch() {
    const state = this._uploadDocumentService.getStateData();
    this.files = state.files;
    this.caseMetaData = state.caseData;
    this.isPatchSearchPage = state.isPatch;
    if (this.files) {
      this.patchDetailsfiles = this.files;
    }
    if (this.caseMetaData) {
      this.dataPatch(this.caseMetaData);
    }
    // Clear state after loading
    this._uploadDocumentService.clearState();
  }

  getDraftDataPatch() {
    const state = this._uploadDocumentService.getDraftData();
    this.draftInfo = state.draftInfo;
    console.log("Draft data received:", this.draftInfo);
    
    if (this.draftInfo) {
      // Set isDraft flag before patching
      this.isDraft = true;
      console.log("isDraft set to true");
      
      // Patch the draft data
      this.dataPatchDraft(this.draftInfo);
      
      // Handle draft files if available
      if (this.draftInfo?.file_details) {
        this.dfaftfiles = this.draftInfo?.file_details;
        console.log("Draft files loaded:", this.dfaftfiles);
      }
    } else {
      this.isDraft = false;
      console.log("No draft data found, isDraft set to false");
    }
    
    // Clear state after loading
    this._uploadDocumentService.clearDraft();
  }

  dataPatch(data) {
    if (data && this.isPatchSearchPage) {
      console.log("data",data)
      this.crimeNo = data.caseNo;
      
      // Ensure proper field mapping with fallbacks
      const stateId = data.stateId || data.stateID || data.stateIdInfo;
      const districtId = data.districtId || data.districtID;
      const unitId = data.unitId || data.unitID || data.unitsId;
      const office = data.Office || data.office;
      const caseType = data.caseType || data.caseTypeId;
      const caseStatus = data.caseStatus || data.statusId;
      const year = data.year || data.yearId;
      
      // Convert caseDate to proper format for datepicker
      const formattedCaseDate = this.convertToDatePickerFormat(data.caseDate);
      console.log('Original caseDate:', data.caseDate, 'Formatted caseDate:', formattedCaseDate);
      
      // First patch the state and trigger district loading
      this.uploadDocumentForm.patchValue({
        stateIDInfo: stateId,
        office: office,
        caseDate: formattedCaseDate,
        caseNo: data.caseNo,
        firNo: data.firNo,
        letterNo: data.letterNo,
        author: data.author,
        toAddr: data.toAddr,
      });
      
      // Load districts for the selected state
      if (stateId) {
        console.log('Loading districts for stateId:', stateId);
        this.onStateChange(stateId);
        
        // Wait for districts to load, then patch district and load units
        setTimeout(() => {
          console.log('Patching districtId:', districtId, 'Available districts:', this.districtDropdown);
          this.uploadDocumentForm.patchValue({
            districtId: districtId,
          });
          
          // Load units for the selected district
          if (districtId) {
            console.log('Loading units for districtId:', districtId);
            this.onDisctrictChange(districtId);
            
            // Wait for units to load, then patch unit
            setTimeout(() => {
              console.log('Patching unitId:', unitId, 'Available units:', this.unitsDropdown);
              this.uploadDocumentForm.patchValue({
                unitsId: unitId,
                caseType: Number(caseType),
                statusId: caseStatus,
                yearId: year,
              });
              
              this.uploadDocumentForm.disable();
              this._changeDetectorRef.detectChanges();
            }, 1000);
          } else {
            this.uploadDocumentForm.patchValue({
              caseType: Number(caseType),
              statusId: caseStatus,
              yearId: year,
            });
            this.uploadDocumentForm.disable();
            this._changeDetectorRef.detectChanges();
          }
        }, 1000);
      } else {
        // If no state, just patch the other values
        this.uploadDocumentForm.patchValue({
          districtId: districtId,
          unitsId: unitId,
          caseType: Number(caseType),
          statusId: caseStatus,
          yearId: year,
        });
        this.uploadDocumentForm.disable();
        this._changeDetectorRef.detectChanges();
      }
      
      this._uploadDocumentService.clearState();
    }
  }

  dataPatchDraft(data) {
    if (data && this.isDraft) {
      console.log('Patching draft data:', data);
      const uploadDataPach = data;
      
      // Ensure proper field mapping with fallbacks
      const stateId = uploadDataPach.stateId || uploadDataPach.stateID || uploadDataPach.stateIdInfo;
      const districtId = uploadDataPach.districtId || uploadDataPach.districtID;
      const unitId = uploadDataPach.unitId || uploadDataPach.unitID || uploadDataPach.unitsId;
      const office = uploadDataPach.Office || uploadDataPach.office;
      const caseType = uploadDataPach.caseType || uploadDataPach.caseTypeId;
      const caseStatus = uploadDataPach.caseStatus || uploadDataPach.statusId;
      const year = uploadDataPach.year || uploadDataPach.yearId;
      
      console.log('Draft field mapping:', {
        stateId, districtId, unitId, office, caseType, caseStatus, year
      });
      
      // Convert caseDate to proper format for datepicker
      const formattedCaseDate = this.convertToDatePickerFormat(uploadDataPach.caseDate);
      console.log('Draft - Original caseDate:', uploadDataPach.caseDate, 'Formatted caseDate:', formattedCaseDate);
      
      // First patch the state and trigger district loading
      this.uploadDocumentForm.patchValue({
        stateIDInfo: stateId,
        office: office,
        caseDate: formattedCaseDate,
        caseNo: uploadDataPach.caseNo,
        firNo: uploadDataPach.firNo,
        letterNo: uploadDataPach.letterNo,
        author: uploadDataPach.author,
        toAddr: uploadDataPach.toAddr,
      });
      
      // Load districts for the selected state
      if (stateId) {
        console.log('Draft - Loading districts for stateId:', stateId);
        this.onStateChange(stateId);
        
        // Wait for districts to load, then patch district and load units
        setTimeout(() => {
          console.log('Draft - Patching districtId:', districtId, 'Available districts:', this.districtDropdown);
          this.uploadDocumentForm.patchValue({
            districtId: districtId,
          });
          
          // Load units for the selected district
          if (districtId) {
            console.log('Draft - Loading units for districtId:', districtId);
            this.onDisctrictChange(districtId);
            
            // Wait for units to load, then patch unit
            setTimeout(() => {
              console.log('Draft - Patching unitId:', unitId, 'Available units:', this.unitsDropdown);
              this.uploadDocumentForm.patchValue({
                unitsId: unitId,
                caseType: Number(caseType),
                statusId: caseStatus,
                yearId: year,
              });
              
              this._changeDetectorRef.detectChanges();
            }, 1000);
          } else {
            this.uploadDocumentForm.patchValue({
              caseType: Number(caseType),
              statusId: caseStatus,
              yearId: year,
            });
            this._changeDetectorRef.detectChanges();
          }
        }, 1000);
      } else {
        // If no state, just patch the other values
        this.uploadDocumentForm.patchValue({
          districtId: districtId,
          unitsId: unitId,
          caseType: Number(caseType),
          statusId: caseStatus,
          yearId: year,
        });
        this._changeDetectorRef.detectChanges();
      }
    }
  }

  viewDrafts() {
    this._router.navigateByUrl("upload-document/draft-details");
  }

  getFileSubject(file: FileWithMetadata): string {
    const caseNo = this.crimeNo || 'undefined';
    const fileName = file.name || file.fileName || 'UnknownFile';
    const base = (!file.subject || (this.selectedFiles.length > 0 && file.subject === this.selectedFiles[0].subject) || file.subject === undefined)
      ? fileName
      : file.subject;

    // If base already starts with caseNo, don't prepend
    if (base.startsWith(caseNo)) {
      return base;
    }
    return `${caseNo}_${base}`;
  }

  /**
   * Clear existing files from previous page
   */
  clearExistingFiles(): void {
    // Show confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Clear Existing Files',
      message: `Are you sure you want to clear all ${this.patchDetailsfiles.length} existing files? This action cannot be undone.`,
      actions: {
        confirm: {
          label: 'Clear Files',
          color: 'warn'
        },
        cancel: {
          label: 'Cancel'
        }
      }
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._snackBar.open('Clearing existing files...', 'Close', {
          duration: 2000,
          horizontalPosition: "right",
          verticalPosition: "top",
        });
        
        this.patchDetailsfiles = [];
        this.files = [];
        this.selectedFiles = [];
        this.selectedMetadata = [];
        
        // Clear the state service
        this._uploadDocumentService.clearState();
        
        this._snackBar.open('Existing files cleared successfully', 'Close', {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * Redirect back to get-doc page
   */
  redirectToGetDoc(): void {
    // Show confirmation dialog before redirecting
    const confirmation = this._fuseConfirmationService.open({
      title: 'Navigate Back',
      message: 'You will be redirected back to the document view page. Any unsaved changes will be lost. Do you want to continue?',
      actions: {
        confirm: {
          label: 'Continue',
          color: 'primary'
        },
        cancel: {
          label: 'Cancel'
        }
      }
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        // Clear current state before redirecting
        this.clearAllData();
        
        // Navigate back to get-doc page
        this._router.navigateByUrl('/search-document/get-doc');
      }
    });
  }

  /**
   * Clear all data when navigating away
   */
  clearAllData(): void {
    this.patchDetailsfiles = [];
    this.files = [];
    this.selectedFiles = [];
    this.selectedMetadata = [];
    this.dfaftfiles = [];
    this.draftInfo = null;
    this.caseMetaData = null;
    this.isPatchSearchPage = false;
    this.isDraft = false;
    
    // Clear form
    if (this.uploadDocumentForm) {
      this.uploadDocumentForm.reset();
    }
    
    // Clear services
    this._uploadDocumentService.clearState();
    this._uploadDocumentService.clearDraft();
    
    this._changeDetectorRef.detectChanges();
  }

}
