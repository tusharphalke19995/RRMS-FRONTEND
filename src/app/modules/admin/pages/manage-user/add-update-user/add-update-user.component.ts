import { CommonModule } from "@angular/common";
import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
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
    MatTableModule
  ],
  templateUrl: "./add-update-user.component.html",
  styleUrl: "./add-update-user.component.scss",
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateUserComponent {
  addUpdateUserForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
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

  displayedColumns: string[] = [
    "divisionId",
    "roleId",
    "designationId",
  ];
  divisionInfo: any;
  constructor(
    private _searchUserService: SearchUserService,
    private _formBuilder: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

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
      kgid: ["", Validators.required],
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
    this._searchUserService.getUserRole().subscribe({
      next: (response: any) => {
        if (response) {
          this.userRoleDropdown = response;
        }
      },
      error: (error) => { },
    });
  }

  getDivisionDropdown() {
    this._searchUserService.getUserDivision().subscribe({
      next: (response: any) => {
        if (response) {
          this.divisionDropdown = response;
        }
      },
      error: (error) => { },
    });
  }

  getDesignationsData() {
    this._searchUserService.getDesignationsInfo().subscribe({
      next: (response: any) => {
        if (response) {
          this.designationsDropdown = response;
        }
      },
      error: (error) => { },
    });
  }


  userSave() {
    if (this.addUpdateUserForm.valid) {
      const data = {
        first_name: this.addUpdateUserForm.value.firstName,
        last_name: this.addUpdateUserForm.value.lastName,
        email: this.addUpdateUserForm.value.emailID,
        kgid: this.addUpdateUserForm.value.kgid,
        mobileno: this.addUpdateUserForm.value.mobileNo,
        password: this.addUpdateUserForm.value.password,
        divisions_role: [{
          roleId: this.divisionInfo.roleId,
          divisionId: this.divisionInfo.divisionId,
          designationId: this.divisionInfo.designationId
        }]

      };

      this._searchUserService.createUser(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("User created successfully", "Close", {
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
      // data: data,
      width: "750px",
    });
    dialogRef.afterClosed().subscribe((result: any[] | undefined) => {

      this.divisionInfo = result;
      console.log("  this.divisionInfo ",  this.divisionInfo )
      this.dataSource = new MatTableDataSource(this.divisionInfo);

    });
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
