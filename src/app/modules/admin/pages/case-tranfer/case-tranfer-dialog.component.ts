import {
  ChangeDetectorRef,
  Component,
  Inject,
  ViewEncapsulation,
} from "@angular/core";
import { CommonModule, NgIf } from "@angular/common";
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslocoModule } from "@ngneat/transloco";
import { SharedService } from "app/shared/shared.service";
import { CaseTransferService } from "./case-transfer.service";
import { MasterService } from "../Master/master.service";
import { Router } from "@angular/router";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "app-case-tranfer-dialog",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgIf,
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
  templateUrl: "./case-tranfer-dialog.component.html",
  styleUrl: "./case-tranfer-dialog.component.scss",
})
export class CaseTransferDialogComponent {
  caseTransferForm: FormGroup;
  contentManagerDropdown: any;
  filteredContentManagers: any[] = [];
  private contentManagerSearchTimeout: any;
  divisionSearchTimeout: any;
  filteredDivision = [];
  divisionDropdown = [];
  caseMetaData: any;
  DivisionIdsUserLogin: [];
  filteredDepartment = [];
  departmentDropdown = [];
  DepartmentIdsUserLogin: [];
  departmentSearchTimeout: any;
    authData: any;
  constructor(
    private masterService: MasterService,
    private _formBuilder: FormBuilder,
    private _caseTransferService: CaseTransferService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,  private _authService: AuthService,
    public dialogRef: MatDialogRef<CaseTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dataService: SharedService
  ) {
    this.extractDivisionAndDepartmentIds();
    this.initiateForm();
    this.getDepartmentsInfo();
  }


   extractDivisionAndDepartmentIds(): void {
     this.authData = this._authService.getAuthData();
    this.DepartmentIdsUserLogin = this.authData.Divisions.flatMap(division => division.departmentIds);
  }

  initiateForm() {
    this.caseTransferForm = this._formBuilder.group({
      divisionId: ["", [Validators.required]],
      departmentId: ["", [Validators.required]],
      remarks: ["", [Validators.required]],
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  caseTransfer(): void {
    let payload = {
      caseDetailsId: this.data.CaseInfoDetailsId,
      toDeptId: this.caseTransferForm.value.departmentId,
      todivisionId: this.caseTransferForm.value.divisionId,
      fromdivisionId: sessionStorage.getItem("divisionID"),
    };
    this._caseTransferService.caseTransferData(payload).subscribe({
      next: (response: any) => {
        this._snackBar.open("Case Transfer saved successfully. ", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.dialogRef.close(true);
        this.router.navigateByUrl("search-document");
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

  getdivisionsFilterByDepartmentId(dpeptID) {
    this.masterService.divisionsFilterByDepartmentId(dpeptID).subscribe({
      next: (response: any) => {
        this.divisionDropdown = response;
        const divisionID = sessionStorage.getItem("divisionID");

        // Filter out the logged-in user's division
        this.filteredDivision = this.divisionDropdown.filter(
          (a: any) => a.divisionId != divisionID
        );
      },
      error: (error) => {
        console.error("Error fetching favorites:", error);
      },
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onDivisionSelect(data: any) {
    console.log("Selected Division ID:", data);
  }

  onDepartmentSelect(data: any) {
    this.getdivisionsFilterByDepartmentId(data);
    sessionStorage.setItem("departmentID", data);
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

      this.cdr.detectChanges();
    }, 300);
  }

  // getDepartmentsInfo() {
  //   this.masterService.getDepartments().subscribe({
  //     next: (response: any[]) => {
  //       // Filter departments by allowed IDs
  //       this.departmentDropdown = response;
  //       this.filteredDepartment = [...this.departmentDropdown];
      
  //     },
  //   });
  // }
    getDepartmentsInfo() {
    this.masterService.getDepartments().subscribe({
      next: (response: any[]) => {
        // Filter departments by allowed IDs

        this.departmentDropdown = response.filter((res: any) =>
          this.DepartmentIdsUserLogin.map(Number).includes(
            Number(res.departmentId)
          )
        );
        this.filteredDepartment = [...this.departmentDropdown];
        // Patch if only one department
        if (this.departmentDropdown.length === 1) {
          const singleDeptId = this.departmentDropdown[0].departmentId;
          this.caseTransferForm.patchValue({
            departmentId: [singleDeptId],
          });
        }
      },
      error: (error) => {},
    });
  }
}
