import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ContentMngService } from '../contentMng.service';
import { Item, Items } from '../interface/content.model';

@Component({
  selector: 'app-content-details-filetypeid',
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
    CommonModule,
     MatTooltipModule
  ],
  templateUrl: './content-details-filetypeid.component.html',
  styleUrl: './content-details-filetypeid.component.scss'
})
export class ContentCaseFiletypeIdDetailsComponent implements OnInit {
  alert: { type: string; message: string };
  isLoading: boolean = false;
 selectedItem: Item;
    items: Items;
  finalYear: "year";
  year: string;
  caseNo: string;
  caseTypeId: string;
  fileTypeId: string;

  constructor(
     
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private contentMngService: ContentMngService,
        private route: ActivatedRoute
       
    )
    {
 this.route.queryParamMap.subscribe(params => {
      this.year = params.get('name');
       this.caseNo = params.get('caseNo');
       this.caseTypeId=params.get('caseTypeId');
          this.fileTypeId=params.get('filetypeid');
      console.log('Name:', this.year);
       console.log('caseNo:', this.caseNo);
    });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
     
    this.getFolder();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
       
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

     getFolder() {
    const divisionID = Number(sessionStorage.getItem("divisionID"));
    let payload={
      division_id:divisionID,
      year: this.year,
      caseType:this.caseTypeId,
      caseNo:this.caseNo,
      fileTypeId:this.fileTypeId
    }
    this.contentMngService.getFolderData(payload).subscribe({
      next: (response: any) => {
       this.items = response;
       console.log("this.items",this.items)
      },
      error: (error) => {
        console.error("Error fetching latest files:", error);
      },
    });
  }

 goToCaseDocumentTypeIdDetails(data: any) {
      this._router.navigate(['/content-management/folders/caseNo/caseTypeid/filetypeid/documenttypeid'], {
      queryParams: { name: this.year ,caseNo:this.caseNo,caseTypeId:this.caseTypeId,filetypeid:this.fileTypeId,documentTypeId:data.id}
    });
  }
}