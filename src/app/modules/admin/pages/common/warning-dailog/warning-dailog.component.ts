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
export interface warningDialogData {
  title: string;
  message: string;
}
@Component({
  selector: 'app-warning-dailog',
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
  templateUrl: './warning-dailog.component.html',
  styleUrl: './warning-dailog.component.scss'
})
export class WarningDialogComponent {
constructor(
    public dialogRef: MatDialogRef<WarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: warningDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}


