import { Routes } from '@angular/router';
import { DepartmentComponent } from '../Master/department/department.component';
import { DesignationHierarchyComponent } from '../Master/designation-hierarchy/designations-hierarchy.component';
import { DesignationsComponent } from '../Master/designations/designations.component';
import { DivisionComponent } from '../Master/division/division.component';

export default [
  
    {
        path     : 'division',
        component: DivisionComponent
    },
    {
        path     : 'designations',
        component: DesignationsComponent
    },
   
   
    {
        path:'department',
        component:DepartmentComponent
    },
     {
        path:'designation-hierarchy',
        component:DesignationHierarchyComponent
    }
] as Routes;

