import { NgIf, NgFor, NgTemplateOutlet, NgClass, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { SearchDocService } from '../../search-document/searchDoc.service';
import { InventoryVendor } from '../../upload-document/uploadDoc.types';

@Component({
  selector: 'app-search-user-role',
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
  templateUrl: './search-user-role.component.html',
  styleUrl: './search-user-role.component.scss'
})
export class SearchUserRoleComponent {
addcitizenInformationForm: UntypedFormGroup;
    @ViewChild('addcitizenInformationNgForm') addcitizenInformationNgForm: NgForm;
    formFieldHelpers: string[] = [''];
    isLoading: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: string; message: string };
    citizenInfoDropdown = [
        {
            id: 0,
            value: 'test1',
        },
        {
            id: 1,
            value: 'test2',
        },
    ];
    dataShow = [
        {
            id: 0,
            value: 'Addhar Card',
        },
        {
            id: 1,
            value: 'PanCard',
        },
    ];
    @ViewChild('sort1') sort1: MatSort;
    @ViewChild('paginator1') paginator1: MatPaginator
    dataSource: any=[];
    columns: any[] = [
        { labelen: 'ID', labelhi: 'Case No', property: 'wlId' },
        { labelen: 'Name',labelhi:'Document', property: 'wlName' },
        { labelen: 'Action',  labelhi:'Action',property: 'action' },
    
      ];
    
      displayedColumns: string[] = ['wlId','wlName','action'];
    
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _citizeninfoService: SearchDocService
    ) {
        // this.dataSource =this.dataShow;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.initForm();
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
        this.addcitizenInformationForm = this._formBuilder.group({
            citizenInfo: ['', [Validators.required]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            policStation: ['', [Validators.required]],
            districtId: ['', [Validators.required]],
            location:['',[Validators.required]]
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
        const product = this.addcitizenInformationForm.getRawValue();
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
}

