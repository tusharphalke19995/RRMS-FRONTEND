import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
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
import { Subject } from "rxjs";
import { AddUpdateUserComponent } from "../../manage-user/add-update-user/add-update-user.component";
import { SearchUserService } from "../../manage-user/search-userlist/searchUser.service";
import { SearchDocService } from "../../search-document/searchDoc.service";
import { InventoryVendor } from "../../upload-document/uploadDoc.types";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MasterService } from "../master.service";
import { AddUpdatDesignationHierarchyComponent } from "./add-update-designation-hierarchy/add-update-designation-hierarchy.component";

@Component({
  selector: "app-designations-hierarchy",
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
  templateUrl: "./designations-hierarchy.component.html",
  styleUrl: "./designations-hierarchy.component.scss",
})
export class DesignationHierarchyComponent implements OnInit, AfterViewInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];

  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [
    {
      labelen: "Designation Name",
      labelhi: "Designation Name",
      property: "parent_designation_name",
    },
    {
      labelen: "Department Name",
      labelhi: "Department Name",
      property: "child_designation_name",
    },
   
    // {
    //   labelen: "Action",
    //   labelhi: "Action",
    //   property: "action",
    //   isAction: true,
    // },
  ];

  displayedColumns: string[] = [
      "child_designation_name",
    "parent_designation_name",
    // "action",
  ];
  userRoleDropdown: [];
  designationsDropdown: [];

  /**
   * Constructor
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private _masterService: MasterService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getDesignationHierachyInfo();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort1;
    this.dataSource.paginator = this.paginator1;

    this._changeDetectorRef.detectChanges();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Clear the form
   */
  clearForm(): void {
    // Reset the form
    this.addcitizenInformationNgForm.resetForm();
  }

  SelectDataCase(value) {}

  filterDropDownData(event) {}

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  addDesignationHierachy(data) {
    const dialogRef = this.dialog.open(AddUpdatDesignationHierarchyComponent, {
      data: data,
      width: "800px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this._changeDetectorRef.detectChanges();
      this.getDesignationHierachyInfo();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUser(row: any): void {
    this.addDesignationHierachy(row);
  }

  getDesignationHierachyInfo() {
    this._masterService.getDesignationHierachy().subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.dataSource = new MatTableDataSource(response);
      },
      error: (error) => {},
    });
  }

  //   deleteDesignation(data) {
  //     this._masterService.deleteDesignations(data.designationId).subscribe({
  //     next: (response: any) => {
  //       this._snackBar.open("Role Deleted successfully", "Close", {
  //         duration: 3000,
  //         horizontalPosition: "right",
  //         verticalPosition: "top",
  //         panelClass: ["success-snackbar"],
  //       });
  //       this.getDesignationHierachyInfo();
  //     },
  //     error: (error) => {
  //       this._snackBar.open(error.message || "Error creating user", "Close", {
  //         duration: 3000,
  //         horizontalPosition: "right",
  //         verticalPosition: "top",
  //         panelClass: ["error-snackbar"],
  //       });
  //     },
  //   });

  // }

  getDepartmentNames(row: any): string {
    return Array.isArray(row.department)
      ? row.department.map((dep) => dep.departmentName).join(", ")
      : "";
  }

  getDivisionNames(row: any): string {
    return Array.isArray(row.division)
      ? row.division.map((div) => div.divisionName).join(", ")
      : "";
  }
}
