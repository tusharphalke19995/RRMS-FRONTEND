import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  ReactiveFormsModule,
  FormsModule,
  NgForm,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject } from "rxjs";
import { AddUpdateCaseFilesTypeComponent } from "../../Master/case-files/add-update-case-files/add-update-case-files.component";
import { MasterService } from "../../Master/master.service";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { InventoryVendor } from "../../upload-document/uploadDoc.types";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "app-user-info",
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    MatSelectModule,
    MatDatepickerModule,
    TranslocoModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    MatRippleModule,
    CurrencyPipe,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: "./user-info.component.html",
  styleUrl: "./user-info.component.scss",
})
export class UserInfoComponent implements OnInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];
  authData: any;
  DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;
  showChangeDivision: boolean;
  departmentDropdown: any[];
    selectedDepartmentNames: string[] = [];
  selectedDivisionNames: string[] = [];
  constructor(private authenticationService: AuthService, private masterService:MasterService) {}
  ngOnInit(): void {
    this.extractDivisionAndDepartmentIds();
    this.getDivision();
    this.getDepartmentsInfo();
  }

  extractDivisionAndDepartmentIds(): void {
    this.authData = this.authenticationService.getAuthData();
    console.log(" this.authData ", this.authData  )
    this.DivisionIdsUserLogin = this.authData.Divisions.flatMap(
      (division) => division.divisionIds
    );
    this.DepartmentIdsUserLogin = this.authData.Divisions.flatMap(
      (division) => division.departmentIds
    );

    if (this.DivisionIdsUserLogin.length === 1) {
      this.showChangeDivision = true;
    } else {
      this.showChangeDivision = true;
    }

    if (this.DepartmentIdsUserLogin.length === 1) {
      this.showChangeDivision = false;
    } else {
      this.showChangeDivision = true;
    }
  }


  getDepartmentsInfo() {
    this.masterService.getDepartments().subscribe({
      next: (response: any[]) => {
        this.departmentDropdown = response.filter((res: any) =>
          this.DepartmentIdsUserLogin.map(Number).includes(
            Number(res.departmentId)
          )
        );
        const selectedDepartmentIds = sessionStorage.getItem("departmentID");
        const selectedDepartments = this.departmentDropdown.filter((d) =>
          selectedDepartmentIds.includes(d.departmentId)
        );
        this.selectedDepartmentNames = selectedDepartments.map(
          (d) => d.departmentName
        );
      },
      error: (error) => {},
    });
  }

  getDivision() {
    this.masterService
      .getDivision(Number(sessionStorage.getItem("divisionID")))
      .subscribe({
        next: (response: any[]) => {
          this.divisionDropdown = response.filter((res: any) =>
            this.DivisionIdsUserLogin.map(Number).includes(
              Number(res.divisionId)
            )
          );
          const selectedDivisionIds = sessionStorage.getItem("divisionID");
          const selectedDivisions = this.divisionDropdown.filter((d) =>
            selectedDivisionIds.includes(d.divisionId)
          );
          this.selectedDivisionNames = selectedDivisions.map(
            (d) => d.divisionName
          );
        },
        error: (error) => {},
      });
  }

}
