import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { TranslocoModule } from "@ngneat/transloco";
import { AuthService } from "app/core/auth/auth.service";
import { MasterService } from "app/modules/admin/pages/Master/master.service";

@Component({
  selector: "auth-division-info",
  styleUrl: "./division-ino.component.scss",
  templateUrl: "./division-info.component.html",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FuseAlertComponent,
    NgIf,
    FormsModule,
    TranslocoModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgFor,
    CommonModule,
  ],
})
export class DivisionInfoComponent implements OnInit {
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  designationRoleForm: UntypedFormGroup;
  showAlert: boolean = false;
  divisionsRoles: any;
  filteredDivisions: any[] = [];
  filteredDepartment = [];
  departmentDropdown = [];
  filteredDivision = [];
  departmentSearchTimeout: any;
  divisionSearchTimeout: any;
  divisionDropdown = [];
  authData: any;
  DivisionIdsUserLogin: [];
  DepartmentIdsUserLogin: [];
  finalSelectedDeptId: any;
  /**
   * Constructor
   */
  constructor(

    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private masterService: MasterService
  ) {
      this.extractDivisionAndDepartmentIds();
  }


   extractDivisionAndDepartmentIds(): void {
     this.authData = this._authService.getAuthData();
    console.log("authData:", this.authData);

    // Extract division and department IDs
    this.DivisionIdsUserLogin = this.authData.Divisions.flatMap(division => division.divisionIds);
    this.DepartmentIdsUserLogin = this.authData.Divisions.flatMap(division => division.departmentIds);

    console.log("DivisionIdsUserLogin:", this.DivisionIdsUserLogin);
    console.log("DepartmentIdsUserLogin:", this.DepartmentIdsUserLogin);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.designationRoleForm = this._formBuilder.group({
      divisionId: ["", [Validators.required]],
      departmentId: ["", [Validators.required]],
    });

    this.getDepartmentsInfo();
    // this.getDivision();
  }

  onDepartmentSelect(data: any) {
    this.getdivisionsFilterByDepartmentId(data)
    sessionStorage.setItem("departmentID", data);
  }

  onDivisionSelect(data: any) {
    sessionStorage.setItem("divisionID", data);
  }

  goToDashbaord() {
    this._router.navigateByUrl("/dashboard");
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
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
    }, 300);
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
          this.designationRoleForm.patchValue({
            departmentId: [singleDeptId],
          });
          sessionStorage.setItem("departmentID", JSON.stringify([singleDeptId]));
        }
      },
      error: (error) => {},
    });
  }

  getDivision() {
    const divisionId = Number(sessionStorage.getItem("divisionID"));
    this.masterService.getDivision(divisionId).subscribe({
      next: (response: any[]) => {
        // Filter divisions by allowed IDs
        this.divisionDropdown = response.filter((res: any) =>
          this.DivisionIdsUserLogin.map(Number).includes(Number(res.divisionId))
        );
        this.filteredDivision = [...this.divisionDropdown];

        if (this.divisionDropdown.length === 1) {
          const singleDivId = this.divisionDropdown[0].divisionId;
          this.designationRoleForm.patchValue({
            divisionId: [singleDivId],
          });
          sessionStorage.setItem("divisionID", JSON.stringify([singleDivId]));
        }
      },
      error: (error) => {},
    });
  }

   getdivisionsFilterByDepartmentId(dpeptID) {
    this.masterService.divisionsFilterByDepartmentId(dpeptID).subscribe({
      next: (response: any) => {
        this.divisionDropdown = response.filter((res: any) =>
          this.DivisionIdsUserLogin.map(Number).includes(Number(res.divisionId))
        );
        this.filteredDivision = [...this.divisionDropdown];

        if (this.divisionDropdown.length === 1) {
          const singleDivId = this.divisionDropdown[0].divisionId;
          this.designationRoleForm.patchValue({
            divisionId: [singleDivId],
          });
          sessionStorage.setItem("divisionID", JSON.stringify([singleDivId]));
        }
      },
      error: (error) => {
        console.error("Error fetching favorites:", error);
      },
    });
  }

}
