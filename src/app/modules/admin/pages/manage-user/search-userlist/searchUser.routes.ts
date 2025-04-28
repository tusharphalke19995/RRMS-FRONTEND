import { Routes } from '@angular/router';
import { SearchUserlistComponent } from './search-userlist.component';
import { AddUpdateUserComponent } from '../add-update-user/add-update-user.component';

export default [
    {
        path     : '',
        component: SearchUserlistComponent
    },
    {
        path:'user-addUpdate',
        component:AddUpdateUserComponent
    }
] as Routes;
