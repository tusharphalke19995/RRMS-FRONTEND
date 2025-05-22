import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "app/core/auth/auth.service";
import { NotificationsService } from "app/layout/common/notifications/notifications.service";
import { Notification } from "app/layout/common/notifications/notifications.types";
import { DashbaordService } from "app/modules/admin/dashbaord/dashboard.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "notifications",
  templateUrl: "./notifications.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "notifications",
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    MatIconModule,
    MatTooltipModule,
    NgFor,
    NgClass,
    NgTemplateOutlet,
    RouterLink,
    DatePipe,
  ],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @ViewChild("notificationsOrigin") private _notificationsOrigin: MatButton;
  @ViewChild("notificationsPanel")
  private _notificationsPanel: TemplateRef<any>;

  notifications: any[];
  notificationsData: any[];
  unreadCount: number = 0;
  private _overlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  canViewNotifications = false;
  navigation: any[] = []; // your actual navigation list
  authData = {
    SuperAdmin: false,
    DivisionsRoles: [],
  };
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsService: NotificationsService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private _dashbaordService: DashbaordService,
    private router: Router,
    private authenticationService: AuthService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getNotificationsCount();
    // Subscribe to notification changes
    // this._notificationsService.notifications$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((notifications: Notification[]) => {
    //     // Load the notifications
    //     this.notifications = notifications;

    //     // Calculate the unread count

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });
    this.setNotificationVisibility();
  }

  setNotificationVisibility(): void {
    const isSuperAdmin = this.authData.SuperAdmin;
    const sessionDivisionId = Number(sessionStorage.getItem("divisionID"));
    const currentDivisionRole = this.authData.DivisionsRoles.find(
      (role) => role.division_id === sessionDivisionId
    );
    const currentRole = currentDivisionRole?.role_name || null;
    const isAdmin = !currentRole || currentRole === "Admin";
    let allowedIds: string[] = [];

    if (isSuperAdmin) {
      allowedIds = [
        "master",
        "orgMapping",
        "userMng",
        "home",
        "revokeApproval",
      ];
    } else if (isAdmin) {
      allowedIds = [
        "searchDocument",
        "home",
        "uploadDocument",
        "notification",
        "revokeApproval",
      ];
    } else if (currentRole === "ContentManager") {
      allowedIds = [
        "searchDocument",
        "home",
        "uploadDocument",
        "notification",
        "revokeApproval",
      ];
    } else if (currentRole === "User") {
      allowedIds = ["searchDocument", "home", "uploadDocument", "notification"];
    }

    this.canViewNotifications = allowedIds.includes("notification");
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open the notifications panel
   */
  openPanel(): void {
    // Return if the notifications panel or its origin is not defined
    if (!this._notificationsPanel || !this._notificationsOrigin) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(
      new TemplatePortal(this._notificationsPanel, this._viewContainerRef)
    );
  }

  /**
   * Close the notifications panel
   */
  closePanel(): void {
    this._overlayRef.detach();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    // Mark all as read
    this._notificationsService.markAllAsRead().subscribe();
  }

  /**
   * Toggle read status of the given notification
   */
  toggleRead(notification: Notification): void {
    // Toggle the read status
    notification.read = !notification.read;

    // Update the notification
    this._notificationsService
      .update(notification.id, notification)
      .subscribe();
  }

  /**
   * Delete the given notification
   */
  delete(notification: Notification): void {
    // Delete the notification
    this._notificationsService.delete(notification.id).subscribe();
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create the overlay
   */
  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: "fuse-backdrop-on-mobile",
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(
          this._notificationsOrigin._elementRef.nativeElement
        )
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: "start",
            originY: "bottom",
            overlayX: "start",
            overlayY: "top",
          },
          {
            originX: "start",
            originY: "top",
            overlayX: "start",
            overlayY: "bottom",
          },
          {
            originX: "end",
            originY: "bottom",
            overlayX: "end",
            overlayY: "top",
          },
          {
            originX: "end",
            originY: "top",
            overlayX: "end",
            overlayY: "bottom",
          },
        ]),
    });

    // Detach the overlay from the portal on backdrop click
    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }

  /**
   * Calculate the unread count
   *
   * @private
   */
  private _calculateUnreadCount(): void {
    let count = 0;

    if (this.notificationsData && this.notificationsData.length) {
      count = this.notificationsData.filter(
        (notification) => !notification.is_read
      ).length;
    }

    this.unreadCount = count;
  }

  getNotificationsCount() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    this._dashbaordService.getNotificationsCount(divisionID).subscribe({
      next: (response: any) => {
        this.notificationsData = response;
        this.notifications = response
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3);

        this._calculateUnreadCount();
        this._changeDetectorRef.detectChanges();
        this._calculateUnreadCount();
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

  goToAllNotifications() {
    this.router.navigateByUrl("manage-notification");
  }
}
