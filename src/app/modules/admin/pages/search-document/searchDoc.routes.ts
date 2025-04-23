import { Routes } from '@angular/router';
import { SearchDocumentComponent } from './search-document.component';
import { GetDocComponent } from './get-doc/get-doc.component';

export default [
    {
        path     : '',
        component: SearchDocumentComponent
    },
    {
        path:'get-doc',
        component:GetDocComponent
    }
] as Routes;
