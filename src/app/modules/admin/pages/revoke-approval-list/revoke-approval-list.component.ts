import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormsModule, UntypedFormGroup, NgForm, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedService } from 'app/shared/shared.service';
import { Subject } from 'rxjs';
import { SearchUserService } from '../manage-user/search-userlist/searchUser.service';
import { MasterService } from '../Master/master.service';
import { SearchDocService } from '../search-document/searchDoc.service';
import { InventoryVendor } from '../upload-document/uploadDoc.types';

@Component({
  selector: 'app-revoke-approval-list',
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
  templateUrl: './revoke-approval-list.component.html',
  styleUrl: './revoke-approval-list.component.scss'
})
export class RevokeApprovalListComponent implements OnInit, AfterViewInit {
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
