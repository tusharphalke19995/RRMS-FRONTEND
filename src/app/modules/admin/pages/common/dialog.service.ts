import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent, ErrorDialogData } from './error-dialog/error-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  openErrorDialog(title: string, message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '700px',
      data: { title, message }
    });
  }

  openSuccessDialog(title: string, message: string): void {
    this.dialog.open(SuccessDialogComponent, {
      width: '700px',
      data: { title, message }
    });
  }

  openInfoDialog(title: string, message: string): void {
    this.dialog.open(InfoDialogComponent, {
      width: '700px',
      data: { title, message }
    });
  }
}
