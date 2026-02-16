import { Routes } from '@angular/router';
import { UploadDocumentComponent } from './upload-document.component';
import { DraftDetailsComponent } from './draft-details/draft-details.component';

export default [
    {
        path     : '',
        component: UploadDocumentComponent
    },
      {
        path     : 'draft-details',
        component: DraftDetailsComponent
    },
    
] as Routes;
