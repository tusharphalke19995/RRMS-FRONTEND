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
import { DashbaordService } from '../../dashboard.service';
import { ApproveReqDialogComponent } from './approve-req-dialog/approve-req-dialog.component';

@Component({
  selector: 'app-pending-approval-list',
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
  ],
  templateUrl: './pending-approval-list.component.html',
  styleUrl: './pending-approval-list.component.scss'
})
export class PendingApprovalListComponent implements OnInit, AfterViewInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];

  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [

    { labelen: "File Name", labelhi: "File Name", property: "file_name" },
    { labelen: "Created At", labelhi: "Created At", property: "created_at" },
    { labelen: "Comments", labelhi: "Comments", property: "comments" },
    { labelen: "Is approved", labelhi: "Is Approved", property: "is_approved" },
    { labelen: "Action", labelhi: "Action", property: "action" }
  ];

  displayedColumns: string[] = [
    "file_name",
    "created_at",
    "comments",
    "is_approved",
    "action"
  ];


  userRoleDropdown: [];
  designationsDropdown: [];
  pendingReqData: any;
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
    private dashbaordService:DashbaordService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.pendingReqestDataList();
     this.getContentManagerReqForWkFlow();  
  }

  pendingReqestDataList() {
    this.sharedService.pendingReqData$.subscribe((userInfo: any) => {
      this.pendingReqData = userInfo;
      this.dataSource = new MatTableDataSource(this.pendingReqData);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort1;
    this.dataSource.paginator = this.paginator1;

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
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getContentManagerReqForWkFlow() {
    this.dashbaordService.getContentManagerReqData().subscribe({
      next: (response: any) => {
        this.pendingReqData = response;
      this.dataSource = new MatTableDataSource(this.pendingReqData);
        
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

   approvedRequest(notification: any){
      const dialogRef = this.dialog.open(ApproveReqDialogComponent, {
        data: notification,
        width: "677px",
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getContentManagerReqForWkFlow();
      });
  
    }
}

