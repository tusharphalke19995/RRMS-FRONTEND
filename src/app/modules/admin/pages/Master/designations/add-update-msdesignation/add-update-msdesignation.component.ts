import { CommonModule } from "@angular/common";
import { Component, Inject, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MasterService } from "../../master.service";

@Component({
  selector: "app-add-update-designation",
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
  templateUrl: "./add-update-msdesignation.component.html",
  styleUrl: "./add-update-msdesignation.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class AddUpdatDesignationRoleComponent {
  addUpdateDesignationForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool: boolean = false;
  filteredDepartment = [];
  departmentDropdown = [];
  filteredDivision = [];
  departmentSearchTimeout: any;
  divisionSearchTimeout: any;
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdatDesignationRoleComponent>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getDepartmentsInfo();
    this.getDivision();
    if (this.data) {
      this.updateBool = true;
      this.dataPatch();
    }
  }

  initiateForm() {
    this.addUpdateDesignationForm = this._formBuilder.group({
      designationName: ["", Validators.required],
      divisionId: [[], Validators.required],
      departmentId: [[], Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  designationSave() {
    if (this.addUpdateDesignationForm.valid) {
      const data = {
        designationName: this.addUpdateDesignationForm.value.designationName,
        departmentIds: this.addUpdateDesignationForm.value.departmentId,
        divisionIds: this.addUpdateDesignationForm.value.divisionId,
      };
      this.masterService.createDesignations(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Designations created successfully", "Close", {
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

designationUpdate() {
  if (this.addUpdateDesignationForm.valid) {
    const formValue = this.addUpdateDesignationForm.value;
    const updatePayload = {
      designationName: formValue.designationName,
      departmentIds: Array.isArray(formValue.departmentId) ? formValue.departmentId : [formValue.departmentId],
      divisionIds: Array.isArray(formValue.divisionId) ? formValue.divisionId : [formValue.divisionId],
    };

    this.masterService
      .updateDesignations(this.data.designationId, updatePayload)
      .subscribe({
        next: (response: any) => {
          this._snackBar.open("Designations updated successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this.onNoClose();
        },
        error: (error) => {
          this._snackBar.open(
            error?.message || "Error updating designation",
            "Close",
            {
              duration: 3000,
              horizontalPosition: "right",
              verticalPosition: "top",
              panelClass: ["error-snackbar"],
            }
          );
        },
      });
  } else {
    this._snackBar.open("Please fill all required fields correctly.", "Close", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
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

 dataPatch() {
 if (this.data) {
    this.addUpdateDesignationForm.reset();
    const departmentIds = Array.isArray(this.data.department)
      ? this.data.department.map(dep => dep.departmentId)
      : [];
    const divisionIds = Array.isArray(this.data.division)
      ? this.data.division.map(div => div.divisionId)
      : [];

    this.addUpdateDesignationForm.patchValue({
      designationName: this.data.designationName || '',
      departmentId: departmentIds,
      divisionId: divisionIds,
    });
  }
}

  filterDepartment(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.departmentSearchTimeout) {
      clearTimeout(this.departmentSearchTimeout);
    }

    this.departmentSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDepartment = [...this.departmentDropdown];
      } else {
        this.filteredDepartment = this.departmentDropdown.filter((role) => {
          const roleName = (role.departmentName || "").toLowerCase();
          return roleName.includes(searchText);
        });
      }
    }, 300);
  }

  getDepartmentsInfo() {
    this.masterService.getDepartments().subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.departmentDropdown = response;
        this.filteredDepartment = [...this.departmentDropdown];
      },
      error: (error) => {},
    });
  }

  filterDivision(event: any): void {
    const searchText = event.target.value.toLowerCase().trim();

    if (this.divisionSearchTimeout) {
      clearTimeout(this.divisionSearchTimeout);
    }

    this.divisionSearchTimeout = setTimeout(() => {
      if (!searchText) {
        this.filteredDivision = [...this.divisionDropdown];
      } else {
        this.filteredDivision = this.divisionDropdown.filter((role) => {
          const roleName = (role.divisionName || "").toLowerCase();
          return roleName.includes(searchText);
        });
      }
    }, 300);
  }

  getDivision() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this.masterService.getDivision(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.divisionDropdown = response;
        this.filteredDivision = [...this.divisionDropdown];
      },
      error: (error) => {},
    });
  }
}
