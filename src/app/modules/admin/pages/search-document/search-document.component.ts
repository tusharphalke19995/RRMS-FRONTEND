import {
    CurrencyPipe,
    NgClass,
    NgFor,
    NgIf,
    NgTemplateOutlet,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterLink } from '@angular/router';
import { InventoryVendor } from '../upload-document/uploadDoc.types';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SearchDocService } from './searchDoc.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { UploadDocumentService } from '../upload-document/uploadDoc.service';
@Component({
    selector: 'app-search-document',
    templateUrl: './search-document.component.html',
    styleUrl: './search-document.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
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
    ],
})
export class SearchDocumentComponent implements OnInit, OnDestroy {
    searchDocumentForm: UntypedFormGroup;
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
    stateDropdown: [];
    districtDropdown: any;
    unitsDropdown: any;
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
      { labelen: 'State',labelhi:'State', property: 'stateName' },
      { labelen: 'District',labelhi:'District', property: 'districtName' },
      { labelen: 'Police Station',labelhi:'Police Station', property: 'psName' },
      { labelen: 'Name',labelhi:'First Name', property: 'first_name' },
      { labelen: 'Name',labelhi:'Last Name', property: 'last_name' },
      { labelen: 'Case No',labelhi:'Case No', property: 'caseNo' },
      { labelen: 'Case Status',labelhi:'Case Status', property: 'caseStatus' },
      { labelen: 'Case Status',labelhi:'Document', property: 'doc' },
      { labelen: 'Action', labelhi: 'Action', property: 'action', isAction: true },
    ];
  
    displayedColumns: string[] = ['stateName','districtName','psName', 'first_name','last_name','caseStatus','caseNo','doc','action'];
    
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _citizeninfoService: SearchDocService,
        private _uploadDocumentService:UploadDocumentService
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
        this.getUserStateDropdown();
        this.onStateChange(16);
        this.onDisctrictChange(443);
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
        this.searchDocumentForm = this._formBuilder.group({
            firstName:['',[Validators.required]],
            lastName:['',[Validators.required]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            policStation: ['', [Validators.required]],
            districtId: ['', [Validators.required]],
            caseNo:['',[Validators.required]],
            caseStatus:['',[Validators.required]],
            unitsId:[''],
            stateId:['']
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
        const product = this.searchDocumentForm.getRawValue();
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

      onStateChange(stateId: number): void {
        if (stateId) {
          this._uploadDocumentService.geDistrictByStateData(stateId).subscribe(
            (districts:any) => {
              this.districtDropdown = districts.responseData; 
              this.searchDocumentForm.get('districtId')?.setValue(443);
            },
            (error) => {
              console.error('Error fetching districts:', error);
            }
          );
        } else {
          this.districtDropdown = [];
        }
      }

      getUserStateDropdown() {
        this._uploadDocumentService.getState().subscribe({
          next: (response: any) => {
            console.log("response", response);
            this.stateDropdown= response.responseData;
            this.stateDropdown.forEach((element:any) => {
                if(element.stateId==16){
                    this.searchDocumentForm.patchValue({
                        stateId: element.stateId
                    });
                    this.searchDocumentForm.get('stateId').disable();
                }
            });
        
          },
          error: (error) => {},
        });
      }

      onDisctrictChange(stateId: number): void {
        this._uploadDocumentService.getUnitsByDistictIdData(stateId).subscribe({
          next: (response: any) => {
            if(response.statusCode==200){
              this.unitsDropdown= response.responseData;
            }
          },
          error: (error) => {},
        });
      }

    
}
