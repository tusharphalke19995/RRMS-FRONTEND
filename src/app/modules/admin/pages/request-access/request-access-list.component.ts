import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { UntypedFormGroup, NgForm, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SearchUserService } from 'app/modules/admin/pages/manage-user/search-userlist/searchUser.service';
import { MasterService } from 'app/modules/admin/pages/Master/master.service';
import { SearchDocService } from 'app/modules/admin/pages/search-document/searchDoc.service';
import { InventoryVendor } from 'app/modules/admin/pages/upload-document/uploadDoc.types';
import { SharedService } from 'app/shared/shared.service';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTabsModule } from '@angular/material/tabs';
import { RequestDialogComponent } from './request-access-dialog/request-access-dialog.component';
import { RequestAccessService } from './request-access.service';
import { UploadedFilesComponent } from '../search-document/uploaded-files/uploaded-files.component';

@Component({
  selector: 'app-request-access-list',
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
    MatTabsModule
  ],
  templateUrl: './request-access-list.component.html',
  styleUrl: './request-access-list.component.scss'
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

  @ViewChild('pendingSort') pendingSort: MatSort;
  @ViewChild('pendingPaginator') pendingPaginator: MatPaginator;
  @ViewChild('approvedSort') approvedSort: MatSort;
    @ViewChild('deniedSort') deniedSort: MatSort;
  @ViewChild('approvedPaginator') approvedPaginator: MatPaginator;
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
    { labelen: "Action", labelhi: "Action", property: "action" }
  ];

  columnsApproval: any[] = [
    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    { labelen: "Created At", labelhi: "Created At", property: "created_at" },
    { labelen: "Comments", labelhi: "Comments", property: "comments" },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
  ];

  displayedColumns: string[] = [
    'file_name','requested_by','reviewed_by', 'created_at','comments', 'action'
  ];
  displayedColumnsApproval: string[] = [
    'file_name', 'requested_by','reviewed_by', 'created_at','approved_by','comments', 'status'
  ];
 displayedColumnsDenied: string[] = [
    'file_name', 'requested_by','reviewed_by', 'created_at','approved_by','comments', 'status'
  ];

  userRoleDropdown: [];
  designationsDropdown: [];
  pendingReqData: any[] = [];
  /**
   * Constructor
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private _masterService: MasterService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService,
    private requestAccessService:RequestAccessService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getContentManagerReqForWkFlow();
  }

  getContentManagerReqForWkFlow() {
    let payload={
       division_id : Number(sessionStorage.getItem("divisionID")),
        department_id: Number(sessionStorage.getItem("departmentID"))
    }
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
     (this.pendingReqData || []).filter((item: any) => item.status === "Pending")
    );
    this.approvedDataSource = new MatTableDataSource(
     (this.pendingReqData || []).filter((item: any) => item.status === "Approved")
    );
    // Optionally, add a deniedDataSource if you want a separate tab for denied requests
    this.deniedDataSource = new MatTableDataSource(
     (this.pendingReqData || []).filter((item: any) => item.status === "Denied")
    );
    this.setupPagination();
  }

  approvedRequest(notification: any){
    const dialogRef = this.dialog.open(RequestDialogComponent, {
      data: notification,
      width: "677px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getContentManagerReqForWkFlow();
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
    if(this.deniedDataSource){
      this.deniedDataSource.sort=this.deniedSort;
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
        width: '850px', // or '100vw' for full width
        maxWidth: '100vw',
        height: '90vh',
        panelClass: 'custom-dialog-class'
      });
        dialogRef.afterClosed().subscribe((result) => {
          this._changeDetectorRef.detectChanges();
        });
      }
}

