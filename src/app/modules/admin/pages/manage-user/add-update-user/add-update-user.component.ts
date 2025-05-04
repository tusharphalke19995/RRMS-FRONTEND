import { CommonModule } from "@angular/common";
import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
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
  userRoleDropdown = [
   
];
  divisionDropdown = [];
  designationsDropdown = [];
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
  constructor(
    private router:Router,
    private _searchUserService: SearchUserService,
    private _formBuilder: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getUserRoleDropdown();
    this.getDivisionDropdown();
    this.getDesignationsData();
  }

  initiateForm() {
    this.addUpdateUserForm = this._formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],

      emailID: ["", [Validators.required, Validators.email]],
      kgid: ["", Validators.required,MaxLengthValidator[6]],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],

      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
    });
  }

  getUserRoleDropdown() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._searchUserService.getUserRole(divisionID).subscribe({
      next: (response: any) => {
        if (response) {
          this.userRoleDropdown = response.responseData;
        }
      },
      error: (error) => {},
    });
  }

  getDivisionDropdown() {
    const divisionId =Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDivision(divisionId).subscribe({
      next: (response: any) => {
        if (response) {
          this.divisionDropdown = response;
        }
      },
      error: (error) => {},
    });
  }

  getDesignationsData() {
    const divisionId =Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDesignationsInfo(divisionId).subscribe({
      next: (response: any) => {
        if (response) {
          this.designationsDropdown = response;
        }
      },
      error: (error) => {},
    });
  }

  userSave() {
    if (this.addUpdateUserForm.valid && this.divisionInfo && this.divisionInfo.length > 0) {
      const data = {
        first_name: this.addUpdateUserForm.value.firstName,
        last_name: this.addUpdateUserForm.value.lastName,
        email: this.addUpdateUserForm.value.emailID,
        kgid: this.addUpdateUserForm.value.kgid,
        mobileno: this.addUpdateUserForm.value.mobileNo,
        password: this.addUpdateUserForm.value.password,
        divisions_roles: this.divisionInfo.map((entry) => ({
          roleId: entry.roleId,
          divisionId: entry.divisionId,
          designationId: entry.designationId,
        })),
      };
      this._searchUserService.createUser(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("User created successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this.router.navigateByUrl('manage-user');
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
    else if (!this.divisionInfo || this.divisionInfo.length === 0) {
      this._snackBar.open("Please add at least one Division/Role/Designation.", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
    }
  }

  getRoleName(roleId: number): string {
    const role = this.userRoleDropdown.find((role) => role.roleId === roleId);
    return role ? role.roleName : "Unknown Role";
  }

  getDivisionName(divisionId: number): string {
    const division = this.divisionDropdown.find(
      (div) => div.divisionId === divisionId
    );
    return division ? division.divisionName : "Unknown Division";
  }

  getDesignationName(designationId: number): string {
    const designation = this.designationsDropdown.find(
      (des) => des.designationId === designationId
    );
    return designation ? designation.designationName : "Unknown Designation";
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

  addMultiplesDivision() {
    const dialogRef = this.dialog.open(AddMultiplesDivisionComponent, {
      width: "750px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Check if result is an array of entries
        if (Array.isArray(result)) {
          this.divisionInfo = [...(this.divisionInfo || []), ...result]; // Append new entries
        } else {
          this.divisionInfo = [...(this.divisionInfo || []), result]; // Append single entry
        }
        this.dataSource = new MatTableDataSource(this.divisionInfo);
      }
    });
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
    if (!/^[a-zA-Z]$/.test(char)) {
      event.preventDefault();
    }
  }
}
