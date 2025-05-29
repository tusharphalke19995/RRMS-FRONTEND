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
import { RequestDialogComponent } from "./request-access-dialog/request-access-dialog.component";
import { RequestAccessService } from "./request-access.service";
import { UploadedFilesComponent } from "../search-document/uploaded-files/uploaded-files.component";
import { AuthService, UserModel } from "app/core/auth/auth.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DialogService } from "../common/dialog.service";
import { CommonDialogComponent } from "../common/common-dialog/common-dialog.component";

@Component({
  selector: "app-request-access-list",
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
    CommonModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: "./request-access-list.component.html",
  styleUrl: "./request-access-list.component.scss",
})
export class RequestAccessListComponent implements OnInit, AfterViewInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];
  isExpanded: boolean[] = [];
  isExpandedAppvd: boolean[] = [];
  isExpandedDenied: boolean[] = [];
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
    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    { labelen: "Created At", labelhi: "Created At", property: "created_at" },
    { labelen: "Comments", labelhi: "Comments", property: "comments" },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
    { labelen: "Action", labelhi: "Action", property: "action" },
  ];

  columnsApproval: any[] = [
    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    { labelen: "Created At", labelhi: "Created At", property: "created_at" },
    { labelen: "Comments", labelhi: "Comments", property: "comments" },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
  ];

  displayedColumns: string[] = [
    "file_name",
    "requested_by",
    "reviewed_by",
    "created_at",
    "comments",
    "action",
  ];
  displayedColumnsApproval: string[] = [
    "file_name",
    "requested_by",
    "reviewed_by",
    "created_at",
    "approved_by",
    "comments",
    "status",
  ];
  displayedColumnsDenied: string[] = [
    "file_name",
    "requested_by",
    "reviewed_by",
    "created_at",
    "approved_by",
    "comments",
    "status",
  ];
  authData: UserModel;
  userRoleDropdown: [];
  designationsDropdown: [];
  pendingReqData: any[] = [];
  selectedRequestId: any;
  selectedRequestIdReminder: any;
  /**
   * Constructor
   */
  constructor(
    private dialogService: DialogService,
    private _snackBar: MatSnackBar,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private _masterService: MasterService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _searchDocService: SearchDocService,
    private requestAccessService: RequestAccessService,
    private authenticationService: AuthService,
private route: ActivatedRoute  ) {
    this.authData = this.authenticationService.getAuthData();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getContentManagerReqForWkFlow();
    this.getUrlInfo();
  }

  getUrlInfo(){
     this.route.queryParams.subscribe(params => {
      const tab = params['selectedTab'];
      const objectId = params['object_id'];
      if (tab !== undefined) {
        this.selectedTab = Number(tab); 
       this.getContentManagerReqForWkFlow();
      }else{
     this.getContentManagerReqForWkFlow();
      }
    });
  }

  getContentManagerReqForWkFlow() {
    let payload = {
      division_id: Number(sessionStorage.getItem("divisionID")),
      department_id: Number(sessionStorage.getItem("departmentID")),
    };
    this.requestAccessService.getContentManagerReqData(payload).subscribe({
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
    this.pendingDataSource = new MatTableDataSource(
      (this.pendingReqData || []).filter(
        (item: any) => item.status === "pending"
      )
    );
    this.approvedDataSource = new MatTableDataSource(
      (this.pendingReqData || []).filter(
        (item: any) => item.status === "Approved"
      )
    );
    // Optionally, add a deniedDataSource if you want a separate tab for denied requests
    this.deniedDataSource = new MatTableDataSource(
      (this.pendingReqData || []).filter(
        (item: any) => item.status === "Denied"
      )
    );
    this.setupPagination();
  }

  approvedRequest(notification: any) {
    const dialogRef = this.dialog.open(RequestDialogComponent, {
      data: notification,
      width: "677px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getContentManagerReqForWkFlow();
      this._changeDetectorRef.detectChanges();
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
    } else if (this.selectedTab === 1) {
      this.approvedDataSource.filter = filterValue.trim().toLowerCase();
      if (this.approvedDataSource.paginator) {
        this.approvedDataSource.paginator.firstPage();
      }
    } else {
      this.deniedDataSource.filter = filterValue.trim().toLowerCase();
      if (this.deniedDataSource.paginator) {
        this.deniedDataSource.paginator.firstPage();
      }
    }
  }

  // viewImage(data) {
  //   const dialogRef = this.dialog.open(UploadedFilesComponent, {
  //     data: data,
  //     width: "850px", // or '100vw' for full width
  //     maxWidth: "100vw",
  //     height: "90vh",
  //     panelClass: "custom-dialog-class",
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this._changeDetectorRef.detectChanges();
  //   });
  // }

  openConfirmationDialogWithdraw(): void {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      width: "700px",
      data: {
        title: "Confirm Action",
        message:
          "You are about to withdraw the request. This action will delete the filles from the system. Are you sure?",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("User confirmed the action");
        this.withdrawRequest();
      } else {
        console.log("User cancelled the action");
      }
    });
  }

  openConfirmationDialogReminder(): void {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      width: "700px",
      data: {
        title: "Confirm Action",
        message:
          "Are you sure you want to send a reminder to your superior for approval?",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("User confirmed the action");
        this.sendReminder();
      } else {
        console.log("User cancelled the action");
      }
    });
  }

  withdrawRequestDetails(data: any) {
    this.selectedRequestId = data.id;
    this.openConfirmationDialogWithdraw();
  }

  sendReminderRequestDetails(data: any) {
    this.selectedRequestIdReminder = data.id;
    this.openConfirmationDialogReminder();
  }

  withdrawRequest() {
    this.requestAccessService
      .withdrawAccessRequest(this.selectedRequestId)
      .subscribe({
        next: (response: any) => {
          this.getContentManagerReqForWkFlow();
          this.dialogService.openSuccessDialog(
            "Success",
            "Withdraw Access Request successfully"
          );
        },
        error: (error) => {
          this.dialogService.openErrorDialog("Error", "Something Went Wrong");
        },
      });
  }

  sendReminder() {
    this.requestAccessService
      .sendReminder(this.selectedRequestIdReminder)
      .subscribe({
        next: (response: any) => {
          this.getContentManagerReqForWkFlow();
          this.dialogService.openSuccessDialog(
            "Success",
            "Reminder Send successfully"
          );
        },
        error: (error: any) => {
          this.dialogService.openErrorDialog(
            "Error",
            "Reminder already sent recently. can send a reminder again next day."
          );
        },
      });
  }

  truncateText(text: string, limit: number): any {
    if (text.length > limit) {
      return {
        truncatedText: text.substring(0, limit) + "...",
        showMore: true,
      };
    }
    return { truncatedText: text, showMore: false };
  }

  toggleDetails(rowIndex: number, event: Event): void {
    event.preventDefault();
    this.isExpanded[rowIndex] = !this.isExpanded[rowIndex];
  }

  truncateTextAppvd(text: string, limit: number): any {
    if (text.length > limit) {
      return {
        truncatedTextAppvd: text.substring(0, limit) + "...",
        showMore: true,
      };
    }
    return { truncatedTextAppvd: text, showMore: false };
  }

  toggleDetailsAppvd(rowIndex: number, event: Event): void {
    event.preventDefault();
    this.isExpandedAppvd[rowIndex] = !this.isExpandedAppvd[rowIndex];
  }

  truncateTextDeny(text: string, limit: number): any {
    if (text.length > limit) {
      return {
        truncatedTextDeny: text.substring(0, limit) + "...",
        showMore: true,
      };
    }
    return { truncatedTextDeny: text, showMore: false };
  }

  toggleDetailsDeny(rowIndex: number, event: Event): void {
    event.preventDefault();
    this.isExpandedDenied[rowIndex] = !this.isExpandedDenied[rowIndex];
  }

    viewImage(data) {
      console.log("Data,data",data)
  const payload = {
    fileHash: data?.file?.fileHash || data?.fileHash,
    requested_to: 0,
    comments: "",
    division_id: sessionStorage.getItem("divisionID"),
    case_id: data?.file?.classification,
  };

  this._searchDocService.filePreviewData(payload).subscribe({
    next: (res: any) => {
      if (!res) {
        console.error("No file data received");
        return;
      }

      const fileType = res.mime_type || res.type;
      const base64 = res.base64_content;
      const fileName = res.file_name || "document";

      const officeMimeTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
         "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ];

      if (officeMimeTypes.includes(fileType)) {
        const blob = this.base64ToBlob(base64, fileType);
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        // Open UploadedFilesComponent dialog
        const dialogRef = this.dialog.open(UploadedFilesComponent, {
          data: data,
          width: "850px",
          maxWidth: "100vw",
          height: "90vh",
          panelClass: "custom-dialog-class",
        });

        dialogRef.afterClosed().subscribe(() => {
          this._changeDetectorRef.detectChanges();
        });
      }
    },
    error: (error) => {
      console.error("Error fetching file preview:", error);
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

}
