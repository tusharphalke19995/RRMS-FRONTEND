/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'home',
        title: 'Home',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/dashboard'
    },
    {
        id   : 'uploadDocument',
        title: 'Upload Document',
        type : 'basic',
        icon : 'heroicons_outline:document',
        link : '/upload-document'
    },
    {
        id   : 'searchDocument',
        title: 'Search Document',
        type : 'basic',
        icon : 'heroicons_outline:magnifying-glass',
        link : '/search-document'
    },
    {
        id   : 'userMng',
        title: 'User Management',
        type : 'basic',
        icon : 'heroicons_outline:user-circle',
        link : '/manage-user'
    },
    // {
    //     id   : 'roleMng',
    //     title: 'Role Management',
    //     type : 'basic',
    //     icon : 'heroicons_outline:star',
    //     link : '/manage-user-role'
    // },
    {
        id   : 'notification',
        title: 'Notification',
        type : 'basic',
        icon : 'heroicons_outline:bell',
        link : '/manage-notification'
    },
    // {
    //     id   : 'contentManagement',
    //     title: 'Content Management',
    //     type : 'basic',
    //     icon : 'heroicons_outline:user',
    //     link : '/content-management'
    // },
    {
        id   : 'orgMapping',
        title: 'Organisation Mapping',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/org-mapping'
    },
    {
        id   : 'master',
        title   : 'Master',
        type    : 'collapsable',
        icon    : 'heroicons_outline:information-circle',
        children: [
            {
                id        : 'roleMng',
                title     : 'Role Management',
                type      : 'basic',
                link      : '/manage-master/role',
                exactMatch: true,
            },
            {
                id   : 'divisionMng',
                title: 'Division Management',
                type : 'basic',
                link : '/manage-master/division',
            },
            {
                id   : 'designationMng',
                title: 'Designation Management',
                type : 'basic',
                link : '/manage-master/designations',
            },
            {
                id   : 'caseStatusMng',
                title: 'Case Status Management',
                type : 'basic',
                link : '/manage-master/case-status',
            },
            {
                id   : 'fileClassificationMng',
                title: 'File Classification Management',
                type : 'basic',
                link : '/manage-master/file-classification',
            },
            {
                id   : 'fileTypeMng',
                title: 'File Type Management',
                type : 'basic',
                link : '/manage-master/file-type',
            }
        ],
    },
    {
        id   : 'revokeApproval',
        title: 'Revoke Approval',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/revoke-approval'
    },

];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
