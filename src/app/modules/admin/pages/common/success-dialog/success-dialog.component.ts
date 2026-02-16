import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
export interface successDialogData {
  title: string;
  message: string;
}
@Component({
  selector: 'app-success-dialog',
  standalone: true,
 imports: [
     NgIf,
     CommonModule,
     ReactiveFormsModule,
     MatDialogModule,
     MatIconModule,
     FormsModule,
     MatFormFieldModule,
     MatInputModule,
     MatSelectModule,
     MatButtonModule,
     TranslocoModule,
   ],
   encapsulation: ViewEncapsulation.None,
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss'
})
export class SuccessDialogComponent {
constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: successDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}


