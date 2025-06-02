/* eslint-disable */
import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: "home",
    title: "Home",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/dashboard",
  },
  {
    id: "uploadDocument",
    title: "Upload Document",
    type: "basic",
    icon: "heroicons_outline:document",
    link: "/upload-document",
  },
  {
    id: "searchDocument",
    title: "Search Document",
    type: "basic",
    icon: "heroicons_outline:magnifying-glass",
    link: "/search-document",
  },
  {
    id: "contentMng",
    title: "Content Management",
    type: "basic",
    icon: "heroicons_outline:user-circle",
    link: "/content-management",
  },
  // {
  //     id   : 'roleMng',
  //     title: 'Role Management',
  //     type : 'basic',
  //     icon : 'heroicons_outline:star',
  //     link : '/manage-user-role'
  // },
  {
    id: "notification",
    title: "Notification",
    type: "basic",
    icon: "heroicons_outline:bell",
    link: "/manage-notification",
  },
  {
    id: "caseApproval",
    title: "Upload Status",
    type: "basic",
    icon: "heroicons_outline:user",
    link: "/upload-approval",
  },
  {
    id: "reqAccess",
    title: "Access Status",
    type: "basic",
    icon: "heroicons_outline:user",
    link: "/request-access",
  },
  // {
  //     id   : 'orgMapping',
  //     title: 'Organisation Mapping',
  //     type : 'basic',
  //     icon : 'heroicons_outline:chart-pie',
  //     link : '/org-mapping'
  // },
  {
    id: "orgMapping",
    title: "Organisation Mapping",
    type: "collapsable",
    icon: "heroicons_outline:information-circle",
    children: [
      {
        id: "departmentMng",
        title: "Department Management",
        type: "basic",
        link: "/org-mapping/department",
      },
      {
        id: "divisionMng",
        title: "Division Management",
        type: "basic",
        link: "/org-mapping/division",
      },
      {
        id: "designationMng",
        title: "Designation Management",
        type: "basic",
        link: "/org-mapping/designations",
      },

      {
        id: "designationHierarchy",
        title: "Designation Hierarchy",
        type: "basic",
        link: "/org-mapping/designation-hierarchy",
      },
    ],
  },
  {
    id: "master",
    title: "Master",
    type: "collapsable",
    icon: "heroicons_outline:information-circle",
    children: [
      // {
      //   id: "roleMng",
      //   title: "Role Management",
      //   type: "basic",
      //   link: "/manage-master/role",
      //   exactMatch: true,
      // },

      {
        id: "caseStatusMng",
        title: "Case Status Management",
        type: "basic",
        link: "/manage-master/case-status",
      },
      // {
      //   id: "fileClassificationMng",
      //   title: "File Classification Management",
      //   type: "basic",
      //   link: "/manage-master/file-classification",
      // },
      {
        id: "fileTypeMng",
        title: "File Type Management",
        type: "basic",
        link: "/manage-master/file-type",
      },
      {
        id: "caseFiles",
        title: "Case File Management",
        type: "basic",
        link: "/manage-master/case-files",
      },
      {
        id: "filesCorrespondence",
        title: "File Correspondence  Management",
        type: "basic",
        link: "/manage-master/file-Correspondence",
      },
      {
        id: "smtpSetting",
        title: "SMTP Management",
        type: "basic",
        link: "/manage-master/smtp-setting",
      },
      {
        id: "emailDomain",
        title: "Email Domain Management",
        type: "basic",
        link: "/manage-master/email-domain-mng",
      },
    ],
  },
   {
    id: "userMng",
    title: "User Management",
    type: "collapsable",
    icon: "heroicons_outline:information-circle",
    children: [
      {
        id: "activeUser",
        title: "Active User",
        type: "basic",
        link: "/manage-user/active-user",
      },
     
      {
        id: "archcivedUser",
        title: "Archive User",
        type: "basic",
        link: "/manage-user/archived-users",
      },
     
      {
        id: "resetPassword",
        title: "Reset Password",
        type: "basic",
        link: "/manage-user/reset-password-request",
      }
    ],
  },
  // {
  //     id   : '45456',
  //     title: 'Revoke Approval',
  //     type : 'basic',
  //     icon : 'heroicons_outline:chart-pie',
  //     link : '/revoke-approval'
  // },
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
