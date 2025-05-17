import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
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
  UntypedFormGroup,
  NgForm,
  UntypedFormBuilder,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { SearchUserService } from "app/modules/admin/pages/manage-user/search-userlist/searchUser.service";
import { MasterService } from "app/modules/admin/pages/Master/master.service";
import { SearchDocService } from "app/modules/admin/pages/search-document/searchDoc.service";
import { InventoryVendor } from "app/modules/admin/pages/upload-document/uploadDoc.types";
import { SharedService } from "app/shared/shared.service";
import { Subject } from "rxjs";
import { UploadedFilesComponent } from "app/modules/admin/pages/search-document/uploaded-files/uploaded-files.component";

@Component({
  selector: "app-latest-files",
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
  templateUrl: "./latest-files.component.html",
  styleUrl: "./latest-files.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class LatestFilesComponent implements OnInit, AfterViewInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];
  isExpanded: boolean[] = [];
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [
    { labelen: "File Name", labelhi: "File Name", property: "fileName" },
    { labelen: "Hash Tag", labelhi: "Hash Tag", property: "hashTag" },
    { labelen: "Subject", labelhi: "Subject", property: "subject" },
    {
      labelen: "File Type",
      labelhi: "File Type",
      property: "fileType",
    },
    {
      labelen: "Classification",
      labelhi: "Classification",
      property: "classification",
    },
  ];

  displayedColumns: string[] = [
    "fileName",
    "hashTag",
    "subject",
    "filetypeName",
    "classificationName",
  ];
  userRoleDropdown: [];
  designationsDropdown: [];
  latestFilesInfo: any;
  /**
   * Constructor
   */
  constructor(
    private _snackBar: MatSnackBar,
    private _searchUserService: SearchUserService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
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
    this.getLatestFilesInfo();
  }

  getLatestFilesInfo() {
    this.sharedService.latesFileData$.subscribe((userInfo: any) => {
      this.latestFilesInfo = userInfo;
      // console.log(" this.latestFilesInfo ", this.latestFilesInfo);
      this.dataSource = new MatTableDataSource(this.latestFilesInfo);
    });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewImage(data) {
    const dialogRef = this.dialog.open(UploadedFilesComponent, {
      data: data,
      width: "1000px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.cdr.detectChanges();
    });
  }

  getHashTags(hashTagString: string): string[] {
    if (!hashTagString) return [];
    return hashTagString.split(" ").filter((tag) => tag.trim() !== "");
  }

  truncateText(text: string, limit: number): any {
    if (text.length > limit) {
      return {
        truncatedText: text.substring(0, limit) + "...",
        showMore: true,
      };
    }
    return { truncatedText: text, showMore: false };
  }

  toggleDetails(rowIndex: number, event: Event): void {
    event.preventDefault();
    this.isExpanded[rowIndex] = !this.isExpanded[rowIndex];
  }
}
