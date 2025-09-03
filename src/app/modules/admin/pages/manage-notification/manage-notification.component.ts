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
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTabsModule } from "@angular/material/tabs";
import { AuthService } from "app/core/auth/auth.service";

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
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: "./manage-notification.component.html",
  styleUrl: "./manage-notification.component.scss",
})
export class ManageNotificationComponent implements AfterViewInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;
  selectedTabIndex: number = 0;
  readNotifications: any[] = [];
  unreadNotifications: any[] = [];

  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  @ViewChild("sort2") sort2: MatSort;
  @ViewChild("paginator2") paginator2: MatPaginator;
  @ViewChild('tabGroup') tabGroup: any;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  readDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  unreadDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

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
    // "ownerDivision",
    "type",
    "created_at",
    "message",
    "action",
  ];

  // Separate columns for read notifications (without action)
  readDisplayedColumns: string[] = [
    "requestedByDepartments",
    "requestedByDivisions",
    "recipientDepartments",
    // "ownerDivision",
    "type",
    "created_at",
    "message",
  ];
  notificationInfo: any;
  authData: import("/Users/tusharphalke/Documents/Freelancing_Work/RRMS-FRONTEND/src/app/core/auth/auth.service").UserModel;
  currentRole: any;
  showUnreadTab: boolean = true;
  showReadTab: boolean = true;
  constructor(
    private _dialog: MatDialog,
    private notificationService: NotificationService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private _dashbaordService: DashbaordService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private authenticationService: AuthService
  ) {

     this.authData = this.authenticationService.getAuthData();
       this.currentRole = this.authData.Role;
      if(this.currentRole =='User'){
        this.showUnreadTab = false;
        this.showReadTab = true;
        this.selectedTabIndex = 0; // Set to read tab since unread tab will be hidden
      }else{
        this.showUnreadTab = true;
        this.showReadTab = true;
        this.selectedTabIndex = 0;
        }
  }

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
          // Separate read and unread notifications
          this.readNotifications = (response || []).filter((n) => n.is_read === true || n.status === 'approved');
          this.unreadNotifications = (response || []).filter((n) => n.is_read === false && n.status !== 'approved' && n.status !== 'rejected' && n.status !== 'denied');
          // Set initial data based on selected tab
          this.updateDataSource();
          this.logCurrentState();
          this.cdr.detectChanges();
        },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  getNotificationList() {
    this.sharedService.getnotificationData$.subscribe((userInfo: any[]) => {
      // Separate read and unread notifications
      this.readNotifications = (userInfo || []).filter((n) => n.is_read === true || n.status === 'approved');
      this.unreadNotifications = (userInfo || []).filter((n) => n.is_read === false && n.status !== 'approved');
      
      // Set initial data based on selected tab
      this.updateDataSource();
      this.logCurrentState();
      this.cdr.detectChanges();
    });
  }

  updateDataSource(): void {
    // Update both data sources
    this.unreadDataSource = new MatTableDataSource(this.unreadNotifications);
    this.readDataSource = new MatTableDataSource(this.readNotifications);
    
    // Set the current data source based on selected tab and user role
    if (this.currentRole === 'User') {
      // For User role, always show read notifications
      this.dataSource = this.readDataSource;
      this.selectedTabIndex = 0;
    } else {
      // For other roles, show based on selected tab
      if (this.selectedTabIndex === 0) {
        // Unread tab
        this.dataSource = this.unreadDataSource;
      } else {
        // Read tab
        this.dataSource = this.readDataSource;
      }
    }
    
    // Setup pagination after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.setupPagination();
    }, 100);
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    console.log('Tab changed to index:', this.selectedTabIndex);
    
    // Update the current data source based on selected tab
    if (this.currentRole === 'User') {
      // For User role, always show read notifications regardless of tab index
      this.dataSource = this.readDataSource;
    } else {
      // For other roles, show based on selected tab
      if (this.selectedTabIndex === 0) {
        // Unread tab
        this.dataSource = this.unreadDataSource;
      } else {
        // Read tab
        this.dataSource = this.readDataSource;
      }
    }
    
    // Setup pagination for the current tab
    this.setupPagination();
    
    // Ensure proper focus and rendering
    setTimeout(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }, 50);
  }

  // Method to handle tab click events
  onTabClick(tabIndex: number): void {
    console.log('Tab clicked:', tabIndex);
    this.selectedTabIndex = tabIndex;
    
    this.onTabChange({ index: tabIndex });
    
    // Ensure the tab group is properly focused
    if (this.tabGroup) {
      setTimeout(() => {
        this.tabGroup.selectedIndex = tabIndex;
        this.cdr.detectChanges();
      }, 10);
    }
  }

  // Debug method to log current state
  logCurrentState(): void {
    console.log('Current state:', {
      currentRole: this.currentRole,
      showUnreadTab: this.showUnreadTab,
      showReadTab: this.showReadTab,
      selectedTabIndex: this.selectedTabIndex,
      unreadCount: this.unreadNotifications.length,
      readCount: this.readNotifications.length,
      unreadDataSource: this.unreadDataSource?.data?.length,
      readDataSource: this.readDataSource?.data?.length
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

// goToProcess(row: any) {
//   this.router.navigate(['upload-approval'], { queryParams: { object_id: row.object_id } });
// }

 goToProcess(row: any): void {
  console.log('Notification type:', row.type);
  console.log('Object ID:', row.object_id);
  console.log('Status:', row.status);
  
  // Determine the selected tab based on status
  let selectedTab = 0; // Default to pending tab
  
  if (row.status === 'approved') {
    selectedTab = 1; // Approved tab
  } else if (row.status === 'denied' || row.status === 'rejected') {
    selectedTab = 2; // Denied/Rejected tab
  }
  
  // Determine the route based on notification type
  switch (row.type) {
    case 'UPLOAD_APPROVAL':
      this.router.navigate(['upload-approval'], {
        queryParams: { object_id: row.object_id, selectedTab: selectedTab }
      });
      break;
    case 'ACCESS_REQUEST':
      this.router.navigate(['request-access'], {
        queryParams: { object_id: row.object_id, selectedTab: selectedTab }
      });
      break;
    default:
      console.error('Unknown notification type:', row.type);
      // Fallback to upload-approval if type is not recognized
      this.router.navigate(['upload-approval'], {
        queryParams: { object_id: row.object_id, selectedTab: selectedTab }
      });
      break;
  }
  
  // Mark notification as read and refresh data
  // this.markAsRead(row);
}

// markAsRead(notification: any): void {
//   // Update the notification status locally
//   notification.is_read = true;
  
//   // Move from unread to read array
//   const unreadIndex = this.unreadNotifications.findIndex(n => n.id === notification.id);
//   if (unreadIndex > -1) {
//     this.unreadNotifications.splice(unreadIndex, 1);
//     this.readNotifications.unshift(notification); // Add to beginning of read array
//   }
  
//   // Update the data source
//   this.updateDataSource();
  
//   // Show success message
//   this._snackBar.open('Notification marked as read', 'Close', {
//     duration: 2000,
//     horizontalPosition: 'end',
//     verticalPosition: 'top',
//     panelClass: ['green-snackbar']
//   });
// }


  ngAfterViewInit(): void {
    // Ensure proper initialization
    setTimeout(() => {
      this.setupPagination();
      this.cdr.detectChanges();
      
      // Ensure tab group is properly initialized
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = this.selectedTabIndex;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  private setupPagination(): void {
    // Setup pagination for unread data source
    if (this.unreadDataSource && this.paginator1 && this.sort1) {
      this.unreadDataSource.paginator = this.paginator1;
      this.unreadDataSource.sort = this.sort1;
    }
    
    // Setup pagination for read data source
    if (this.readDataSource && this.paginator2 && this.sort2) {
      this.readDataSource.paginator = this.paginator2;
      this.readDataSource.sort = this.sort2;
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }

getDepartmentNames(designationDetail: any): string {
  if (!Array.isArray(designationDetail)) return "";
  // Collect all department arrays from each designation
  const departments = designationDetail
    .flatMap((d: any) => d.department || [])
    .map((dept: any) => dept.departmentName);
  // Remove duplicates
  const uniqueDepartments = Array.from(new Set(departments));
  return uniqueDepartments.join(", ");
}

getDivisionNames(designationDetail: any): string {
  if (!Array.isArray(designationDetail)) return "";
  // Collect all division arrays from each designation
  const divisions = designationDetail
    .flatMap((d: any) => d.division || [])
    .map((div: any) => div.divisionName);
  // Remove duplicates
  const uniqueDivisions = Array.from(new Set(divisions));
  return uniqueDivisions.join(", ");
}

 getUserDivisionNames(designationDetail: any): string {
       if (!Array.isArray(designationDetail)) return "";
       const divisions = designationDetail
         .flatMap((d: any) => d.division || [])
         .map((div: any) => div.divisionName);
       const uniqueDivisions = Array.from(new Set(divisions));
       return uniqueDivisions.join(", ");
     }
}
