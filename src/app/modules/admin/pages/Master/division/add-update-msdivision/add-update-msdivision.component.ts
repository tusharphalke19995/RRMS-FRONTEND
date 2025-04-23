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
  selector: "app-add-update-division",
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
  templateUrl: "./add-update-msdivision.component.html",
  styleUrl: "./add-update-msdivision.component.scss",
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateDivisionComponent {
  addUpdateDivisionForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool:boolean=false;
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateDivisionComponent>,
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
    this.addUpdateDivisionForm = this._formBuilder.group({
      divisionName: ["", Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  divisionSave() {
    if (this.addUpdateDivisionForm.valid) {
      const data = {
        divisionName: this.addUpdateDivisionForm.value.divisionName,
      };
      this.masterService.createDivision(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Division created successfully", "Close", {
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

  divisionUpdate() {
    if (this.addUpdateDivisionForm.valid) {
      const data = {
        divisionName: this.addUpdateDivisionForm.value.divisionName,
      };
      this.masterService.updateDivision(this.data.divisionId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Division Updated successfully", "Close", {
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
      this.addUpdateDivisionForm.patchValue({
        divisionName: userData.divisionName,
      });
    }
  }
}
