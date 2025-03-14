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
import {
    Subject
} from 'rxjs';
import {
    InventoryVendor
} from './uploadDoc.types';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoModule } from '@ngneat/transloco';
import { RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { UploadDocumentService } from './uploadDoc.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-upload-document',
    templateUrl: './upload-document.component.html',
    styleUrl: './upload-document.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        RouterLink,
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
         MatSelectModule,
         MatDatepickerModule
    ],
})
export class UploadDocumentComponent implements OnInit, OnDestroy {
    addcitizenfeedbackForm: UntypedFormGroup;
    @ViewChild('addcitizenfeedbackNgForm') addcitizenfeedbackNgForm: NgForm;

    isLoading: boolean = false;
    formFieldHelpers: string[] = [''];
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
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _citizenFeedbackService: UploadDocumentService
    ) {}

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
        this.addcitizenfeedbackForm = this._formBuilder.group({
            fName: ['', [Validators.required]],
            lName: [''],
            mName: ['', [Validators.required]],
            emailId: ['', [Validators.email]],
            landLineNo: [''],
            mobileNo: [''],
            complaintServiceNo: [''],
            districtId: ['', [Validators.required]],
            year: [''],
            toWhom: ['', [Validators.required]],
            citizenFeedback: ['', [Validators.required]],
            startDate:['', [Validators.required]],
        });
    }

    /**
     * Citizen Feedback Create
     */
    saveCitizenFeedback(): void {
        // Create the product
        this._citizenFeedbackService.createProduct().subscribe((newProduct) => {
            this.alert = {
                type: 'success',
                message:
                    'Your request has been delivered! A member of our support staff will respond as soon as possible.',
            };

            setTimeout(() => {
                this.alert = null;
            }, 7000);

            // Clear the form
            this.clearForm();
        });
    }

    /**
     * Update the Citizen Feedback
     */
    updateCitizenFeedback(): void {
        const product = this.addcitizenfeedbackForm.getRawValue();
        delete product.currentImageIndex;

        this._citizenFeedbackService
            .updateProduct(product.id, product)
            .subscribe(() => {});
    }

    /**
     * Clear the form
     */
    clearForm(): void {
        // Reset the form
        this.addcitizenfeedbackNgForm.resetForm();
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


        openRemarkDialog(sizeType) {
            
          }

          filesDropped(event): void {
          }

          selectImage(files: any, event) {
           
          }

          SelectDataCase(value) {}

          filterDropDownData(event) {}
}

