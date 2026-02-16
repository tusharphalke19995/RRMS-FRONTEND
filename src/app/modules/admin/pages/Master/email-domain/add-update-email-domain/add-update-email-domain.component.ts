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
  selector: 'app-add-update-email-domain',
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
  templateUrl: './add-update-email-domain.component.html',
  styleUrl: './add-update-email-domain.component.scss'
})
export class AddUpdateEmailDomainComponent {
  emailDomainForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [];
  divisionDropdown = [];
  designationsDropdown = [];
  updateBool:boolean=false;
  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any, 
    private masterService: MasterService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateEmailDomainComponent>,
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
    this.emailDomainForm = this._formBuilder.group({
      domainName: ["", Validators.required],
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected() {}

  saveEmailDomain() {
    if (this.emailDomainForm.valid) {
      const data = {
        domainName: this.emailDomainForm.value.domainName,
      };
      this.masterService.createDomain(data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Domain Created Successfully", "Close", {
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

  updateEmailDomain() {
    if (this.emailDomainForm.valid) {
      const data = {
        domainId:this.data.domainId,
        domainName: this.emailDomainForm.value.domainName,
      };
        this.masterService.updateDomainById(this.data.domainId,data).subscribe({
        next: (response: any) => {
          this._snackBar.open("Domain Updated successfully", "Close", {
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
      this.emailDomainForm.patchValue({
        domainName: userData.domainName
      });
    }
  }

}
