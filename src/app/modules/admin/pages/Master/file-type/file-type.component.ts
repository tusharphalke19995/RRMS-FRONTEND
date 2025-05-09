import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormsModule, UntypedFormGroup, NgForm, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { SearchDocService } from '../../search-document/searchDoc.service';
import { InventoryVendor } from '../../upload-document/uploadDoc.types';
import { MasterService } from '../master.service';
import { AddUpdateFileTypeComponent } from './add-update-file-type/add-update-file-type.component';

@Component({
  selector: 'app-file-type',
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
    MatSortModule
],
  templateUrl: './file-type.component.html',
  styleUrl: './file-type.component.scss'
})
export class FileTypeComponent implements OnInit {
  searchUserListForm: UntypedFormGroup;
  @ViewChild("addcitizenInformationNgForm") addcitizenInformationNgForm: NgForm;
  formFieldHelpers: string[] = [""];
  isLoading: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  alert: { type: string; message: string };
  divisionDropdown = [];

  @ViewChild("sort1") sort1: MatSort;
  @ViewChild("paginator1") paginator1: MatPaginator;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  columns: any[] = [
    { labelen: "File Type Id", labelhi: "File Type Id", property: "fileTypeId" },
    { labelen: "File Type Name", labelhi: "File Type Name", property: "fileTypeName" },
    {
      labelen: "Action",
      labelhi: "Action",
      property: "action",
      isAction: true,
    },
  ];

  displayedColumns: string[] = [
    "fileTypeId",
    "fileTypeName",
   "action",
  ];
  userRoleDropdown: [];
  designationsDropdown: [];

  /**
   * Constructor
   */
  constructor(
     private _snackBar: MatSnackBar,
    private _masterService: MasterService,
    public dialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private _citizeninfoService: SearchDocService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getFilesInfo();
  }

  // ngAfterViewInit(): void {
  //   this.dataSource.sort = this.sort1;
  //   this.dataSource.paginator = this.paginator1;

  //   this._changeDetectorRef.detectChanges();
  // }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  /**
   * Clear the form
   */
  clearForm(): void {
    // Reset the form
    this.addcitizenInformationNgForm.resetForm();
  }

  SelectDataCase(value) {}

  filterDropDownData(event) {}

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  addFileType(data) {
    const dialogRef = this.dialog.open(AddUpdateFileTypeComponent, {
      data: data,
      width: "400px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      this._changeDetectorRef.detectChanges();
      this.getFilesInfo();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editFile(row: any): void {
    this.addFileType(row);
  }

  getFilesInfo() {
    this._masterService.getFileTypes().subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.dataSource = new MatTableDataSource(response);
      },
      error: (error) => {},
    });
  }

  deleteSelectedFileType(data) {
        this._masterService.deleteFileTypes(data.fileTypeId).subscribe({
        next: (response: any) => {
          this._snackBar.open("File Type Deleted successfully", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
          this.getFilesInfo();
        },
        error: (error) => {
          this._snackBar.open(error.message || "Error creating user", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
        },
      });
    
  }

}
