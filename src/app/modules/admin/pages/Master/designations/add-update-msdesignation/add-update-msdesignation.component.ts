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
  encapsulation: ViewEncapsulation.None
})
export class AddUpdatDesignationRoleComponent {
  addUpdateDesignationForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool:boolean=false;
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdatDesignationRoleComponent>,
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
    this.addUpdateDesignationForm = this._formBuilder.group({
      designationName: ["", Validators.required],
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
      const data = {
        designationName: this.addUpdateDesignationForm.value.designationName,
      };
      this.masterService.updateDesignations(this.data.designationId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Designations Updated successfully", "Close", {
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

  dataPatch(){
    if (this.data) {
      const userData = this.data;
      this.addUpdateDesignationForm.patchValue({
        designationName: userData.designationName,
      });
    }
  }
}
