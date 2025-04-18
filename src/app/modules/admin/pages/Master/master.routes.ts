import { Routes } from '@angular/router';
import { RoleComponent } from './role/role.component';
import { DivisionComponent } from './division/division.component';
import { DesignationsComponent } from './designations/designations.component';


export default [
    {
        path     : 'role',
        component: RoleComponent
    },
    {
        path     : 'division',
        component: DivisionComponent
    },
    {
        path     : 'designations',
        component: DesignationsComponent
    },
] as Routes;
