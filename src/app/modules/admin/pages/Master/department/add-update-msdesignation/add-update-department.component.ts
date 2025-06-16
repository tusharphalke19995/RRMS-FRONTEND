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
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MasterService } from "../../master.service";

@Component({
  selector: "app-add-update-department",
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
  templateUrl: "./add-update-department.component.html",
  styleUrl: "./add-update-department.component.scss",
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateDepartmentComponent {
  addUpdateDepartmentForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool:boolean=false;
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateDepartmentComponent>,
    private _snackBar: MatSnackBar,
     @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    if(this.data){
      this.updateBool = true;
      this.dataPatch();
    }    
  }

  initiateForm() {
    this.addUpdateDepartmentForm = this._formBuilder.group({
      departmentName: ["", Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  departmentSave() {
    if (this.addUpdateDepartmentForm.valid) {
      const data = {
        departmentName: this.addUpdateDepartmentForm.value.departmentName,
      };
      this.masterService.createDepartments(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Department created successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
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
    if (this.addUpdateDepartmentForm.valid) {
      const data = {
        departmentName: this.addUpdateDepartmentForm.value.departmentName,
      };
      this.masterService.updatDepartmentById(this.data.departmentId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Department Updated successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
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

  dataPatch(){
    if (this.data) {
      const userData = this.data;
      this.addUpdateDepartmentForm.patchValue({
        departmentName: userData.departmentName,
      });
    }
  }
}
