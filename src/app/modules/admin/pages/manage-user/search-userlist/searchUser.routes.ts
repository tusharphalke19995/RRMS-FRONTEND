import { Routes } from '@angular/router';
import { SearchUserlistComponent } from './search-userlist.component';
import { AddUpdateUserComponent } from '../add-update-user/add-update-user.component';
import { ArchivedUsersComponent } from '../archived-users/archived-users.component';
import { ResetPasswordRequestComponent } from '../reset-password-req/reset-password-req.component';

export default [
    {
        path     : 'active-user',
        component: SearchUserlistComponent
    },
    {
        path:'user-addUpdate',
        component:AddUpdateUserComponent
    },
    {
        path:'archived-users',
        component:ArchivedUsersComponent
    },
    {
        path:'reset-password-request',
        component:ResetPasswordRequestComponent
    }
] as Routes;
