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
    {
        id   : 'roleMng',
        title: 'Role Management',
        type : 'basic',
        icon : 'heroicons_outline:star',
        link : '/manage-user-role'
    }

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
