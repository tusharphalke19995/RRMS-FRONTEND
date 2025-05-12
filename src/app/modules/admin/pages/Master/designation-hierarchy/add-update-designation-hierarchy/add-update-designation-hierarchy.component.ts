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
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";

@Component({
  selector: "app-add-update-designation-hierarchy",
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
     MatTableModule,
        MatPaginatorModule,
        MatSortModule,
    TranslocoModule,
  ],
  templateUrl: "./add-update-designation-hierarchy.component.html",
  styleUrl: "./add-update-designation-hierarchy.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class AddUpdatDesignationHierarchyComponent {
  addUpdateDesignationHierachyForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  designationsChildDropdown = [];
  designationsParentDropdown = [];
  updateBool: boolean = false;
  filterDesignationsParent = [];
  filterDesignationschild = [];
  designationsParentSearchTimeout: any;
  designationsChildSearchTimeout: any;
  selectedDesignation: any = null;
departmentMeta: any[] = [];
divisionMeta: any[] = [];
  constructor(
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdatDesignationHierarchyComponent>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getDesignationsParent();
    // this.getDesignationsChild();
    if (this.data) {
      this.updateBool = true;
      this.dataPatch();
    }
  }

  initiateForm() {
    this.addUpdateDesignationHierachyForm = this._formBuilder.group({
      designationParentId: ["", Validators.required],
      designationChildId: ["", Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  designationHierachySave() {
    if (this.addUpdateDesignationHierachyForm.valid) {
      const data = {
        parent_designation: this.addUpdateDesignationHierachyForm.value.designationParentId,
        child_designation: this.addUpdateDesignationHierachyForm.value.designationChildId,
      };
      this.masterService.createDesignationHierachy(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Designations Hierachy created successfully", "Close", {
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

designationHierachyUpdate() {
  if (this.addUpdateDesignationHierachyForm.valid) {
    const formValue = this.addUpdateDesignationHierachyForm.value;
    const updatePayload = {
      designationParentId: formValue.designationParentId,
      divisionIds: formValue.designationChildId
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
    this.addUpdateDesignationHierachyForm.reset();

    this.addUpdateDesignationHierachyForm.patchValue({
      designationParentId: this.data.parent_designation ?? null,
      designationChildId: this.data.child_designation ?? null,
    });
    const designationIdToSelect = this.data.child_designation ?? this.data.designationChildId ?? this.data.id;
    if (
      designationIdToSelect !== undefined &&
      designationIdToSelect !== null &&
      Array.isArray(this.filterDesignationsParent) &&
      this.filterDesignationsParent.length > 0
    ) {
      this.onDesignationSelect(designationIdToSelect);
    } else {
    }
  }
}

  filterDesignationParent(event: any): void {
  const searchText = event.target.value.toLowerCase().trim();

  if (this.designationsParentSearchTimeout) {
    clearTimeout(this.designationsParentSearchTimeout);
  }

  this.designationsParentSearchTimeout = setTimeout(() => {
    if (!searchText) {
      this.filterDesignationsParent = [...this.designationsParentDropdown];
    } else {
      this.filterDesignationsParent = this.designationsParentDropdown.filter((role) => {
        const designationName = (role.designationName || "").toLowerCase();
        return designationName.includes(searchText);
      });
    }
  }, 300);
}

  getDesignationsParent() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this.masterService.getDesignationsInfo(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.designationsParentDropdown = response;
        this.designationsChildDropdown = response;
        this.filterDesignationsParent = [...this.designationsParentDropdown];
        this.filterDesignationschild = [...this.designationsChildDropdown];
         if (this.data) {
    const designationIdToSelect = this.data.parent_designation;
    if (designationIdToSelect !== undefined && designationIdToSelect !== null) {
      this.onDesignationSelect(designationIdToSelect);
    }
  }
      },
      error: (error) => {},
    });
  }

  // filterDesignationDataChild(event: any): void {
  //   const searchText = event.target.value.toLowerCase().trim();

  //   if (this.designationsChildSearchTimeout) {
  //     clearTimeout(this.designationsChildSearchTimeout);
  //   }

  //   this.designationsChildSearchTimeout = setTimeout(() => {
  //     if (!searchText) {
  //       this.filterDesignationschild = [...this.designationsChildDropdown];
  //     } else {
  //       this.filterDesignationschild = this.designationsChildDropdown.filter((role) => {
  //         const roleName = (role.divisionName || "").toLowerCase();
  //         return roleName.includes(searchText);
  //       });
  //     }
  //   }, 300);
  // }

  filterDesignationDataChild(event: any): void {
  const searchText = event.target.value.toLowerCase().trim();

  if (this.designationsChildSearchTimeout) {
    clearTimeout(this.designationsChildSearchTimeout);
  }

  this.designationsChildSearchTimeout = setTimeout(() => {
    if (!searchText) {
      this.filterDesignationschild = [...this.designationsChildDropdown];
    } else {
      this.filterDesignationschild = this.designationsChildDropdown.filter((role) => {
        const designationName = (role.designationName || "").toLowerCase();
        return designationName.includes(searchText);
      });
    }
  }, 300);
}
  getDesignationsChild() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this.masterService.getDesignationsInfo(divisionId).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.designationsChildDropdown = response;
        this.filterDesignationschild = [...this.designationsChildDropdown];
      },
      error: (error) => {},
    });
  }

  onDesignationSelect(designationId: number) {
  this.selectedDesignation = this.filterDesignationsParent.find(
    d => d.designationId === designationId
  );
  this.departmentMeta = this.selectedDesignation?.department || [];
  this.divisionMeta = this.selectedDesignation?.division || [];
}

getGroupedOfficerDetails() {
  const grouped: { [dept: string]: any[] } = {};
  this.divisionMeta.forEach(div => {
    if (!grouped[div.department]) {
      grouped[div.department] = [];
    }
    grouped[div.department].push(div);
  });
  return grouped;
}
}
