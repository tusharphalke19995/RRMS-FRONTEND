import { CommonModule } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";
import { SearchUserService } from "../search-userlist/searchUser.service";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  constructor(
    private _searchUserService: SearchUserService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateUserComponent>,
    private _snackBar: MatSnackBar
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
      divisionId:["",Validators.required],
      emailID: ["", [Validators.required, Validators.email]],
      kgid: ["", Validators.required],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      roleId: ["", Validators.required],
      designationId:[""],
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

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}


  getUserRoleDropdown() {
    this._searchUserService.getUserRole().subscribe({
      next: (response: any) => {
        if(response.statusCode==200){
          this.userRoleDropdown= response.responseData;
        }
      },
      error: (error) => {},
    });
  }

  getDivisionDropdown() {
    this._searchUserService.getUserDivision().subscribe({
      next: (response: any) => {
        if(response.statusCode==200){
          this.divisionDropdown= response.responseData;
        }
      },
      error: (error) => {},
    });
  }

  getDesignationsData() {
    this._searchUserService.getDesignationsInfo().subscribe({
      next: (response: any) => {
        if(response.statusCode==200){
          this.designationsDropdown= response.responseData;
        }
      },
      error: (error) => {},
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
        roleId: Number(this.addUpdateUserForm.value.roleId),
        divisionId:this.addUpdateUserForm.value.divisionId,
        designationId:this.addUpdateUserForm.value.designationId,
      };

      this._searchUserService.createUser(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("User created successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this.onNoClose();
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
}
