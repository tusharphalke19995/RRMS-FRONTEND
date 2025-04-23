
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
import { SearchUserService } from "../../manage-user/search-userlist/searchUser.service";
import { ManageroleService } from "../search-user-role/managerole.service";

  @Component({
    selector: "app-manage-user-role-dialog",
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
    templateUrl: './manage-user-role-dialog.component.html',
    styleUrl: './manage-user-role-dialog.component.scss',
    encapsulation: ViewEncapsulation.None
  })
  export class ManageUserRoleDialogComponent {
    updateRoleForm: UntypedFormGroup;
    hidePassword: boolean = true;
    userRoleDropdown = [];
    divisionDropdown = [];
    designationsDropdown=[];
    constructor(
      private _manageroleService: ManageroleService,
      private _formBuilder: UntypedFormBuilder,
      public dialogRef: MatDialogRef<ManageUserRoleDialogComponent>,
      private _snackBar: MatSnackBar,
      @Inject(MAT_DIALOG_DATA) public data: any 
    ) {}

    ngOnInit(): void {
      this.initiateForm();
      this.getUserRoleDropdown();
      this.getDivisionDropdown();
      this.getDesignationsDropDown();
      if(this.data){
        this.dataPatch();
      }
   
      
    }

    initiateForm() {
      this.updateRoleForm = this._formBuilder.group({
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        divisionId:["",Validators.required],
        emailID: ["", [Validators.required, Validators.email]],
        kgid: ["", Validators.required],
        roleId: ["", Validators.required],
        designationId:[""]
      });
    }

    onNoClose(): void {
      this.dialogRef.close({ data: false });
    }

    reqRejected() {}


    getUserRoleDropdown() {
      this._manageroleService.getUserRole().subscribe({
        next: (response: any) => {
          if(response.statusCode==200){
            this.userRoleDropdown= response.responseData;
          }
        },
        error: (error) => {},
      });
    }

    getDivisionDropdown() {
      this._manageroleService.getUserDivision().subscribe({
        next: (response: any) => {
          if(response.statusCode==200){
            this.divisionDropdown= response.responseData;
          }
        },
        error: (error) => {},
      });
    }

    getDesignationsDropDown() {
      this._manageroleService.getDesignationsInfo().subscribe({
        next: (response: any) => {
          if(response.statusCode==200){
            this.designationsDropdown= response.responseData;
          }
        },
        error: (error) => {},
      });
    }

    updateRoleDetailsByRoleID() {
      const userData = this.data;
      if (this.updateRoleForm.valid) {
        const kgid_user = userData.kgid; 
        const data = {
            roleId: Number(this.updateRoleForm.value.roleId)
        };

        this._manageroleService.updateRole(kgid_user, data).subscribe({
          next: (response: any) => {
            this._snackBar.open("Role Updated successfully", "Close", {
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
      this.updateRoleForm.patchValue({
          firstName: userData.first_name,
          lastName: userData.last_name,
          emailID: userData.email,
          kgid: userData.kgid,
          roleId: userData.roleId,
          divisionId: userData.divisionId,
          designationId:userData.designationId,
      });
      this.updateRoleForm.get('firstName').disable();
      this.updateRoleForm.get('lastName').disable();
      this.updateRoleForm.get('emailID').disable();
      this.updateRoleForm.get('kgid').disable();
      this.updateRoleForm.get('divisionId').disable(); 
      this.updateRoleForm.get('designationId').disable();    
    }
  }
  }
