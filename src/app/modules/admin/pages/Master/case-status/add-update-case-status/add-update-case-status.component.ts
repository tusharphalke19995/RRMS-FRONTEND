import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterService } from '../../master.service';

@Component({
  selector: 'app-add-update-case-status',
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
   encapsulation: ViewEncapsulation.None,
  templateUrl: './add-update-case-status.component.html',
  styleUrl: './add-update-case-status.component.scss'
})
export class AddUpdateCaseStatusComponent {
  addUpdateCaseStatusForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool:boolean=false;
  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any, 
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateCaseStatusComponent>,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initiateForm();  
    if(this.data){
        this.updateBool= true;
      this.dataPatch();
    }    
  }

  initiateForm() {
    this.addUpdateCaseStatusForm = this._formBuilder.group({
      statusName: ["", Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  saveCaseStatus() {
    if (this.addUpdateCaseStatusForm.valid) {
      const data = {
        statusName: this.addUpdateCaseStatusForm.value.statusName,
      };
      this.masterService.createCaseStatus(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Case Status Created Successfully", "Close", {
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

  updateCaseStatus() {
    if (this.addUpdateCaseStatusForm.valid) {
      const data = {
        statusName: this.addUpdateCaseStatusForm.value.statusName,
      };
        this.masterService.updateCaseStatusById(this.data.statusId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Case Status Updated successfully", "Close", {
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
      this.addUpdateCaseStatusForm.patchValue({
        statusName: userData.statusName,
      });
    }
  }
}
