import {
  CommonModule,
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
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { MatDividerModule } from "@angular/material/divider";
import { TranslocoModule } from "@ngneat/transloco";
import { Router, RouterLink } from "@angular/router";
import { InventoryVendor } from "../upload-document/uploadDoc.types";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SearchDocService } from "./searchDoc.service";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { UploadDocumentService } from "../upload-document/uploadDoc.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadFilesComponent } from "../upload-files/upload-files/upload-files.component";
import { SharedService } from "app/shared/shared.service";
import { join } from "lodash";

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

interface FileType {
  id: number;
  value: string;
}

interface DocumentType {
  id: number;
  value: string;
}

interface CaseStatus {
  id: number;
  value: string;
}

@Component({
  selector: "app-search-document",
  templateUrl: "./search-document.component.html",
  styleUrl: "./search-document.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  standalone: true,
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    UploadFilesComponent,
    CommonModule,
  ],
})
export class SearchDocumentComponent implements OnInit, OnDestroy {
  searchDocumentForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  citizenInfoDropdown = [
    {
      id: 0,
      value: "test1",
    },
    {
      id: 1,
      value: "test2",
    },
  ];
  stateDropdown: State[] = [];
  districtDropdown: District[] = [];
  unitsDropdown: Unit[] = [];
  filteredStates: State[] = [];
  filteredDistricts: District[] = [];
  filteredUnits: Unit[] = [];
  filteredCaseTypes: CaseType[] = [];
  filteredFileTypes: FileType[] = [];
  filteredDocumentTypes: DocumentType[] = [];
  filteredFileExtensions: FileType[] = [];
  filteredCaseStatus: any[];
  private searchTimeout: any;
  private stateSearchTimeout: any;
  private districtSearchTimeout: any;
  private caseTypeSearchTimeout: any;
  private fileTypeSearchTimeout: any;
  private documentTypeSearchTimeout: any;
  private fileExtensionSearchTimeout: any;
  private caseStatusSearchTimeout: any;
  filteredYears: { yearId: number; yearName: number }[] = [];
  filteredToYears: { yearId: number; yearName: number }[] = [];
  private yearSearchTimeout: any;
  private yearToSearchTimeout: any;
  dataShow = [
    {
      id: 1,
      name: "test1",
    },
    {
      id: 2,
      name: "test2",
    },
  ];
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  columns: any[] = [
    {
      labelen: "Police Station",
      labelhi: "Police Station",
      property: "unitName",
    },
    { labelen: "Name", labelhi: "Last Name", property: "firNo" },
    { labelen: "Case No", labelhi: "Case No", property: "caseNo" },
    { labelen: "Case Type", labelhi: "Case Type", property: "caseTypeName" },

    { labelen: "Case Date", labelhi: "Case Date", property: "caseDate" },
    { labelen: "Letter No", labelhi: "Letter No", property: "letterNo" },
    {
      labelen: "Action",
      labelhi: "Action",
      property: "action",
      isAction: true,
    },
  ];

  displayedColumns: string[] = [
    // "stateName",
    // "districtName",
    "unitName",
    "caseTypeName",
    "firNo",
    "caseNo",
    // "caseTypeName",
    "action",
  ];

  caseTypeDropDown: CaseType[] = [];
  ClassificationTypeDropDown: any[] = [];
  FileTypeDropDown: FileType[] = [];
  fileExtensionsDropdown: FileType[] = [];
  documentTypeDropDown: DocumentType[] = [];
  caseStatusDropdown: any = [];
  caseTypeFinalId: number;
  masterData: any;
  yearDropDown: { yearId: number; yearName: number }[] = [];
  yearToDropDown: { yearId: number; yearName: number }[] = [];
  isResettingForm = false;
  /**
   * Constructor
   */
  constructor(
    private dataService: SharedService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _searchDocService: SearchDocService,
    public dialog: MatDialog,
    private _uploadDocumentService: UploadDocumentService,
    private _router: Router
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.initForm();
    this.getYear();
    this.getYearTo();
    this.getUserStateDropdown();
    this.onStateChange(16);
    this.onDisctrictChange(443);
    this.getMasterDropDown();
    this.getApiCall();

    // Initialize filtered arrays
    this.filteredStates = this.stateDropdown || [];
    this.filteredDistricts = this.districtDropdown || [];
    this.filteredUnits = this.unitsDropdown || [];
    this.filteredCaseTypes = this.caseTypeDropDown || [];
    this.filteredFileTypes = this.FileTypeDropDown || [];
    this.filteredDocumentTypes = this.documentTypeDropDown || [];
    this.filteredFileExtensions = this.fileExtensionsDropdown || [];
    this.filteredCaseStatus = this.caseStatusDropdown || [];
    this.filteredYears = [...this.yearDropDown];
    this.filteredToYears = [...this.yearToDropDown];
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
    this.searchDocumentForm = this._formBuilder.group({
      firNo: [""],
      office: [""],
      caseDate: [""],
      districtId: [""],
      caseNo: [""],
      caseStatus: [""],
      unitsId: [""],
      stateId: [""],
      letterNo: [""],
      toAddr: [""],
      caseType: [""],
      author: [""],
      fileStage: [""],
      fileType: [""],
      hashTag: [""],
      docType: [""],
      statusId: [""],
      fileExt: [""],
      classification: [""],
      yearId: [""],
      yearIdTo: [""],
    });
  }

  /**
   * Update the Citizen Feedback
   */
  updateCitizenFeedback(): void {
    const product = this.searchDocumentForm.getRawValue();
    delete product.currentImageIndex;
  }

  /**
   * Clear the form
   */
  clearForm(): void {
    this.searchDocumentForm.reset({}, { emitEvent: false });
    this.dataSource.data = [];
    this.alert = undefined;
  }

  SelectDataCase(value) {}

  filterDropDownData(event) {}

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onStateChange(stateId: number): void {
    if (stateId) {
      const divisionId = Number(sessionStorage.getItem("divisionID"));
      this._uploadDocumentService
        .geDistrictByStateData(stateId, divisionId)
        .subscribe(
          (districts: any) => {
            this.districtDropdown = districts.responseData as District[];
            this.filteredDistricts = [...this.districtDropdown];
            // this.searchDocumentForm.get("districtId")?.setValue(443)
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

  getUserStateDropdown() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this._uploadDocumentService.getState(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.stateDropdown = response.responseData as State[];
        this.filteredStates = [...this.stateDropdown];
        // this.stateDropdown.forEach((element: State) => {
        //   if (element.stateId == 16) {
        //     this.searchDocumentForm.patchValue({
        //       stateId: element.stateId,
        //     });
        //   }
        // });
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {},
    });
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
        error: (error) => {},
      });
  }

  getYear() {
    for (let year = 2025; year >= 1990; year--) {
      this.yearDropDown.push({ yearId: year, yearName: year });
      this.yearToDropDown.push({ yearId: year, yearName: year });
    }
  }

  getYearTo() {
    for (let year = 2025; year >= 1990; year--) {
      this.yearToDropDown.push({ yearId: year, yearName: year });
    }
  }

  /**
   * Get Upload MetaData Files
   */

  getUploadMetaDataFiles(): void {
    let searchMetaData = {
      stateId: this.searchDocumentForm.value.stateId,
      districtId: this.searchDocumentForm.value.districtId,
      unitId: this.searchDocumentForm.value.unitsId,
      Office: this.searchDocumentForm.value.office,
      caseNo: this.searchDocumentForm.value.caseNo,
      caseDate: this.searchDocumentForm.value.caseDate,
      firNo: this.searchDocumentForm.value.firNo,
      caseType: this.searchDocumentForm.value.caseType,
      fileType: this.searchDocumentForm.value.fileStage,
      division_id: sessionStorage.getItem("divisionID"),
      docType: this.searchDocumentForm.value.docType,
      caseStatus: this.searchDocumentForm.value.statusId,
      hashTag: this.searchDocumentForm.value.hashTag,
      fileExt: this.searchDocumentForm.value.fileExt,
      author: this.searchDocumentForm.value.author,
      toAddr: this.searchDocumentForm.value.toAddr,
      classification: this.searchDocumentForm.value.classification,
      fromYear: this.searchDocumentForm.value.yearId,
      toYear: this.searchDocumentForm.value.yearIdTo,
    };

    this._searchDocService.getUploadDocMetaData(searchMetaData).subscribe({
      next: (res: any) => {
        if (res.responseData.response) {
          this.dataSource = new MatTableDataSource(res.responseData.response);
          // Set up pagination after data is loaded
          this.setupPagination();
        }
      },
      error: (error) => {
        console.error("Error fetching data:", error);
      },
    });
  }

  private setupPagination(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator1;
      this.dataSource.sort = this.sort1;
      this._changeDetectorRef.detectChanges();
    }
  }

  goToDocument(data: any) {
    console.log("data", data.files);
    this.dataService.setFilesData(data.files);
    this.dataService.setCaseData(data);
    this.dataService.setFileBoolean(false);
    this._router.navigateByUrl("/search-document/get-doc"); // Navigate to the GetDocComponent
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    // Initial setup of pagination
    this.setupPagination();
  }

  onFileTypeChange(data) {
    if (data.value == 3) {
      this.documentTypeDropDown = this.masterData.CaseFiles;
      this.filteredDocumentTypes = [...this.documentTypeDropDown];
    } else if (data.value == 4) {
      this.documentTypeDropDown = this.masterData.Correspondence;
      this.filteredDocumentTypes = [...this.documentTypeDropDown];
    }
    this._changeDetectorRef.detectChanges();
  }

  getMasterDropDown() {
    this._uploadDocumentService.getMasterDropDownData().subscribe({
      next: (response: any) => {
        this.masterData = response;
        this.caseTypeDropDown = response.CaseType;
        this.filteredCaseTypes = [...this.caseTypeDropDown];
        this.ClassificationTypeDropDown = response.ClassificationType;
        this.FileTypeDropDown = response.FileType;
        this.filteredFileTypes = [...this.FileTypeDropDown];
        this.fileExtensionsDropdown = response.FileExtension;
        this.filteredFileExtensions = [...this.fileExtensionsDropdown];
        this.caseStatusDropdown = response.CaseStatus;
        this.filteredCaseStatus = [...this.caseStatusDropdown];
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {},
    });
  }
  onHashTagKeyUp(event: KeyboardEvent): void {
    if (event.key === " ") {
      const hashTagControl = this.searchDocumentForm.get("hashTag");
      let hashTagValue = hashTagControl?.value || "";
      const words = hashTagValue
        .split(" ")
        .filter((word) => word.trim() !== "")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));

      const updatedHashTag = words.join(" ");

      hashTagControl?.setValue(updatedHashTag + " ");
    }
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

  filterFileTypes(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.fileTypeSearchTimeout) {
      clearTimeout(this.fileTypeSearchTimeout);
    }

    this.fileTypeSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredFileTypes = this.FileTypeDropDown;
      } else {
        this.filteredFileTypes = this.FileTypeDropDown.filter((fileType) => {
          const fileTypeName = (fileType.value || "").toLowerCase();
          return fileTypeName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterDocumentTypes(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.documentTypeSearchTimeout) {
      clearTimeout(this.documentTypeSearchTimeout);
    }

    this.documentTypeSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDocumentTypes = this.documentTypeDropDown;
      } else {
        this.filteredDocumentTypes = this.documentTypeDropDown.filter(
          (docType) => {
            const docTypeName = (docType.value || "").toLowerCase();
            return docTypeName.includes(searchText);
          }
        );
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  filterFileExtensions(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.fileExtensionSearchTimeout) {
      clearTimeout(this.fileExtensionSearchTimeout);
    }

    this.fileExtensionSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredFileExtensions = this.fileExtensionsDropdown;
      } else {
        this.filteredFileExtensions = this.fileExtensionsDropdown.filter(
          (fileExt) => {
            const fileExtName = (fileExt.value || "").toLowerCase();
            return fileExtName.includes(searchText);
          }
        );
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

  filterToYears(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.yearToSearchTimeout) {
      clearTimeout(this.yearToSearchTimeout);
    }

    this.yearToSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredToYears = [...this.yearToDropDown];
      } else {
        this.filteredToYears = this.yearToDropDown.filter((year) => {
          const yearName = year.yearName.toString().toLowerCase();
          return yearName.includes(searchText);
        });
      }
      this._changeDetectorRef.detectChanges();
    }, 300);
  }

  generateFIRNo(): void {
    const firControl = this.searchDocumentForm.get("firNo");
    if (firControl) {
      let value = firControl.value;
      value = value?.replace(/\D/g, "");
      if (value && value.length < 4) {
        value = value.padStart(4, "0");
        firControl.setValue(value, { emitEvent: false });
      }
    }
  }

  getApiCall() {
    this.searchDocumentForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        if (!this.isResettingForm) {
          this.getUploadMetaDataFiles();
        }
      });
  }
}
