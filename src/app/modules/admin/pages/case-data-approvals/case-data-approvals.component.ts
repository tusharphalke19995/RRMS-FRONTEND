import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
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
  UntypedFormGroup,
  NgForm,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { SearchUserService } from "app/modules/admin/pages/manage-user/search-userlist/searchUser.service";
import { MasterService } from "app/modules/admin/pages/Master/master.service";
import { SearchDocService } from "app/modules/admin/pages/search-document/searchDoc.service";
import { InventoryVendor } from "app/modules/admin/pages/upload-document/uploadDoc.types";
import { SharedService } from "app/shared/shared.service";
import { Subject } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTabsModule } from "@angular/material/tabs";
import { CaseDataApprovalService } from "./case-data-approvals.service";
import { ConfirmationDialogCaseDataApprovalComponent } from "./confirmation-dialog/confirmation-caseData-dialog.component";
import { AuthService } from "app/core/auth/auth.service";
import { UploadedFilesComponent } from "../search-document/uploaded-files/uploaded-files.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { UpdateFileMetadataComponent } from "./update-file-metadata/update-file-metadata.component";

@Component({
  selector: "app-case-data-approval",
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
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: "./case-data-approvals.component.html",
})
export class CaseDataApprovalsComponent implements OnInit, AfterViewInit {
    isExpanded: boolean[] = [];
    isExpandedCaseNo: boolean[] = [];
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];
  objectId: number;
  authData: any;
  @ViewChild("pendingSort") pendingSort: MatSort;
  @ViewChild("pendingPaginator") pendingPaginator: MatPaginator;
  @ViewChild("approvedSort") approvedSort: MatSort;
   @ViewChild("deniedSort") deniedSort: MatSort;
  @ViewChild("approvedPaginator") approvedPaginator: MatPaginator;
@ViewChild("deniedPaginator") deniedPaginator: MatPaginator;

  dataSource: MatTableDataSource<any>;
  selectedTab = 0;
  pendingDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  approvedDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  deniedDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  columns: any[] = [
    { labelen: "Case No", labelhi: "Case No", property: "case_no" },
    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    {
      labelen: "Created At",
      labelhi: "Created At",
      property: "requested_by_full_name",
    },
    {
      labelen: "division Name",
      labelhi: "division name",
      property: "division_name",
    },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
    { labelen: "Action", labelhi: "Action", property: "action" },
  ];

  displayedColumns: string[] = [
    "division_name",
    "file_name",
    "case_no",
    "requested_by_full_name",
    "reviewed__by_full_name",
     "created_at",
    "action",
  ];

  columnsApproval: any[] = [
    { labelen: "Case No", labelhi: "Case No", property: "case_no" },
    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    {
      labelen: "Created At",
      labelhi: "Created At",
      property: "requested_by_full_name",
    },
    {
      labelen: "division Name",
      labelhi: "division name",
      property: "division_name",
    },
    { labelen: "Comments", labelhi: "Comments", property: "comments" },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
  ];

  displayedColumnsApproval: string[] = [
    "division_name",
    "file_name",
    "case_no",
    "requested_by_full_name",
    "reviewed__by_full_name",
    "created_at",
    "comments",
  ];


  displayedColumnsDenied: string[] = [
    "division_name",
    "file_name",
    "case_no",
    "requested_by_full_name",
    "reviewed__by_full_name",
    "created_at",
    "comments",
  ];

  userRoleDropdown: [];
  designationsDropdown: [];
  pendingReqData: any[] = [];
  checkActionBool: boolean;
  /**
   * Constructor
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private authServcie: AuthService,
    private sharedService: SharedService,
    private _masterService: MasterService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService,
    private caseDataApprovalService: CaseDataApprovalService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.authData = this.authServcie.getAuthData();

    this.route.queryParams.subscribe((params) => {
      if (params["object_id"]) {
        this.objectId = params["object_id"];
        this.getApprovalsByGivenIdByNotification(this.objectId);
      } else {
        this.getCasedataUploadApprovalsData();
      }
    });
  }

  getApprovalsByGivenIdByNotification(id) {
    this.caseDataApprovalService.getApprovalsByGivenId(id).subscribe({
      next: (response: any) => {
        this.pendingReqData = Array.isArray(response) ? response : [response];

        this.filterTabData();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

  getCasedataUploadApprovalsData() {
    let payLoad = {
      division_id: Number(sessionStorage.getItem("divisionID")),
      department_id: Number(sessionStorage.getItem("departmentID")),
    };
    this.caseDataApprovalService.getCasedataUploadApprovals(payLoad).subscribe({
      next: (response: any) => {
        this.pendingReqData = response;

        this.filterTabData();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

  filterTabData() {
    const updatedData = (this.pendingReqData || []).map((item: any) => ({
      ...item,
      requested_by_full_name: `${item.requested_by_first_name} ${item.requested_by_last_name}`,
      reviewed__by_full_name: `${item.reviewed_by_first_name} ${item.reviewed_by_last_name}`,
    }));

    this.pendingDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "PENDING")
    );
    this.approvedDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "APPROVED")
    );
    // Optionally, add a deniedDataSource if you want a separate tab for denied requests
    this.deniedDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "DENIED")
    );
    this.setupPagination();
  }

  approvedRequest(notification: any) {
    const dialogRef = this.dialog.open(
      ConfirmationDialogCaseDataApprovalComponent,
      {
        data: notification,
        width: "677px",
      }
    );
    dialogRef.afterClosed().subscribe((result) => {
      this.getCasedataUploadApprovalsData();
    });
  }

openEditFileModal(file: any) {
  const dialogRef = this.dialog.open(UpdateFileMetadataComponent , {
    width: '610px',
    data: { file },
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.getCasedataUploadApprovalsData();
    }
  });
}
  ngAfterViewInit(): void {
    this.setupPagination();
  }

  private setupPagination(): void {
    if (this.pendingDataSource) {
      this.pendingDataSource.sort = this.pendingSort;
      this.pendingDataSource.paginator = this.pendingPaginator;
    }
    if (this.approvedDataSource) {
      this.approvedDataSource.sort = this.approvedSort;
      this.approvedDataSource.paginator = this.approvedPaginator;
    }
     if (this.deniedDataSource) {
      this.deniedDataSource.sort = this.deniedSort;
      this.deniedDataSource.paginator = this.deniedPaginator;
    }
    this._changeDetectorRef.detectChanges();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.selectedTab === 0) {
      this.pendingDataSource.filter = filterValue.trim().toLowerCase();
      if (this.pendingDataSource.paginator) {
        this.pendingDataSource.paginator.firstPage();
      }
    } else if(this.selectedTab === 1) {
      this.approvedDataSource.filter = filterValue.trim().toLowerCase();
      if (this.approvedDataSource.paginator) {
        this.approvedDataSource.paginator.firstPage();
      }
    }
    else {
      this.deniedDataSource.filter = filterValue.trim().toLowerCase();
      if (this.deniedDataSource.paginator) {
        this.deniedDataSource.paginator.firstPage();
      }
    }
  }


  viewImage(data) {
    const dialogRef = this.dialog.open(UploadedFilesComponent, {
      data: data,
      width: "850px", // or '100vw' for full width
      maxWidth: "100vw",
      height: "90vh",
      panelClass: "custom-dialog-class",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this._changeDetectorRef.detectChanges();
    });
  }

    withdrawRequest(data: any) {
      this.caseDataApprovalService.withdrawAccessUploadApproval(data.id).subscribe({
    next: (response: any) => {
      this.getCasedataUploadApprovalsData();
      this._snackBar.open("Withdraw Access Request successfully", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });   
     
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

  sendReminder(data: any) {
     this.caseDataApprovalService.sendReminderUploadApproval(data.id).subscribe({
    next: (response: any) => {
      this.getCasedataUploadApprovalsData();
      this._snackBar.open("Reminder Send successfully", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["success-snackbar"],
      });   
  
    },
    error: (error:any) => {
      this._snackBar.open(error.error || "Reminder already sent recently. can send a reminder again next day.", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    },
  });
  }

}
