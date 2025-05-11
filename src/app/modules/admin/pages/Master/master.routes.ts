import { Routes } from '@angular/router';
import { RoleComponent } from './role/role.component';
import { DivisionComponent } from './division/division.component';
import { DesignationsComponent } from './designations/designations.component';
import { FileTypeComponent } from './file-type/file-type.component';
import { FileClassificationComponent } from './file-classification/file-classification.component';
import { CaseStatusComponent } from './case-status/case-status.component';
import { DepartmentComponent } from './department/department.component';


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
    {
        path     : 'case-status',
        component: CaseStatusComponent
    },
    {
        path     : 'file-classification',
        component: FileClassificationComponent
    },
    {
        path     : 'file-type',
        component: FileTypeComponent
    },
    {
        path:'department',
        component:DepartmentComponent
    }
] as Routes;
