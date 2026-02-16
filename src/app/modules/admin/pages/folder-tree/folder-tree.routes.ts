import { Routes } from "@angular/router";
import { FolderTreeComponent } from "./folder-tree.component";
import { PdfPreviewComponent } from "./pages/pdf-preview/pdf-preview.component";

export default [
  {
    path: "",
    component: FolderTreeComponent,
  },
  {
    path: "folder-pdf-view",
    component: PdfPreviewComponent,
  },
] as Routes;
