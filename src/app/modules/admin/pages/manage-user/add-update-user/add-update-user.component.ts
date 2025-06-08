import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormsModule,
  MaxLengthValidator,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";
import { SearchUserService } from "../search-userlist/searchUser.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { AddMultiplesDivisionComponent } from "../add-multiples-division/add-multiples-division.component";
import { Router } from "@angular/router";
import { SharedService } from "app/shared/shared.service";
import { notGmailValidator } from "app/shared/validators/notGmailValidator";

@Component({
  selector: "app-add-update-user",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslocoModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: "./add-update-user.component.html",
  styleUrl: "./add-update-user.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class AddUpdateUserComponent {
  addUpdateUserForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  filteredUserRoles = [];
  filteredDivisions = [];
  filteredDesignations = [];

  private roleSearchTimeout: any;
  private divisionSearchTimeout: any;
  private designationSearchTimeout: any;
  isLoading: boolean = false;
  alert: { type: string; message: string };
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [
    { labelen: "Role Name", labelhi: "Role Name", property: "roleId" },
    {
      labelen: "Division Name",
      labelhi: "Division Name",
      property: "divisionId",
    },
    {
      labelen: "Designation Name",
      labelhi: "Designation Name",
      property: "designationId",
    },
  ];

  displayedColumns: string[] = ["divisionId", "roleId", "designationId"];
  divisionInfo: any;
  departmentMeta: any[] = [];
  divisionMeta: any[] = [];
  designationMeta: any[] = [];
  selectedDesignation: any = null;
  selectedDesignations: any[] = [];
  userData: any;
  updateBool: boolean = false;
  isView: boolean;
  constructor(
    private router: Router,
    private _searchUserService: SearchUserService,
    private _formBuilder: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getUserDataPatch();
    this.checkViewBoolean();
    this.getUserRoleDropdown();
    this.getDivisionDropdown();
    this.getDesignationsData();
  }

  checkViewBoolean() {
    this.sharedService.getUserBoolean().subscribe((res) => {
      console.log("res", res);
      if (res === true) {
        this.isView = true;
        this.addUpdateUserForm.get("firstName")?.disable();
        this.addUpdateUserForm.get("lastName")?.disable();
      }
    });
  }

  getUserDataPatch() {
    this.isView = false;
    this.sharedService.getUserData().subscribe((data) => {
      if (data) {
        this.updateBool = true;
        this.userData = data;
        this.addUpdateUserForm.patchValue({
          firstName: this.userData.first_name,
          lastName: this.userData.last_name,
          emailID: this.userData.email,
          kgid: this.userData.kgid,
          mobileNo: this.userData.mobileno,
          designation: this.userData.designation_detail?.map(
            (d) => d.designationId
          ),
          roleId: this.userData.roleId || this.userData.role,
        });
        setTimeout(() => {
          this.onDesignationSelect(
            this.userData.designation_detail?.map((d) => d.designationId)
          );
        }, 3000);

        this.addUpdateUserForm.get("kgid")?.disable();
        this.addUpdateUserForm.get("emailID")?.disable();
        this.addUpdateUserForm.get("mobileNo")?.disable();
        this.addUpdateUserForm.get("firstName")?.disable();
        this.addUpdateUserForm.get("lastName")?.disable();
        this.cdr.detectChanges();
      }
    });
  }

  initiateForm() {
    this.addUpdateUserForm = this._formBuilder.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      emailID: ["", [Validators.required, Validators.email]],//notGmailValidator()
      kgid: ["", Validators.required, MaxLengthValidator[12]],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      roleId: ["", [Validators.required]],
      designation: [[], [Validators.required]],
      // password: [
      //   "",
      //   [
      //     Validators.required,
      //     Validators.pattern(
      //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      //     ),
      //   ],
      // ],
    });
  }

  userSave() {
    const data = {
      first_name: this.addUpdateUserForm.value.firstName,
      last_name: this.addUpdateUserForm.value.lastName,
      email: this.addUpdateUserForm.value.emailID,
      kgid: this.addUpdateUserForm.value.kgid,
      mobileno: this.addUpdateUserForm.value.mobileNo,
      // password: this.addUpdateUserForm.value.password,
      roleId: this.addUpdateUserForm.value.roleId,
      designation: this.addUpdateUserForm.value.designation,
    };
    this._searchUserService.createUser(data).subscribe({
      next: (response: any) => {
        this._snackBar.open("User created successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.router.navigateByUrl("manage-user/active-user");
      },
     error: (error: any) => {
      console.log("error", error);

      // Check if the error has a message and display it
      const errorMessage = error.error?.message || 'An error occurred while creating the user.';

      this._snackBar.open(errorMessage, "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    },
    });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  filterUserRoles(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.roleSearchTimeout) {
      clearTimeout(this.roleSearchTimeout);
    }

    this.roleSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredUserRoles = [...this.userRoleDropdown];
      } else {
        this.filteredUserRoles = this.userRoleDropdown.filter((role) => {
          const roleName = (role.roleName || "").toLowerCase();
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
        this.filteredDivisions = this.divisionDropdown.filter((division) => {
          const divisionName = (division.divisionName || "").toLowerCase();
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
        this.filteredDesignations = this.designationsDropdown.filter(
          (designation) => {
            const designationName = (
              designation.designationName || ""
            ).toLowerCase();
            return designationName.includes(searchText);
          }
        );
      }
    }, 300);
  }

  getUserRoleDropdown() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
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
    const divisionId = Number(sessionStorage.getItem("divisionID"));
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

  getDesignationsData() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
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

  // onDesignationSelect(designationIds: number[]) {
  //   this.selectedDesignations = this.designationsDropdown.filter(
  //     d => designationIds.includes(d.designationId)
  //   );
  // }

  onDesignationSelect(designationIds: number[]) {
    if (!Array.isArray(designationIds)) {
      designationIds = [designationIds];
    }

    this.selectedDesignations = this.designationsDropdown.filter((d) =>
      designationIds.includes(d.designationId)
    );
    console.log("selectedDesignations", this.selectedDesignations);
    this.cdr.detectChanges();
  }

  getDepartmentNames(row: any): string {
    return row.department?.map((d: any) => d.departmentName).join(", ") || "-";
  }

  getDivisionNames(row: any): string {
    return row.division?.map((d: any) => d.divisionName).join(", ") || "-";
  }

  getSuperdivisionNames(row: any): string {
    return (
      row.superdivision?.map((s: any) => s.superdivisionName).join(", ") || "-"
    );
  }

  userUpdate() {
    const data = {
      id: this.userData.id,
      // first_name: this.addUpdateUserForm.value.firstName,
      // last_name: this.addUpdateUserForm.value.lastName,
      // email:  this.userData.email,
      // kgid: this.userData.kgid,
      // mobileno:  this.userData.mobileno,
      // password: this.userData.password,
      roleId: this.addUpdateUserForm.value.roleId,
      designationIds: this.addUpdateUserForm.value.designation,
    };
    this._searchUserService.updateUserById(this.userData.kgid, data).subscribe({
      next: (response: any) => {
        this._snackBar.open("User Updated successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.router.navigateByUrl("manage-user/active-user");
      },
      error: (error) => {
        this._snackBar.open( error.error.error, "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  goToUserList() {
    this.router.navigateByUrl("/manage-user/active-user");
  }

    allowNumbersAndLetters(event: KeyboardEvent): void {
  const char = event.key;
  if (!/^[a-zA-Z0-9\s]$/.test(char) && char !== 'Backspace') {
    event.preventDefault();
  }
}
}
