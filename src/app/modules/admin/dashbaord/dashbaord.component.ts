import { CurrencyPipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
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

@Component({
  selector: "app-dashbaord",
  templateUrl: "./dashbaord.component.html",
  styleUrl: "./dashbaord.component.scss",
  encapsulation: ViewEncapsulation.None,
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
  ],
})
export class DashbaordComponent implements OnInit, OnDestroy {
  authData: any;

  data: any;
  selectedProject: string = "ACME Corp. Backend App";
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  userTotalCount: number;
  userRoleCount: number;
  favoritesList: any[] = []; // To store favorites
  latestFiles: any[] = []; // To store latest used files
  /**
   * Constructor
   */
  constructor(
    private _dashbaordService: DashbaordService,
    private _router: Router,
    private authenticationService: AuthService,
    private _searchUserService: SearchUserService
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
    this.prepareFileTypeChart();
    console.log(" this.authData", this.authData);
    // this.getUserInfo();
    // this.getUserRoleDropdown();

    // Attach SVG fill fixer to all ApexCharts
    window["Apex"] = {
      chart: {
        events: {
          mounted: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
          updated: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
        },
      },
    };
  }

  prepareFileTypeChart(): void {
    const fileTypeCounts = this.latestFiles.reduce((acc, file) => {
      acc[file.fileType] = (acc[file.fileType] || 0) + 1;
      return acc;
    }, {});
  
    // Ensure that the data is an array of numbers
    const dataValues = Object.values(fileTypeCounts).map(value => Number(value));
  
   
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Fix the SVG fill references. This fix must be applied to all ApexCharts
   * charts in order to fix 'black color on gradient fills on certain browsers'
   * issue caused by the '<base>' tag.
   *
   * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
   *
   * @param element
   * @private
   */
  private _fixSvgFill(element: Element): void {
    // Current URL
    const currentURL = this._router.url;

    // 1. Find all elements with 'fill' attribute within the element
    // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
    // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
    Array.from(element.querySelectorAll("*[fill]"))
      .filter((el) => el.getAttribute("fill").indexOf("url(") !== -1)
      .forEach((el) => {
        const attrVal = el.getAttribute("fill");
        el.setAttribute(
          "fill",
          `url(${currentURL}${attrVal.slice(attrVal.indexOf("#"))}`
        );
      });
  }



  getFavouritesInfo() {
    this._dashbaordService.getFavouritesData().subscribe({
      next: (response:any) => {
        this.favoritesList = response; // Store the favorites list
        console.log("Favorites fetched:", this.favoritesList);
      },
      error: (error) => {
        console.error("Error fetching favorites:", error);
      },
    });
  }

  getFilesLatest() {
    this._dashbaordService.getFilesLatestData().subscribe({
      next: (response:any) => {
        this.latestFiles = [...response];
        console.log("Latest files fetched:", this.latestFiles);
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }
}
