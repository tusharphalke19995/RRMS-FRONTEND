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
    uploadDocumentForm: UntypedFormGroup;
    @ViewChild('addcitizenfeedbackNgForm') addcitizenfeedbackNgForm: NgForm;

    isLoading: boolean = false;
    formFieldHelpers: string[] = [''];
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: string; message: string };
    unitsDropdown:any;
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
    yearDropdown = [
        {
            id: 0,
            value: '2025',
        },
        {
            id: 1,
            value: '2024',
        },
        {
            id: 2,
            value: '2023',
        },
        {
            id: 3,
            value: '2022',
        },
        {
            id: 4,
            value: '2021',
        },
        {
            id: 5,
            value: '2020',
        },
    ];
    districtDropdown: any;
    stateDropdown: [];
    dragging: boolean = false;
    imgUrls: string[] = []; // Array to hold image preview URLs
  
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _uploadDocumentService: UploadDocumentService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.initForm();
        this.getUserDistrictDropdown();
        this.getUserStateDropdown();
        this.onStateChange(16);
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
        this.uploadDocumentForm = this._formBuilder.group({
            fName: ['', [Validators.required]],
            lName: [''],
            mName: ['', [Validators.required]],
            emailId: ['', [Validators.email]],
            landLineNo: [''],
            mobileNo: [''],
            complaintServiceNo: [''],
           
          
            toWhom: ['', [Validators.required]],
            citizenFeedback: ['', [Validators.required]],
            startDate:['', [Validators.required]],

            caseNo:[''],
            stateId:[''],
            districtId: ['', [Validators.required]],
            year: [''],
            caseStatus:[''],
            unitsId:['']
        });
    }

    /**
     * Citizen Feedback Create
     */
    saveCitizenFeedback(): void {
      
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

          SelectDataCase(value) {}

          filterDropDownData(event) {}


          getUserDistrictDropdown() {
            this._uploadDocumentService.getUserDistrict().subscribe({
              next: (response: any) => {
                console.log("response", response);
                this.districtDropdown= response;
              },
              error: (error) => {},
            });
          }

          getUserStateDropdown() {
            this._uploadDocumentService.getState().subscribe({
              next: (response: any) => {
                console.log("response", response);
                this.stateDropdown= response;
                this.stateDropdown.forEach((element:any) => {
                    if(element.stateId==16){
                        this.uploadDocumentForm.patchValue({
                            stateId: element.stateId
                        });
                        this.uploadDocumentForm.get('stateId').disable();
                    }
                });
            
              },
              error: (error) => {},
            });
          }


  // Method to handle the drop event
  filesDropped(event: any): void {
    event.preventDefault(); // Prevent the default browser behavior
    if (event.dataTransfer && event.dataTransfer.files.length) {
      this.selectImage(event.dataTransfer.files, event);
    }
  }

  // Method to handle file selection
  selectImage(files: FileList, event: any): void {
    this.imgUrls = []; // Clear previous images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.isValidImage(file)) {
        if (file.size > 4194304) {
          alert("File is too large. Please reduce the size to under 4MB.");
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            this.imgUrls.push(reader.result as string);  // Add the image preview URL to the array
          };
          reader.readAsDataURL(file);
        }
      } else {
        alert("Unsupported file format. Please upload a .jpeg, .jpg, or .png image.");
      }
    }
  }

  // Check if the image file type is valid
  isValidImage(file: File): boolean {
    const supportedTypes = ['image/jpeg', 'image/png'];
    return supportedTypes.includes(file.type);
  }

  // Handle drag events
  onDragEnter(): void {
    this.dragging = true;
  }

  onDragLeave(): void {
    this.dragging = false;
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    this.dragging = true;
  }
  onStateChange(stateId: number): void {
    if (stateId) {
      this._uploadDocumentService.geDistrictByStateData(stateId).subscribe(
        (districts) => {
          this.districtDropdown = districts; 
          this.uploadDocumentForm.get('districtId')?.setValue(443);
          this.getUnitsByDistictIdInfo()
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    } else {
      this.districtDropdown = [];
    }
  }

  getUnitsByDistictIdInfo() {
    this._uploadDocumentService.getUnitsByDistictIdData(443).subscribe({
      next: (response: any) => {
        console.log("response", response);
        this.unitsDropdown= response;
      },
      error: (error) => {},
    });
  }
}

