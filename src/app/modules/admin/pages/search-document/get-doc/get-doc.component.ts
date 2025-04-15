import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { UploadFilesComponent } from '../../upload-files/upload-files/upload-files.component';
import { SharedService } from 'app/shared/shared.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-get-doc',
  standalone: true,
  animations: fuseAnimations,
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
    MatProgressBarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    UploadFilesComponent
  ],
  templateUrl: './get-doc.component.html',
  styleUrl: './get-doc.component.scss'
})
export class GetDocComponent {

  isLoading: boolean = false;

  files: any[] = [];

  caseMetaData:any;

  constructor(private dataService: SharedService) {}

  ngOnInit() {
    this.dataService.setFileBoolean(false);
   this.getFilesWithMetadataSelected();
   this.getCasedataSelected();
  }

  getFilesWithMetadataSelected(){
    
    this.dataService.getFilesData().subscribe(files => {
      this.files = files;
    });
  }

  getCasedataSelected(){
    this.dataService.getCaseData().subscribe(caseData => {
      this.caseMetaData = caseData;
    });
  }
}