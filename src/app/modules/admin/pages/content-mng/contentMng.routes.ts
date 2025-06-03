import { Routes } from "@angular/router";
import { ContentMngComponent } from "./content-mng.component";
import { ContentDetailsComponent } from "./content-details/content-details.component";
import { ContentDetailsCaseComponent } from "./content-details-csno /content-details-csno.component";
import { ContentCaseTypeIdDetailsComponent } from "./content-details-casetypeid/content-details-casetypeid.component";
import { ContentCaseFiletypeIdDetailsComponent } from "./content-details-filetypeid/content-details-filetypeid.component";
import { ContentCaseDocumentTypeIdDetailsComponent } from "./content-details-documenttypeid/content-details-documenttypeid.component";

export default [
  {
    path: "",
    component: ContentMngComponent,
  },
  { path: "folders", component: ContentDetailsComponent },
  { path: "folders/caseNo", component: ContentDetailsCaseComponent },
  {
    path: "folders/caseNo/caseTypeid",
    component: ContentCaseTypeIdDetailsComponent,
  },
  {
    path: "folders/caseNo/caseTypeid/filetypeid",
    component: ContentCaseFiletypeIdDetailsComponent,
  },
   {
    path: "folders/caseNo/caseTypeid/filetypeid/documenttypeid",
    component: ContentCaseDocumentTypeIdDetailsComponent,
  },
] as Routes;
