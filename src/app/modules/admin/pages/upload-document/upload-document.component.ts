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
import { Subject } from "rxjs";
import { InventoryVendor } from "./uploadDoc.types";
import { MatDividerModule } from "@angular/material/divider";
import { TranslocoModule } from "@ngneat/transloco";
import { RouterLink } from "@angular/router";
import { MatSelectModule } from "@angular/material/select";
import { UploadDocumentService } from "./uploadDoc.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  ],
})
export class UploadDocumentComponent implements OnInit, OnDestroy {
  uploadDocumentForm: UntypedFormGroup;
  @ViewChild("addcitizenfeedbackNgForm") addcitizenfeedbackNgForm: NgForm;
  maxFileSize = 10737418240;
  isLoading: boolean = false;
  formFieldHelpers: string[] = [""];
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  unitsDropdown: any;

  districtDropdown: any;
  stateDropdown: [];
  dragging: boolean = false;
  imgUrls: { preview: string; name: string }[] = [];
  pdfUrls: { preview: string; name: string }[] = [];
  selectedFiles: any;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar
  ) {}

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
    this.onStateChange(16);
    this.onDisctrictChange(443);
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  initForm() {
    this.uploadDocumentForm = this._formBuilder.group({
      stateIDInfo: ["", [Validators.required]],
      districtId: ["", [Validators.required]],
      unitsId: [""],
      office: ["", [Validators.required]],
      letterNo: ["", [Validators.required]],
      caseNo: ["", [Validators.required]],
      caseType: ["", [Validators.required]],
      subject: ["", [Validators.required]],
      firNo: ["", [Validators.required]],
      author: ["", [Validators.required]],
      toAddr: ["", [Validators.required]],
      caseDate: ["", [Validators.required]],
    });
  }

  /**
   * Citizen Feedback Create
   */
  saveCitizenFeedback(): void {}

  /**
   * Clear the form
   */
  clearForm(): void {
    // Reset the form
    this.addcitizenfeedbackNgForm.resetForm();
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
    this._uploadDocumentService.geDistrictByStateData(16).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.districtDropdown = response.responseData;
      },
      error: (error) => {},
    });
  }

  getUserStateDropdown() {
    this._uploadDocumentService.getState().subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.stateDropdown = response.responseData;
        this.stateDropdown.forEach((element: any) => {
          if (element.stateId == 16) {
            this.uploadDocumentForm.patchValue({
              stateIDInfo: element.stateId,
            });
            this.uploadDocumentForm.get("stateIDInfo").disable();
          }
        });
      },
      error: (error) => {},
    });
  }

  filesDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length) {
      this.selectFiles(event.dataTransfer.files);
    }
  }

  // Method to handle file selection
  selectFiles(files: FileList): void {
    this.selectedFiles = files;
    console.log("selectedFiles", this.selectedFiles);
    this.imgUrls = [];
    this.pdfUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > this.maxFileSize) {
        alert("File is too large. Please reduce the size to under 10GB.");
        continue;
      }

      // Handle image files
      if (this.isImage(file)) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imgUrls.push({
            preview: reader.result as string,
            name: file.name,
          });
          this._changeDetectorRef.markForCheck();
        };
        reader.readAsDataURL(file);
      }
      if (this.isPdf(file)) {
        this.pdfUrls.push({ preview: "assets/icons/pdf.svg", name: file.name });
      }
    }
  }

  isImage(file: File): boolean {
    const supportedTypes = ["image/jpeg", "image/png"];
    return supportedTypes.includes(file.type);
  }

  isPdf(file: File): boolean {
    return file.type === "application/pdf";
  }

  onDragEnter(): void {
    this.dragging = true;
  }

  onDragLeave(): void {
    this.dragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onStateChange(stateId: number): void {
    if (stateId) {
      this._uploadDocumentService.geDistrictByStateData(stateId).subscribe(
        (districts: any) => {
          this.districtDropdown = districts.responseData;
          this.uploadDocumentForm.get("districtId")?.setValue(443);
        },
        (error) => {
          console.error("Error fetching districts:", error);
        }
      );
    } else {
      this.districtDropdown = [];
    }
  }

  onDisctrictChange(stateId: number): void {
    this._uploadDocumentService.getUnitsByDistictIdData(stateId).subscribe({
      next: (response: any) => {
        if (response.statusCode == 200) {
          this.unitsDropdown = response.responseData;
        }
      },
      error: (error) => {},
    });
  }

  sumbitUpload() {
    let uploadMetaData = {
      stateId: this.uploadDocumentForm.value.stateIDInfo || 16,
      districtId: this.uploadDocumentForm.value.districtId,
      unitId: this.uploadDocumentForm.value.unitsId || 1159,
      Office: this.uploadDocumentForm.value.office,
      letterNo: this.uploadDocumentForm.value.letterNo,
      caseNo: this.uploadDocumentForm.value.caseNo,
      caseDate: this.uploadDocumentForm.value.caseDate,
      caseType: this.uploadDocumentForm.value.caseType,
      subject: this.uploadDocumentForm.value.subject,
      firNo: this.uploadDocumentForm.value.firNo,
      author: this.uploadDocumentForm.value.author,
      toAddr: this.uploadDocumentForm.value.toAddr,
    };

    const formData = new FormData();
    formData.append("caseDetails", JSON.stringify(uploadMetaData));
    const files = this.selectedFiles;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      formData.append("Files", file);
    }

    this._uploadDocumentService.uploadDocument(formData).subscribe({
      next: (response: any) => {
        this._snackBar.open("File Upload successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.addcitizenfeedbackNgForm.resetForm();
        this.selectedFiles = [];
        this.imgUrls = [];
        this.pdfUrls = [];
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
}
