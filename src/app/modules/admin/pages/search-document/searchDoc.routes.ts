import { Routes } from '@angular/router';
import { SearchDocumentComponent } from './search-document.component';
import { GetDocComponent } from './get-doc/get-doc.component';
import { PdfPreviewPageComponent } from './pdf-preview-page/pdf-preview-page.component';

export default [
    {
        path     : '',
        component: SearchDocumentComponent
    },
    {
        path:'get-doc',
        component:GetDocComponent
    },
    {
        path:'pdf-preview',
        component:PdfPreviewPageComponent
    }
] as Routes;
