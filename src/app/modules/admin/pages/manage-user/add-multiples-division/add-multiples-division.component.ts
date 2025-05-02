import { Component,ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { SearchUserService } from '../search-userlist/searchUser.service';


@Component({
  selector: 'app-add-multiples-divsion',
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
  templateUrl: './add-multiples-division.component.html',
  styleUrl: './add-multiples-division.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AddMultiplesDivisionComponent {
  addDivisionForm: UntypedFormGroup;
  hidePassword: boolean = true;
  userRoleDropdown = [
  ]
  divisionDropdown = [];
  designationsDropdown = [];
  constructor(
    private _searchUserService: SearchUserService,
    private _formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddMultiplesDivisionComponent>,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initiateForm();
    this.getUserRoleDropdown();
    this.getDivisionDropdown();
    this.getDesignationsData();
    
  }

  initiateForm() {
    this.addDivisionForm = this._formBuilder.group({
      divisionId:["",Validators.required],
      roleId: [""],
      designationId:[""],
    });
  }

  onNoClose(): void {
    this.dialogRef.close(); 
  }

  

  reqRejected() {}


  getUserRoleDropdown() {
    const divisionID = Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getUserRole(divisionID).subscribe({
      next: (response: any) => {
        if(response){
          this.userRoleDropdown= response.responseData;
        }
      },
      error: (error) => {},
    });
  }

  getDivisionDropdown() {
    const divisionId =Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDivision(divisionId).subscribe({
      next: (response: any) => {
        if(response){
          this.divisionDropdown= response;
        }
      },
      error: (error) => {},
    });
  }

  getDesignationsData() {
    const divisionId =Number(sessionStorage.getItem('divisionID'));
    this._searchUserService.getDesignationsInfo(divisionId).subscribe({
      next: (response: any) => {
        if(response){
          this.designationsDropdown= response;
        }
      },
      error: (error) => {},
    });
  }


  addDivision() {
    if (this.addDivisionForm.valid) {
      const data = {
        roleId: Number(this.addDivisionForm.value.roleId),
        divisionId:this.addDivisionForm.value.divisionId,
        designationId:this.addDivisionForm.value.designationId,
      };
      this.dialogRef.close(this.addDivisionForm.value);
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
