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
  userList: any;
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
      next: (response:any) => {
        this.favoritesList = response; // Store the favorites list
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
      next: (response:any) => {
        this.latestFiles = response;
        console.log("Latest files fetched:", this.latestFiles);
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

    viewAll(){

    }

    getCurrentData() {
      this._dashbaordService.getCurrentUsers().subscribe({
        next: (response:any) => {
          this.currentUserData = response;
          console.log("currentUserData:", this.currentUserData);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching latest files:", error);
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
      // this.sharedService.setActiveUserData(this.userList);
      this._router.navigateByUrl("manage-notification")
    }

    viewAllRecentFiles(data){
      this.sharedService.setLatestFilesData(data);
      this._router.navigateByUrl("dashboard/latest-files-list")
    }
    
    viewAllFavouritesFiles(favData){
      this.sharedService.setRecentFavFilesData(favData);
      this._router.navigateByUrl("dashboard/recent-favorites-files")
    }
}
