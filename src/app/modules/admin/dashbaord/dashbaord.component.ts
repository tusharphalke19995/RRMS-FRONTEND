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
  DivisionIdsUserLogin: [];
  DepartmentIdsUserLogin: [];
  departmentDropdown: any[];
  selectedDepartmentNames: string[] = [];
  selectedDivisionNames: string[] = [];
  pendingReqAccessCount: any;
  pendingUploadReqCount:number;
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
    private masterService: MasterService
  ) {
   this.extractDivisionAndDepartmentIds();
  }


  extractDivisionAndDepartmentIds(): void {
     this.authData = this.authenticationService.getAuthData();
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
      this.notificationsCount = response.filter(n => !n.is_read).length;
      console.log("Unread notificationsCount Noti", this.notificationsCount);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error("Error fetching latest files:", error);
    },
  });
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

  viewImageLatesFilesList(data) {
    const dialogRef = this.dialog.open(UploadedFilesComponent, {
      data: data,
      width: "1000px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.cdr.detectChanges();
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
    let payload={
       division_id : Number(sessionStorage.getItem("divisionID")),
        department_id: Number(sessionStorage.getItem("departmentID"))
    }
    this._dashbaordService.getContentManagerReqData(payload).subscribe({
      next: (response: any) => {
        this.finalDataCaseReqPending = response.filter((a=>a.status==="pending"))
        
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
    }
    // this.divisionsRoles = this.authenticationService.getAuthData();
    // this.divisionsRoles.DivisionsRoles.forEach((element) => {
    //   if (element.role_name === "Admin") {
    //     this.showAdminBool = true;
    //   } else {
    //     this.showAdminBool = false;
    //   }
    // });
    const rolesLength = this.divisionsRoles.DivisionsRoles.length;
    if (rolesLength > 1) {
      this.showChangeDivision = true;
    } else {
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
        this.DepartmentIdsUserLogin.map(Number).includes(Number(res.departmentId))
      );
      const selectedDepartmentIds = sessionStorage.getItem("departmentID");
      const selectedDepartments = this.departmentDropdown.filter((d) =>
        selectedDepartmentIds.includes((d.departmentId))
      );
      this.selectedDepartmentNames = selectedDepartments.map((d) => d.departmentName);
    },
    error: (error) => {},
  });
}

getDivision() {
  this.masterService.getDivision(Number(sessionStorage.getItem("divisionID"))).subscribe({
    next: (response: any[]) => {
      this.divisionDropdown = response.filter((res: any) =>
        this.DivisionIdsUserLogin.map(Number).includes(Number(res.divisionId))
      );
      const selectedDivisionIds = sessionStorage.getItem("divisionID");
      const selectedDivisions = this.divisionDropdown.filter((d) =>
        selectedDivisionIds.includes((d.divisionId))
      );
      this.selectedDivisionNames = selectedDivisions.map((d) => d.divisionName);
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
        this.finalDataUpladReqPending = response.filter((a=>a.status=="PENDING"))
        
        this.pendingUploadReqCount = this.finalDataUpladReqPending.length;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching current users:", error);
      },
    });
  }
}
