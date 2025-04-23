import { Routes } from '@angular/router';
import { DashbaordComponent } from './dashbaord.component';
import { ActiveUserlistComponent } from './pages/active-userlist/active-userlist.component';
import { PendingApprovalListComponent } from './pages/pending-approval-list/pending-approval-list.component';
import { RecentFavoritesFilesComponent } from './pages/recent-favorites-files/recent-favorites-files.component';
import { LatestFilesComponent } from './pages/latest-files/latest-files.component';


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
    },
    {
        path:'latest-files-list',
        component:LatestFilesComponent
    },
    {
        path:'recent-favorites-files',
        component:RecentFavoritesFilesComponent
    }
] as Routes;
