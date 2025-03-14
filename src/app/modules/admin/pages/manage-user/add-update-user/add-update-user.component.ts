import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';


@Component({
  selector: 'app-add-update-user',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, MatDialogModule, MatIconModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule, TranslocoModule],
  templateUrl: './add-update-user.component.html',
  styleUrl: './add-update-user.component.scss'
})
export class AddUpdateUserComponent {
  addUpdateUserForm:UntypedFormGroup;
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
constructor(private _formBuilder: UntypedFormBuilder,public dialogRef: MatDialogRef<AddUpdateUserComponent>){

}


ngOnInit(): void {
  this.initiateForm();
}
  initiateForm(){
    this.addUpdateUserForm = this._formBuilder.group({
      empName: ['', Validators.required],
      emailID: ['', Validators.required],
      kgid: ['', Validators.required],
      mobileNo: ['', Validators.required],
      role: ['', Validators.required],
      cid:[''],
      designation:[''],
      userName:['']
    });
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  reqRejected(){

  }

  selectDataRole($event){

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

}
