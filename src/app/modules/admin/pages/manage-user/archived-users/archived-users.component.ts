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
  ReactiveFormsModule,
  FormsModule,
  NgForm,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatDialog } from "@angular/material/dialog";
import { SharedService } from "app/shared/shared.service";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { InventoryVendor } from "../../upload-document/uploadDoc.types";
import { SearchUserService } from "../search-userlist/searchUser.service";
import { MasterService } from "../../Master/master.service";
import { MatSnackBar } from "@angular/material/snack-bar";
interface Role {
  roleId: number;
  roleName: string;
}

interface Division {
  divisionId: number;
  divisionName: string;
}

interface Department {
  departmentId: number;
  departmentName: string;
}


interface Designation {
  designationId: number;
  designationName: string;
}
@Component({
  selector: "app-archived-users",
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
  templateUrl: "./archived-users.component.html",
  styleUrl: "./archived-users.component.scss",
})
export class ArchivedUsersComponent implements OnInit, AfterViewInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown: Division[] = [];
  filteredDivisions: Division[] = [];
  userRoleDropdown: Role[] = [];
  filteredUserRoles: Role[] = [];
  designationsDropdown: Designation[] = [];
  filteredDesignations: Designation[] = [];
   userDeparmentDropdown: Department[] = [];
  filteredUserDeparment: Department[] = [];
  private roleSearchTimeout: any;
  private divisionSearchTimeout: any;
  private designationSearchTimeout: any;
  private departmentSearchTimeout: any;
  users: any;
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [
    { labelen: "Name", labelhi: "First Name", property: "first_name" },
    { labelen: "Name", labelhi: "Last Name", property: "last_name" },
    { labelen: "KGID", labelhi: "KGID", property: "kgid" },
    { labelen: "Mobile No", labelhi: "Mobile No", property: "mobileno" },
    { labelen: "Email ID", labelhi: "Email Id", property: "email" },
    { labelen: "Roles", labelhi: "Roles", property: "designation" },
    // {
    //   labelen: "Action",
    //   labelhi: "Action",
    //   property: "action",
    //   isAction: true,
    // },
  ];

  displayedColumns: string[] = [
    "full_name",
    "kgid",
    "mobileno",
    "email",
    "role",
    "designation",
    // "action"
  ];

  /**
   * Constructor
   */
  constructor(
      private _snackBar: MatSnackBar,
    private sharedService:SharedService,
    private changeDetectorRefs: ChangeDetectorRef,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService,
    private router:Router,
    private _masterService :MasterService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.initForm();
    this.getApiCall();
    this.getUserRoleDropdown();
    this.getDivisionDropdown();
    this.getDesignationsDropDownData();
    this.getDepartmentsInfo();
  }


  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator1;
    }
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
    this.searchUserListForm = this._formBuilder.group({
      departmentId:[""],
      divisionId: [""],
      designationId: [""],
      mobileNo:[""],
      firstName:[""],
      lastName:[""],
       kgid: [""],
    });
  }



  /**
   * Update the Citizen Feedback
   */
  updateCitizenFeedback(): void {
    const product = this.searchUserListForm.getRawValue();
    delete product.currentImageIndex;
  }

  /**
   * Clear the form
   */
  clearForm(): void {
    // Reset the form
    this.searchUserListForm.reset();
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

  addNewUser(data) {
    this.sharedService.setUserData(data);
    this.router.navigateByUrl('/manage-user/user-addUpdate')
  }

applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUser(row: any): void {
    this.addNewUser(row);
  }

  deleteUser(row: any): void {
    // Implement delete logic here
    console.log("Delete user:", row);
  }

 getUserInfo() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._searchUserService.getUserList(divisionID).subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator1; // Ensure paginator is set
       
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      },
    });
  }

  filterUserRoles(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();
    
    if (this.roleSearchTimeout) {
      clearTimeout(this.roleSearchTimeout);
    }

    this.roleSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredUserRoles = [...this.userRoleDropdown];
      } else {
        this.filteredUserRoles = this.userRoleDropdown.filter(role => {
          const roleName = (role.roleName || '').toLowerCase();
          return roleName.includes(searchText);
        });
      }
    }, 300);
  }

  filterDivisions(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();
    
    if (this.divisionSearchTimeout) {
      clearTimeout(this.divisionSearchTimeout);
    }

    this.divisionSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDivisions = [...this.divisionDropdown];
      } else {
        this.filteredDivisions = this.divisionDropdown.filter(division => {
          const divisionName = (division.divisionName || '').toLowerCase();
          return divisionName.includes(searchText);
        });
      }
    }, 300);
  }

  filterDesignations(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();
    
    if (this.designationSearchTimeout) {
      clearTimeout(this.designationSearchTimeout);
    }

    this.designationSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDesignations = [...this.designationsDropdown];
      } else {
        this.filteredDesignations = this.designationsDropdown.filter(designation => {
          const designationName = (designation.designationName || '').toLowerCase();
          return designationName.includes(searchText);
        });
      }
    }, 300);
  }

  filterDepartment(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();
    
    if (this.departmentSearchTimeout) {
      clearTimeout(this.departmentSearchTimeout);
    }

    this.departmentSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredUserDeparment = [...this.userDeparmentDropdown];
      } else {
        this.filteredUserDeparment = this.userDeparmentDropdown.filter(dept => {
          const deptName = (dept.departmentName || '').toLowerCase();
          return deptName.includes(searchText);
        });
      }
    }, 300);
  }

  getUserRoleDropdown() {
    const divisionID = Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getUserRole(divisionID).subscribe({
      next: (response: any) => {
        if (response) {
          this.userRoleDropdown = response.responseData;
          this.filteredUserRoles = [...this.userRoleDropdown];
        }
      },
      error: (error) => {},
    });
  }

  getDivisionDropdown() {
    const divisionId = Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDivision(divisionId).subscribe({
      next: (response: any) => {
        if (response) {
          this.divisionDropdown = response;
          this.filteredDivisions = [...this.divisionDropdown];
        }
      },
      error: (error) => {},
    });
  }

  getDesignationsDropDownData() {
    const divisionId = Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDesignationsInfo(divisionId).subscribe({
      next: (response: any) => {
        if (response) {
          this.designationsDropdown = response;
          this.filteredDesignations = [...this.designationsDropdown];
        }
      },
      error: (error) => {},
    });
  }

   getDepartmentsInfo() {
    this._masterService.getDepartments().subscribe({
      next: (response: any) => {
         this.userDeparmentDropdown = response;
          this.filteredUserDeparment = [...this.userDeparmentDropdown];
      },
      error: (error) => {},
    });
  }


  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
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

 getRoleName(roleId: number): string {
    const role = this.userRoleDropdown.find(r => r.roleId === roleId);
    return role ? role.roleName : 'Unknown Role';
  }

searcUserBySelectedParameter(){
   const data = {
      firstName: this.searchUserListForm.value.firstName,
      lastName: this.searchUserListForm.value.lastName,
      kgid: this.searchUserListForm.value.kgid,
      mobileNo: this.searchUserListForm.value.mobileNo,
     departmentId: this.searchUserListForm.value.departmentId,
      designationId: this.searchUserListForm.value.designationId,
      divisionId: this.searchUserListForm.value.divisionId,
    };
    this._searchUserService.searchUser(data).subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator1;
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
  
getApiCall() {
    this.searchUserListForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.searcUserBySelectedParameter();
      });
  }
}
