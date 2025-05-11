import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
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
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { SharedService } from "app/shared/shared.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadedFilesComponent } from "../search-document/uploaded-files/uploaded-files.component";
import { NotificationService } from "./notification.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { DashbaordService } from "../../dashbaord/dashboard.service";

@Component({
  selector: "app-manage-notification",
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
    CommonModule,
  ],
  templateUrl: "./manage-notification.component.html",
  styleUrl: "./manage-notification.component.scss",
})
export class ManageNotificationComponent implements AfterViewInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;

  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  columns: any[] = [
    {
      labelen: "File Name",
      labelhi: "File Name",
      property: "fileName",
    },
    {
      labelen: "Notification",
      labelhi: "Notification",
      property: "created_at",
    },
    { labelen: "Date", labelhi: "Date", property: "message" },
    {
      labelen: "classification_name",
      labelhi: "classification_name",
      property: "classification_name",
    },
    { labelen: "Read Status", labelhi: "Read Status", property: "is_read" },
    { labelen: "Action", labelhi: "Action", property: "action" },
  ];

  displayedColumns: string[] = [
    "requestedByDepartments",
    "requestedByDivisions",
    "recipientDepartments",
    "recipientDivisions",
    "created_at",
    "message",
    "is_read",
    "action",
  ];
  notificationInfo: any;
  constructor(
    private _dialog: MatDialog,
    private notificationService: NotificationService,
    private sharedService: SharedService,

    private cdr: ChangeDetectorRef,
    private _dashbaordService: DashbaordService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  /**
   * On init
   */
  ngOnInit(): void {
    this.getNotificationList();
    this.getNotificationsCount();
  }

  getNotificationsCount() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._dashbaordService.getNotificationsCount(divisionID).subscribe({
      next: (response: any[]) => {
        const onlyRead = (response || []).filter((n) => n.is_read === false);
        this.dataSource = new MatTableDataSource(onlyRead);
        this.setupPagination();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  getNotificationList() {
    this.sharedService.getnotificationData$.subscribe((userInfo: any[]) => {
      const onlyRead = (userInfo || []).filter((n) => n.is_read === false);
      this.notificationInfo = onlyRead;
      this.dataSource = new MatTableDataSource(this.notificationInfo);
      this.setupPagination();
      this.cdr.detectChanges();
    });
  }

  viewImage(data) {
    const dialogRef = this._dialog.open(UploadedFilesComponent, {
      data: data,
      width: "1000px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.cdr.detectChanges();
    });
  }

goToProcess(row: any) {
  this.router.navigate(['upload-approval'], { queryParams: { object_id: row.object_id } });
}

  ngAfterViewInit(): void {
    this.setupPagination();
  }

  private setupPagination(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator1;
      this.dataSource.sort = this.sort1;
      this.cdr.detectChanges();
    }
  }

  getDepartmentNames(designationDetail: any): string {
    if (!designationDetail?.department) return "";
    return designationDetail.department
      .map((d: any) => d.departmentName)
      .join(", ");
  }

  getDivisionNames(designationDetail: any): string {
    if (!designationDetail?.division) return "";
    return designationDetail.division
      .map((d: any) => d.divisionName)
      .join(", ");
  }
}
