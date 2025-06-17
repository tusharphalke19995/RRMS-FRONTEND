import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  ReactiveFormsModule,
  FormsModule,
  UntypedFormGroup,
  NgForm,
  UntypedFormBuilder,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { Subject } from "rxjs";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { InventoryVendor } from "../../upload-document/uploadDoc.types";
import { MasterService } from "../../Master/master.service";
import { NotificationService } from "../../manage-notification/notification.service";
import { UserDataShowComponent } from "app/layout/common/notifications/user-data-show/user-data-show.component";
import { SearchUserService } from "../search-userlist/searchUser.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
export interface User {
  email: string;
  mobileNo: string;
  userName: string;
  pwdRequestEmail: string;
  pwdResetRequestId: number;
  pwdRequestMobileNo: string;
  kgid: string;
}
@Component({
  selector: "app-reset-password-req",
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
     MatTooltipModule,
   ],
  templateUrl: "./reset-password-req.component.html",
  styleUrl: "./reset-password-req.component.scss",
})
export class ResetPasswordRequestComponent implements OnInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];
  selectedTab = 0;

    @ViewChild("pendingSort") pendingSort: MatSort;
  @ViewChild("pendingPaginator") pendingPaginator: MatPaginator;
  @ViewChild("rejectSort") rejectSort: MatSort;
  @ViewChild("rejectPaginator") rejectPaginator: MatPaginator;
  @ViewChild("approvedSort") approvedSort: MatSort;
  @ViewChild("approvedPaginator") approvedPaginator: MatPaginator;
   pendingDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  rejectDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
approvedDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  displayedColumns: string[] = ["kgid","userName","email","mobileno", "action"];
    displayedRejectColumns: string[] = ["kgid","userName","email","mobileno",];
  userRoleDropdown: [];
  designationsDropdown: [];
 resetPasswordData:any;
  pendingReqData: any;
  /**
   * Constructor
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _masterService: MasterService,
    public dialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService,
    private _dialog: MatDialog,
    private _notify: NotificationService,
    private route: ActivatedRoute,
    private searchUserService: SearchUserService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getallRequests();
    // this.route.queryParams.subscribe((params) => {
    //   const objectId = params["object_id"];
    //   console.log("objectId",objectId)
    //   if (objectId) {
    //     this.getUsersDataById(objectId);
    //   }
    // });
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
  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  addRequestAdminReset(data) {
    // const dialogRef = this.dialog.open(AddUpdateCaseStatusComponent, {
    //   data: data,
    //   width: "400px",
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   this._changeDetectorRef.detectChanges();
    //   this.getRequestAdminResetInfo();
    // });
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
    }
    else if (this.selectedTab === 2) {
      this.rejectDataSource.filter = filterValue.trim().toLowerCase();
      if (this.rejectDataSource.paginator) {
        this.rejectDataSource.paginator.firstPage();
      }
    }
  }

  updateRequestAdminReset(row: any): void {
    this.addRequestAdminReset(row);
  }


  // getUsersDataById(id) {
  //    this._notify.getUsersData(id).subscribe((data:any) => {
  //     console.log("data",data)
  //     this.dataSource = new MatTableDataSource([data]);
  //      this._changeDetectorRef.detectChanges();

  //   });
  // }


  getallRequests() {
     this.searchUserService.getallRequests().subscribe((response:any) => {
      console.log("data",response)
       this.pendingReqData = Array.isArray(response) ? response : [response];
        this.filterTabData();
       this._changeDetectorRef.detectChanges();
    });
  }
  
  private setupPagination(): void {
    if (this.pendingDataSource) {
      this.pendingDataSource.sort = this.pendingSort;
      this.pendingDataSource.paginator = this.pendingPaginator;
    }
    if (this.rejectDataSource) {
      this.rejectDataSource.sort = this.rejectSort;
      this.rejectDataSource.paginator = this.rejectPaginator;
    }
    if(this.approvedDataSource){
      this.approvedDataSource.sort = this.approvedSort;
      this.approvedDataSource.paginator = this.approvedPaginator;
    }
  }


  approvedRequest(data: any) {
    const dialogRef = this._dialog.open(UserDataShowComponent, {
      data: data,
      width: "677px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getallRequests();
    });
  }

    filterTabData() {
    const updatedData = (this.pendingReqData || []).map((item: any) => ({
      ...item
    }));

    this.pendingDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "C")
    );
    this.rejectDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "rejected")
    );

       this.approvedDataSource = new MatTableDataSource(
      updatedData.filter((item: any) => item.status === "approved")
    );
    this.setupPagination();
  }
}
