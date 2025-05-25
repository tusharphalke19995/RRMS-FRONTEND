import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { Subject, takeUntil } from "rxjs";
import { DashbaordService } from "./dashboard.service";
import { AuthService } from "app/core/auth/auth.service";
import { SearchUserService } from "../pages/manage-user/search-userlist/searchUser.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadedFilesComponent } from "../pages/search-document/uploaded-files/uploaded-files.component";
import { fuseAnimations } from "@fuse/animations";
import { SharedService } from "app/shared/shared.service";
import { SplitTagsPipe } from "app/shared/pipes/splitTags";
import { MasterService } from "../pages/Master/master.service";
import { CaseDataApprovalService } from "../pages/case-data-approvals/case-data-approvals.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SearchDocService } from "../pages/search-document/searchDoc.service";
@Component({
  selector: "app-dashbaord",
  templateUrl: "./dashbaord.component.html",
  styleUrl: "./dashbaord.component.scss",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    NgFor,
    NgIf,
    MatTableModule,
    NgClass,
    CurrencyPipe,
    CommonModule,
    UploadedFilesComponent,
    MatTooltipModule,
  ],
})
export class DashbaordComponent implements OnInit, OnDestroy {
  authData: any;
  data: any;
  selectedProject: string = "ACME Corp. Backend App";
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  userTotalCount: number;
  userRoleCount: number;
  currentUserData: any;
  favoritesList: []; // To store favorites
  latestFiles: []; // To store latest used files
  favoritesListViewAll: []; // To store favorites
  latestFileViewAll: []; // To store latest used files
  userList: any;
  pendingApprovalCount: number = 0;
  notificationsCount: number = 0;
  finalDataNotifications: any;
  finalDataCaseReqPending: any;
  finalDataUpladReqPending: any;
  divisionsRoles: any;
  showAdminBool: boolean;
  divisionID: string;
  showChangeDivision: boolean;
  divisionDropdown: any[];
  departmentDropdown: any[];
  selectedDepartmentNames: string[] = [];
  selectedDivisionNames: string[] = [];
  pendingReqAccessCount: any;
  pendingUploadReqCount: number;
  DivisionIdsUserLogin: any;
  DepartmentIdsUserLogin: any;
  isExpanded: boolean[] = [];
  isExpandedFileLatest: boolean[] = [];
  /**
   * Constructor
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private _dashbaordService: DashbaordService,
    private _router: Router,
    private caseDataApprovalService: CaseDataApprovalService,
    private authenticationService: AuthService,
    private _searchUserService: SearchUserService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private masterService: MasterService,
    private _searchDocService: SearchDocService
  ) {
    this.extractDivisionAndDepartmentIds();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getFilesLatest();
    this.getFavouritesInfo();
    this.getCurrentData();
    this.getNotificationsCount();
    this.getContentManagerReqForWkFlow();
    this.getDepartmentsInfo();
    this.getDivision();
    this.checkDesignationObj();
    this.getCasedataUploadApprovalsData();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFavouritesInfo() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._dashbaordService.getFavouritesData(divisionID).subscribe({
      next: (response: any) => {
        this.favoritesListViewAll = response;
        this.favoritesList = response.slice(0, 3);
        console.log("Favorites fetched:", this.favoritesList);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching favorites:", error);
      },
    });
  }

  getFilesLatest() {
    this._dashbaordService.getFilesLatestData().subscribe({
      next: (response: any) => {
        this.latestFileViewAll = response;
        this.latestFiles = response.slice(0, 3); // Store the latest files
        console.log("Latest files fetched:", this.latestFiles);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  getNotificationsCount() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._dashbaordService.getNotificationsCount(divisionID).subscribe({
      next: (response: any[]) => {
        console.log("response Noti", response);
        this.finalDataNotifications = response;
        // Count only unread notifications
        this.notificationsCount = response.filter((n) => !n.is_read).length;
        console.log("Unread notificationsCount Noti", this.notificationsCount);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  // viewImage(data) {
  //   const dialogRef = this.dialog.open(UploadedFilesComponent, {
  //     data: data,
  //     width: "1000px",
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.cdr.detectChanges();
  //   });
  // }

  // viewImageLatesFilesList(data) {
  //   const dialogRef = this.dialog.open(UploadedFilesComponent, {
  //     data: data,
  //     width: "1000px",
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.cdr.detectChanges();
  //   });
  // }

  viewImageLatesFilesList(data) {
    const payload = {
      fileHash: data?.file?.fileHash || data?.fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id: data.caseInfoDetailsId,
    };

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        if (!res) {
          console.error("No file data received");
          return;
        }

        const fileType = res.mime_type || res.type;
        const base64 = res.base64_content;
        const fileName = res.file_name || "document";

        const officeMimeTypes = [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];

        if (officeMimeTypes.includes(fileType)) {
          const blob = this.base64ToBlob(base64, fileType);
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } else {
          // Open UploadedFilesComponent dialog
          const dialogRef = this.dialog.open(UploadedFilesComponent, {
            data: data,
            width: "850px",
            maxWidth: "100vw",
            height: "90vh",
            panelClass: "custom-dialog-class",
          });

          dialogRef.afterClosed().subscribe(() => {
            this.cdr.detectChanges();
          });
        }
      },
      error: (error) => {
        console.error("Error fetching file preview:", error);
      },
    });
  }

  getCurrentData() {
    this._dashbaordService.getCurrentUsers().subscribe({
      next: (response: any) => {
        this.currentUserData = response;

        console.log("currentUserData:", this.currentUserData);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

  getContentManagerReqForWkFlow() {
    let payload = {
      division_id: Number(sessionStorage.getItem("divisionID")),
      department_id: Number(sessionStorage.getItem("departmentID")),
    };
    this._dashbaordService.getContentManagerReqData(payload).subscribe({
      next: (response: any) => {
        this.finalDataCaseReqPending = response.filter(
          (a) => a.status === "pending"
        );

        this.pendingReqAccessCount = this.finalDataCaseReqPending.length;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

  goToActiveUserList(data) {
    this.userList = data.users;
    this.sharedService.setActiveUserData(this.userList);
    this._router.navigateByUrl("dashboard/active-user-list");
  }

  goToPendingReqAccess() {
    this._router.navigateByUrl("request-access");
  }

  goToUploadReqAccess() {
    this._router.navigateByUrl("upload-approval");
  }

  goToNotification() {
    this.sharedService.setNotificationsInfo(this.finalDataNotifications);
    this._router.navigateByUrl("manage-notification");
  }

  viewAllRecentFiles() {
    this.sharedService.setLatestFilesData(this.latestFileViewAll);
    this._router.navigateByUrl("dashboard/latest-files-list");
  }

  viewAllFavouritesFiles() {
    this._router.navigateByUrl("dashboard/recent-favorites-files");
  }

  goToDivision() {
    this._router.navigateByUrl("division-selection");
  }

  checkDesignationObj() {
    if (this.authData.SuperAdmin == true) {
      this.showAdminBool = true;
      this.showChangeDivision = false;
    }
  }

  getHashTags(hashTagString: string): string[] {
    if (!hashTagString) return [];
    return hashTagString.split(" ").filter((tag) => tag.trim() !== "");
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

  getCasedataUploadApprovalsData() {
    let payLoad = {
      division_id: Number(sessionStorage.getItem("divisionID")),
      department_id: Number(sessionStorage.getItem("departmentID")),
    };
    this.caseDataApprovalService.getCasedataUploadApprovals(payLoad).subscribe({
      next: (response: any) => {
        this.finalDataUpladReqPending = response.filter(
          (a) => a.status == "PENDING"
        );

        this.pendingUploadReqCount = this.finalDataUpladReqPending.length;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }

  extractDivisionAndDepartmentIds(): void {
    this.authData = this.authenticationService.getAuthData();
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

  viewImage(data) {
    const payload = {
      fileHash: data?.file?.fileHash || data?.fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id: data.caseInfoDetailsId,
    };

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        if (!res) {
          console.error("No file data received");
          return;
        }

        const fileType = res.mime_type || res.type;
        const base64 = res.base64_content;
        const fileName = res.file_name || "document";

        const officeMimeTypes = [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
           "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];

        if (officeMimeTypes.includes(fileType)) {
          const blob = this.base64ToBlob(base64, fileType);
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } else {
          // Open UploadedFilesComponent dialog
          const dialogRef = this.dialog.open(UploadedFilesComponent, {
            data: data,
            width: "850px",
            maxWidth: "100vw",
            height: "90vh",
            panelClass: "custom-dialog-class",
          });

          dialogRef.afterClosed().subscribe(() => {
            this.cdr.detectChanges();
          });
        }
      },
      error: (error) => {
        console.error("Error fetching file preview:", error);
      },
    });
  }

  base64ToBlob(base64: string, mime: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }
}
