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
    TranslocoModule
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
    filteredDepartment = [];
    departmentDropdown = [];
  updateBool:boolean=false;
    private departmentSearchTimeout: any;
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateDivisionComponent>,
    private _snackBar: MatSnackBar,
     @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getDepartmentsInfo();    
    if(this.data){
      this.updateBool = true;
      this.dataPatch();
    }  
  }

  initiateForm() {
    this.addUpdateDivisionForm = this._formBuilder.group({
      divisionName: ["", Validators.required],
      departmentId:["",Validators.required]
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
        departmentId:this.addUpdateDivisionForm.value.departmentId
      };
      this.masterService.createDivision(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Division created successfully", "Close", {
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

  divisionUpdate() {
    if (this.addUpdateDivisionForm.valid) {
      const data = {
        divisionName: this.addUpdateDivisionForm.value.divisionName,
        departmentId:this.addUpdateDivisionForm.value.departmentId
      };
      this.masterService.updateDivision(this.data.divisionId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Division Updated successfully", "Close", {
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

  dataPatch() {
  if (this.data) {
    let departmentId = '';
    if (Array.isArray(this.data.department) && this.data.department.length > 0) {
      departmentId = this.data.department[0].departmentId;
    } else if (this.data.departmentId) {
      departmentId = this.data.departmentId;
    }

    this.addUpdateDivisionForm.patchValue({
      divisionName: this.data.divisionName || '',
      departmentId: departmentId
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
        this.filteredDepartment = this.departmentDropdown.filter(role => {
          const roleName = (role.departmentName || '').toLowerCase();
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
}
