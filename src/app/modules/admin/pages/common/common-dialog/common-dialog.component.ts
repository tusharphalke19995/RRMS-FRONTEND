import { NgIf, CommonModule } from "@angular/common";
import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule } from "@ngneat/transloco";

export interface CommonDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

@Component({
  selector: "app-common-dialog",
  templateUrl: "./common-dialog.component.html",
  styleUrl: "./common-dialog.component.scss",
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
})
export class CommonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommonDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
