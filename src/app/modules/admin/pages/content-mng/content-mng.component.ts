import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from 'app/shared/shared.service';
import { DashbaordService } from '../../dashbaord/dashboard.service';
import { NotificationService } from '../manage-notification/notification.service';
import { UploadedFilesComponent } from '../search-document/uploaded-files/uploaded-files.component';
import { ContentMngService } from './contentMng.service';
import { Item, Items } from './interface/content.model';


@Component({
  selector: 'app-content-mng',
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
     MatTooltipModule
  ],
  templateUrl: './content-mng.component.html',
  styleUrl: './content-mng.component.scss'
})
export class ContentMngComponent  implements OnInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;
 selectedItem: Item;
    items: Items;

  constructor(
     
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private contentMngService: ContentMngService,
       
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    this.getFolder();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
       
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

     getFolder() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    let payload={
      division_id:divisionID
    }
    this.contentMngService.getFolderData(payload).subscribe({
      next: (response: any) => {
       this.items = response;
       console.log("this.items",this.items)
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }


}