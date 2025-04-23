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
    { labelen: "Email", labelhi: "Email", property: "email" },
    {
      labelen: "First Name",
      labelhi: "Last Name",
      property: "first_name",
    },
    { labelen: "Last Name", labelhi: "Last Name", property: "last_name" },
    { labelen: "Mobile No", labelhi: "mobileno", property: "mobileno" },
    { labelen: "kgid", labelhi: "kgid", property: "kgid" },
    { labelen: "Role Name", labelhi: "Role Name", property: "roleName" },
    {
      labelen: "Division Name",
      labelhi: "Division Name",
      property: "divisionNameme",
    },
    {
      labelen: "Designation Name",
      labelhi: "Designation Name",
      property: "designationName",
    },
  ];

  displayedColumns: string[] = [
    "email",
    "first_name",
    "last_name",
    "mobileno",
    "kgid",
    "roleName",
    "divisionName",
    "designationName",
  ];
  userRoleDropdown: [];
  designationsDropdown: [];
  activeUserData: any;
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
    private _citizeninfoService: SearchDocService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getActiveUserList();
  }

  getActiveUserList() {
    this.sharedService.activeUserData$.subscribe((userInfo: any) => {
      this.activeUserData = userInfo;
      console.log(" this.activeUserData ", this.activeUserData);
      this.dataSource = new MatTableDataSource(this.activeUserData);
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
}

