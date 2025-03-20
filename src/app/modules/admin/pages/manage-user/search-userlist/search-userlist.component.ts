import { NgIf, NgFor, NgTemplateOutlet, NgClass, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { SearchDocService } from '../../search-document/searchDoc.service';
import { InventoryVendor } from '../../upload-document/uploadDoc.types';
import { MatDialog } from '@angular/material/dialog';
import { AddUpdateUserComponent } from '../add-update-user/add-update-user.component';
import { SearchUserService } from './searchUser.service';

@Component({
  selector: 'app-search-userlist',
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
  templateUrl: './search-userlist.component.html',
  styleUrl: './search-userlist.component.scss'
})
export class SearchUserlistComponent implements OnInit, AfterViewInit {
    searchUserListForm: UntypedFormGroup;
    @ViewChild('addcitizenInformationNgForm') addcitizenInformationNgForm: NgForm;
    formFieldHelpers: string[] = [''];
    isLoading: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: string; message: string };
    divisionDropdown = [];
    // dataShow = [
    //     {
    //         empID: 1,
    //         empName: 'Rohit',
    //         roleName: 'Admin User',
    //         kgid: '383323',
    //         mobileNo: '893949494',
    //         emailId: 'rohit123@gmail.com',
    //     },
    //     {
    //         empID: 2,
    //         empName: 'Rajesh',
    //         roleName: 'Admin',
    //         kgid: '93339933',
    //         mobileNo: '949494494',
    //         emailId: 'rajesh23@gmail.com',
    //     },
    // {
    //     empID: 3,
    //         empName: 'Lina',
    //         roleName: 'Admin User',
    //         kgid: '949449',
    //         mobileNo: '844494944',
    //         emailId: 'lina@gmail.com',
    // },
    // {
    //     empID: 4,
    //         empName: 'Sham',
    //         roleName: 'User',
    //         kgid: '494944',
    //         mobileNo: '842423244',
    //         emailId: 'shamd@gmail.com',
    // },
    // {
    //     empID: 5,
    //         empName: 'Ram',
    //         roleName: 'Admin User',
    //         kgid: '339945',
    //         mobileNo: '8974747475',
    //         emailId: 'ram12@gmail.com',
    // }
    // ];
    @ViewChild('sort1') sort1: MatSort;
    @ViewChild('paginator1') paginator1: MatPaginator
    dataSource: MatTableDataSource<any>;
    columns: any[] = [
        { labelen: 'Name',labelhi:'First Name', property: 'first_name' },
        { labelen: 'Name',labelhi:'Last Name', property: 'last_name' },
        { labelen: 'Role Name',labelhi:'Role Name', property: 'roleName' },
         { labelen: 'Division Name',labelhi:'Division Name', property: 'divisionName' },
         { labelen: 'Designation Name',labelhi:'Designation Name', property: 'designationName' },
        { labelen: 'KGID',labelhi:'KGID', property: 'kgid' },
        { labelen: 'Mobile No',labelhi:'Mobile No', property: 'mobileno' },
        { labelen: 'Email ID',labelhi:'Email Id', property: 'email' },
        { labelen: 'Action', labelhi: 'Action', property: 'action', isAction: true },
      ];
    
      displayedColumns: string[] = ['first_name','last_name','divisionName','designationName','roleName','kgid','mobileno','email','action'];
    userRoleDropdown: [];
  designationsDropdown: [];
    
    /**
     * Constructor
     */
    constructor(
        private _searchUserService:SearchUserService,
        public dialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _citizeninfoService: SearchDocService
    ) {
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.initForm();
        this.getUserInfo();
        this.getUserRoleDropdown();
        this.getDivisionDropdown();
        this.getDesignationsDropDownData();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort1;
        this.dataSource.paginator = this.paginator1;
        
        this._changeDetectorRef.detectChanges();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    initForm() {
        this.searchUserListForm = this._formBuilder.group({
            roleId: ['', [Validators.required]],
            empName: ['', [Validators.required]],
            kgid: ['', [Validators.required]],
            divisionId:['',[Validators.required]],
            designationId:['']
        });
    }

    /**
     * Citizen Feedback Create
     */
    saveCitizenFeedback() {}

    /**
     * Update the Citizen Feedback
     */
    updateCitizenFeedback(): void {
        const product = this.searchUserListForm.getRawValue();
        delete product.currentImageIndex;
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

    addNewUser(data) {
        const dialogRef = this.dialog.open(AddUpdateUserComponent, {
          data: data,
          width: '1000px',
        });
        dialogRef.afterClosed().subscribe(result => {
          this._changeDetectorRef.detectChanges();
          this.getUserInfo();
        });
    
      }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    editUser(row: any): void {
        this.addNewUser(row);
    }

    deleteUser(row: any): void {
        // Implement delete logic here
        console.log('Delete user:', row);
    }

    getUserInfo() {
          this._searchUserService.getUserList().subscribe({
            next: (response: any) => {
             console.log("response",response);
        this.dataSource = new MatTableDataSource(response);

            },
            error: (error) => {
              
            }
          });
        
      }

      getUserRoleDropdown() {
        this._searchUserService.getUserRole().subscribe({
          next: (response: any) => {
            console.log("response", response);
            this.userRoleDropdown= response;
          },
          error: (error) => {},
        });
      }

      getDivisionDropdown() {
        this._searchUserService.getUserDivision().subscribe({
          next: (response: any) => {
            console.log("response", response);
            this.divisionDropdown= response;
          },
          error: (error) => {},
        });
      }

      getDesignationsDropDownData() {
        this._searchUserService.getDesignationsInfo().subscribe({
          next: (response: any) => {
            console.log("response", response);
            this.designationsDropdown= response;
          },
          error: (error) => {},
        });
      }


      
}
