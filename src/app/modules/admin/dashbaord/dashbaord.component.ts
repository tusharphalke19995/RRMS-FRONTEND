import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf } from "@angular/common";
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
import { fuseAnimations } from '@fuse/animations';
import { SharedService } from "app/shared/shared.service";
import { SplitTagsPipe } from "app/shared/pipes/splitTags";
@Component({
  selector: "app-dashbaord",
  templateUrl: "./dashbaord.component.html",
  styleUrl: "./dashbaord.component.scss",
  encapsulation: ViewEncapsulation.None,
  animations     : fuseAnimations,
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
    UploadedFilesComponent
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
  finalDataNotifications :any;
  /**
   * Constructor
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private _dashbaordService: DashbaordService,
    private _router: Router,
    private authenticationService: AuthService,
    private _searchUserService: SearchUserService,
        private dialog: MatDialog,
        private sharedService:SharedService
  ) {
    this.authData = this.authenticationService.getAuthData();
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
    this._dashbaordService.getFavouritesData().subscribe({
        next: (response: any) => {
          this.favoritesListViewAll =response;
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
            this.latestFileViewAll =response;
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
    this._dashbaordService.getNotificationsCount().subscribe({
        next: (response: any) => {
          console.log("response Noti",response);
          this.finalDataNotifications = response;
          this.notificationsCount = response.length;
          console.log("notificationsCount Noti",this.notificationsCount)
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
          this.pendingApprovalCount = response.pendingApprovalCount;
          
          console.log("currentUserData:", this.currentUserData);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching current users:", error);
        },
      });
    }
  
    goToActiveUserList(data){
      this.userList = data.users;
      this.sharedService.setActiveUserData(this.userList);
      this._router.navigateByUrl("dashboard/active-user-list")
    }

    goToPendingApproval(){
      // this.sharedService.setActiveUserData(this.userList);
      this._router.navigateByUrl("dashboard/pending-approval-list")
    }

    goToNotification(){
      this.sharedService.setNotificationsInfo(this.finalDataNotifications);
      this._router.navigateByUrl("manage-notification")
    }

    viewAllRecentFiles(){
      this.sharedService.setLatestFilesData(this.latestFileViewAll);
      this._router.navigateByUrl("dashboard/latest-files-list")
    }
    
    viewAllFavouritesFiles(){
      this._router.navigateByUrl("dashboard/recent-favorites-files")
    }
}
