import { Routes } from "@angular/router";
import { RoleComponent } from "./role/role.component";
import { DivisionComponent } from "./division/division.component";
import { DesignationsComponent } from "./designations/designations.component";
import { FileTypeComponent } from "./file-type/file-type.component";
import { FileClassificationComponent } from "./file-classification/file-classification.component";
import { CaseStatusComponent } from "./case-status/case-status.component";
import { DepartmentComponent } from "./department/department.component";
import { DesignationHierarchyComponent } from "./designation-hierarchy/designations-hierarchy.component";
import { CaseFilesComponent } from "./case-files/case-files.component";
import { FileCorrespondenceComponent } from "./file-correspondence/file-correspondence.component";
import { EmailDomainComponent } from "./email-domain/email-domain.component";
import { SMTPSettingComponent } from "./SMTP Setting/smtp-setting.component";

export default [
  {
    path: "role",
    component: RoleComponent,
  },

  {
    path: "case-status",
    component: CaseStatusComponent,
  },
  {
    path: "file-classification",
    component: FileClassificationComponent,
  },
  {
    path: "file-type",
    component: FileTypeComponent,
  },
  {
    path: "case-files",
    component: CaseFilesComponent,
  },
  {
    path: "file-Correspondence",
    component: FileCorrespondenceComponent,
  },
  {
    path: "smtp-setting",
    component: SMTPSettingComponent,
  },
  {
    path: "email-domain-mng",
    component: EmailDomainComponent,
  },
] as Routes;
