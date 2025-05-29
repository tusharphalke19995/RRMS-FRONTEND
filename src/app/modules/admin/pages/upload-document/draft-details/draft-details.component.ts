import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
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
  UntypedFormBuilder,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";
import { SharedService } from "app/shared/shared.service";
import { MasterService } from "../../Master/master.service";
import { UploadDocumentService } from "../uploadDoc.service";
@Component({
  selector: "app-draft-details",
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
  templateUrl: "./draft-details.component.html",
  styleUrl: "./draft-details.component.scss",
})
export class DraftDetailsComponent {
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  alert: { type: string; message: string };
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any>;
  columns: any[] = [
    { labelen: "Status Name", labelhi: "Status Name", property: "statusName" },
    {
      labelen: "Action",
      labelhi: "Action",
      property: "action",
      isAction: true,
    },
  ];

  displayedColumns: string[] = [
    "firNo",
    "caseNo",
    "caseStatusName",
    "unitName",
    "action",
  ];

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _uploadDocumentService: UploadDocumentService,
    private _snackBar: MatSnackBar,
    private dataService: SharedService,
    private _router: Router,
    private _masterService: MasterService,
    private authenticationService: AuthService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getDraftData();
  }

  getDraftData() {
    this._uploadDocumentService.getCaseDataDraftsData().subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.dataSource = new MatTableDataSource(response);
      },
      error: (error) => {},
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  editDraft(data: any) {
    console.log("editDraft",data)
    this._uploadDocumentService.setDraftData(data, false);
    this._router.navigateByUrl("upload-document");
  }
}
