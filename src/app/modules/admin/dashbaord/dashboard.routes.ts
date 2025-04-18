import { Routes } from '@angular/router';
import { DashbaordComponent } from './dashbaord.component';
import { ActiveUserlistComponent } from './pages/active-userlist/active-userlist.component';
import { PendingApprovalListComponent } from './pages/pending-approval-list/pending-approval-list.component';


export default [
    {
        path     : '',
        component: DashbaordComponent,
    },
    {
        path     : 'active-user-list',
        component: ActiveUserlistComponent
    },
    {
        path:'pending-approval-list',
        component:PendingApprovalListComponent
    }
] as Routes;
