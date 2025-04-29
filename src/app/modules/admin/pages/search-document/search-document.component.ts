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
import { MatDividerModule } from "@angular/material/divider";
import { TranslocoModule } from "@ngneat/transloco";
import { Router, RouterLink } from "@angular/router";
import { InventoryVendor } from "../upload-document/uploadDoc.types";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SearchDocService } from "./searchDoc.service";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { UploadDocumentService } from "../upload-document/uploadDoc.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadedFilesComponent } from "./uploaded-files/uploaded-files.component";
import { UploadFilesComponent } from "../upload-files/upload-files/upload-files.component";
import { SharedService } from "app/shared/shared.service";
import { join } from "lodash";
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
    UploadFilesComponent
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
  stateDropdown: [];
  districtDropdown: any;
  unitsDropdown: any;
  dataShow = [
    {
      id: 0,
      value: "Addhar Card",
    },
    {
      id: 1,
      value: "PanCard",
    },
  ];
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: any = [];
  columns: any[] = [
    { labelen: "State", labelhi: "State", property: "stateName" },
    { labelen: "District", labelhi: "District", property: "districtName" },
    {
      labelen: "Police Station",
      labelhi: "Police Station",
      property: "unitName",
    },
    { labelen: "Name", labelhi: "Last Name", property: "firNo" },
    { labelen: "Case No", labelhi: "Case No", property: "caseNo" },
    { labelen: "Case Type", labelhi: "Case Type", property: "caseType" },

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
    "stateName",
    "districtName",
    "unitName",
    "firNo",
    "caseNo",
    "caseType",
    "caseDate",
    "letterNo",
    "action",
  ];


  /**
   * Constructor
   */
  constructor(
    private dataService:SharedService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _searchDocService: SearchDocService,
    public dialog: MatDialog,
    private _uploadDocumentService: UploadDocumentService,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.initForm();
    this.getUserStateDropdown();
    this.onStateChange(16);
    this.onDisctrictChange(443);
    this.getUploadMetaDataFiles();
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
      letterNo:[""],
      toAddr:[""],
      caseType:[""],
      author:[""]
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
    // Reset the form
    this.addcitizenInformationNgForm.resetForm();
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
      const divisionId =JSON.parse(sessionStorage.getItem("divisionID"));
      this._uploadDocumentService.geDistrictByStateData(stateId,divisionId).subscribe(
        (districts: any) => {
          this.districtDropdown = districts.responseData;
          // this.searchDocumentForm.get("districtId")?.setValue(443);
        },
        (error) => {
          console.error("Error fetching districts:", error);
        }
      );
    } else {
      this.districtDropdown = [];
    }
  }

  getUserStateDropdown() {
    const divisionId =JSON.parse(sessionStorage.getItem('divisionID'));
    this._uploadDocumentService.getState(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.stateDropdown = response.responseData;
        // this.stateDropdown.forEach((element: any) => {
        //   if (element.stateId == 16) {
        //     this.searchDocumentForm.patchValue({
        //       stateId: element.stateId,
        //     });
        //     this.searchDocumentForm.get("stateId").disable();
        //   }
        // });
      },
      error: (error) => {},
    });
  }

  onDisctrictChange(stateId: number): void {
    const divisionId =JSON.parse(sessionStorage.getItem('divisionID'));
    this._uploadDocumentService.getUnitsByDistictIdData(stateId,divisionId).subscribe({
      next: (response: any) => {
        if (response.statusCode == 200) {
          this.unitsDropdown = response.responseData;
        }
      },
      error: (error) => {},
    });
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
      division_id :JSON.parse(sessionStorage.getItem('divisionID'))
    };

    this._searchDocService.getUploadDocMetaData(searchMetaData).subscribe({
      next: (res: any) => {
        if (res.responseData.response) {
          this.dataSource = res.responseData.response;
        }
      },
      error: (error) => {},
    });
  }

  goToDocument(data: any) {
    console.log("data", data.files);
    this.dataService.setFilesData(data.files); 
    this.dataService.setCaseData(data);
    this.dataService.setFileBoolean(false);
    this._router.navigateByUrl("/search-document/get-doc"); // Navigate to the GetDocComponent
    
  }

}
