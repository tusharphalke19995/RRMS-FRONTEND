import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslocoModule } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FolderTreeService } from '../../services/folder-tree.service';

export interface MergeCaseDialogResult {
  sourceCaseNo: string;
  destinationCaseNo: string;
}

@Component({
  selector: 'app-merge-case-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    TranslocoModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './merge-case-dialog.component.html',
  styleUrl: './merge-case-dialog.component.scss'
})
export class MergeCaseDialogComponent {
  mergeCaseForm: FormGroup;
  availableCaseNumbers: string[] = [];
  filteredSourceCases: string[] = [];
  filteredDestinationCases: string[] = [];
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MergeCaseDialogComponent>,
    private snackBar: MatSnackBar,
    private folderTreeService: FolderTreeService
  ) {
    this.initForm();
    this.loadAvailableCaseNumbers();
  }

  private initForm(): void {
    this.mergeCaseForm = this.formBuilder.group({
      sourceCaseNo: ['', [Validators.required]],
      destinationCaseNo: ['', [Validators.required]]
    }, { validators: this.caseNumberValidator });

    // Set up search filtering
    this.setupSearchFiltering();
  }

  private setupSearchFiltering(): void {
    // Filter source cases based on search input
    this.mergeCaseForm.get('sourceCaseNo')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filteredSourceCases = this.filterCaseNumbers(value);
      }
    });

    // Filter destination cases based on search input
    this.mergeCaseForm.get('destinationCaseNo')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filteredDestinationCases = this.filterCaseNumbers(value);
      }
    });
  }

  private filterCaseNumbers(searchTerm: string): string[] {
    if (!searchTerm) {
      return this.availableCaseNumbers;
    }
    
    const filterValue = searchTerm.toLowerCase();
    return this.availableCaseNumbers.filter(caseNo => 
      caseNo.toLowerCase().includes(filterValue)
    );
  }

  private loadAvailableCaseNumbers(): void {
    this.isLoading = true;
    
    const divisionID = sessionStorage.getItem("divisionID");
    
    if (!divisionID) {
      this.snackBar.open('Division ID not found. Please login again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
      return;
    }

    const payload = {
      division_id: divisionID,
    };

    this.folderTreeService.folderTreeView(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.extractCaseNumbersFromTree(response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading folder tree:', error);
        this.snackBar.open('Error loading available case numbers', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  private extractCaseNumbersFromTree(nodes: any[]): void {
    const caseNumbers = new Set<string>();
    
    const extractFromNode = (node: any) => {
      if (node.type === 'caseNo' || node.level === 'caseNo') {
        caseNumbers.add(node.name);
      }
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(extractFromNode);
      }
    };

    nodes.forEach(extractFromNode);
    this.availableCaseNumbers = Array.from(caseNumbers).sort();
    
    // Initialize filtered arrays
    this.filteredSourceCases = [...this.availableCaseNumbers];
    this.filteredDestinationCases = [...this.availableCaseNumbers];
    
    if (this.availableCaseNumbers.length >= 2) {
      this.mergeCaseForm.patchValue({
        sourceCaseNo: this.availableCaseNumbers[0],
        destinationCaseNo: this.availableCaseNumbers[1]
      });
    }
  }

  private caseNumberValidator(group: FormGroup): { [key: string]: any } | null {
    const sourceCaseNo = group.get('sourceCaseNo')?.value;
    const destinationCaseNo = group.get('destinationCaseNo')?.value;

    if (sourceCaseNo && destinationCaseNo && sourceCaseNo === destinationCaseNo) {
      return { sameCaseNumber: true };
    }

    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.mergeCaseForm.valid) {
      const formValue = this.mergeCaseForm.value;
      const result: MergeCaseDialogResult = {
        sourceCaseNo: formValue.sourceCaseNo,
        destinationCaseNo: formValue.destinationCaseNo
      };
      this.dialogRef.close(result);
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.mergeCaseForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
    return '';
  }

  getFormError(): string {
    if (this.mergeCaseForm.hasError('sameCaseNumber')) {
      return 'Source and destination case numbers cannot be the same';
    }
    return '';
  }

  // Handle option selection
  onSourceCaseSelected(event: any): void {
    this.mergeCaseForm.patchValue({
      sourceCaseNo: event.option.value
    });
  }

  onDestinationCaseSelected(event: any): void {
    this.mergeCaseForm.patchValue({
      destinationCaseNo: event.option.value
    });
  }

  // Display function for autocomplete
  displayFn = (caseNo: string): string => {
    return caseNo || '';
  }

  // Clear search when input is cleared
  onSourceCaseInput(event: any): void {
    const value = event.target.value;
    if (!value) {
      this.filteredSourceCases = [...this.availableCaseNumbers];
    }
  }

  onDestinationCaseInput(event: any): void {
    const value = event.target.value;
    if (!value) {
      this.filteredDestinationCases = [...this.availableCaseNumbers];
    }
  }

  // Clear source case input
  clearSourceCase(): void {
    this.mergeCaseForm.patchValue({ sourceCaseNo: '' });
    this.filteredSourceCases = [...this.availableCaseNumbers];
  }

  // Clear destination case input
  clearDestinationCase(): void {
    this.mergeCaseForm.patchValue({ destinationCaseNo: '' });
    this.filteredDestinationCases = [...this.availableCaseNumbers];
  }

  // Check if input has value
  hasSourceValue(): boolean {
    return this.mergeCaseForm.get('sourceCaseNo')?.value && 
           this.mergeCaseForm.get('sourceCaseNo')?.value.length > 0;
  }

  hasDestinationValue(): boolean {
    return this.mergeCaseForm.get('destinationCaseNo')?.value && 
           this.mergeCaseForm.get('destinationCaseNo')?.value.length > 0;
  }
} 