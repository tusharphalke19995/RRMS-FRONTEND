import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FolderTreeService } from "./services/folder-tree.service";
import { FolderNode, FileNode } from "./models/folder-tree.model";
import { MatDialog } from "@angular/material/dialog";
import { MoveFileDialogComponent } from "./pages/move-file-dialog/move-file-dialog.component";
import {
  MergeCaseDialogComponent,
  MergeCaseDialogResult,
} from "./pages/merge-case-dialog/merge-case-dialog.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { fuseAnimations } from "@fuse/animations";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { ImagePreviewFolderDailogComponent } from "./pages/image-preview-folder-dailog/image-preview-folder-dailog.component";

@Component({
  selector: "app-folder-tree",
  templateUrl: "./folder-tree.component.html",
  styleUrls: ["./folder-tree.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  animations: [
    fuseAnimations,
    trigger("rotateIcon", [
      state("collapsed", style({ transform: "rotate(0deg)" })),
      state("expanded", style({ transform: "rotate(90deg)" })),
      transition("collapsed <=> expanded", animate("200ms ease-in-out")),
    ]),
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(20px)" }),
        animate("200ms ease-out", style({ opacity: 1, transform: "translateY(0)" }))
      ]),
      transition(":leave", [
        animate("200ms ease-in", style({ opacity: 0, transform: "translateY(20px)" }))
      ])
    ]),
  ],
})
export class FolderTreeComponent implements OnInit {
  treeControl = new NestedTreeControl<FolderNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<FolderNode>();
  selectedItem: FolderNode | FileNode | null = null;
  breadcrumbs: FolderNode[] = [];
  searchFilter: string = "";
  displayItems: (FolderNode | FileNode)[] = [];
  items: any;
  finalFileId: any;
  finalYear: any;
  finalCaseNo: any;
  finalcaseType: any;
  finalFileTypeId: any;
  finalDocumentTypeId: any;
  finalDestination: any[];
  selectedFiles: FileNode[] = [];
  selectedFileIds: number[] = [];
  currentFolder: FolderNode | null = null;
  finalUnitId: any;
  isLoading: boolean = false;
  showScrollToTop: boolean = false;
  scrollProgress: number = 0;

  constructor(
    private folderTreeService: FolderTreeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this.dataSource.data = [];
  }

  ngOnInit(): void {
    this.loadFolderTree();
  }

  hasChild = (_: number, node: FolderNode) =>
    !!node.children && node.children.length > 0;

  loadFolderTree(): void {
    this.isLoading = true;
    const payload = {
      division_id: sessionStorage.getItem("divisionID"),
    };
    this.folderTreeService.folderTreeView(payload).subscribe({
      next: (response: any) => {
        if (response) {
          console.log("Raw API response:", response);
          const processedData = this.processTreeData(response);
          console.log("Processed folder tree data:", processedData);

          // Check if files exist in the data
          this.checkForFiles(processedData);

          this.dataSource.data = processedData;
          this.treeControl.dataNodes = processedData;
          // Keep tree collapsed initially - removed expandAll()
          this.updateDisplayItems();
          // Set root as current folder
          this.currentFolder = null;
          this.breadcrumbs = [];
          this.isLoading = false;
          
          // Restore scroll position after data loads
          setTimeout(() => {
            this.restoreScrollPosition();
          }, 200);
        } else {
          console.error("Invalid data format received");
          this.snackBar.open(
            "Error loading folder tree: Invalid data format",
            "Close",
            {
              duration: 3000,
              horizontalPosition: "end",
              verticalPosition: "top",
            }
          );
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading folder tree:", error);
        this.snackBar.open("Error loading folder tree", "Close", {
          duration: 3000,
          horizontalPosition: "end",
          verticalPosition: "top",
        });
        this.isLoading = false;
      },
    });
  }

  checkForFiles(nodes: FolderNode[]): void {
    let totalFiles = 0;
    let foldersWithFiles = 0;

    const checkNode = (node: FolderNode) => {
      if (node.files && node.files.length > 0) {
        totalFiles += node.files.length;
        foldersWithFiles++;
        console.log(
          `Folder "${node.name}" has ${node.files.length} files:`,
          node.files
        );
      }

      if (node.children) {
        node.children.forEach(checkNode);
      }
    };

    nodes.forEach(checkNode);

    console.log(`Total files found: ${totalFiles}`);
    console.log(`Folders with files: ${foldersWithFiles}`);
  }

  processTreeData(data: any[]): FolderNode[] {
    return data.map((item) => ({
      ...item,
      children: item.children ? this.processTreeData(item.children) : [],
      files: item.files || [],
    }));
  }

  toggleNode(node: FolderNode, event: Event): void {
    event.stopPropagation(); // Prevent node selection when toggling
    
    // Add visual feedback
    const button = event.target as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    }
    
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  expandAll(): void {
    if (this.treeControl.dataNodes) {
      this.treeControl.expandAll();
      this.snackBar.open('All folders expanded', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  collapseAll(): void {
    if (this.treeControl.dataNodes) {
      this.treeControl.collapseAll();
      this.snackBar.open('All folders collapsed', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  // Expand specific node with animation
  expandNode(node: FolderNode): void {
    if (!this.treeControl.isExpanded(node)) {
      this.treeControl.expand(node);
    }
  }

  // Collapse specific node with animation
  collapseNode(node: FolderNode): void {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    }
  }

  // Get node level for better visual hierarchy
  getNodeLevel(node: FolderNode): number {
    return node.level ? parseInt(node.level) : 0;
  }

  // Check if node has children or files
  hasContent(node: FolderNode): boolean {
    return (node.children && node.children.length > 0) || (node.files && node.files.length > 0);
  }

  // Get total count of items in a node (folders + files)
  getNodeItemCount(node: FolderNode): number {
    const folderCount = node.children ? node.children.length : 0;
    const fileCount = node.files ? node.files.length : 0;
    return folderCount + fileCount;
  }

  // Check if node is a leaf (no children or files)
  isLeafNode(node: FolderNode): boolean {
    return !this.hasContent(node);
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent, node: FolderNode): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleNode(node, event);
        break;
      case 'ArrowRight':
        if (!this.treeControl.isExpanded(node)) {
          event.preventDefault();
          this.treeControl.expand(node);
        }
        break;
      case 'ArrowLeft':
        if (this.treeControl.isExpanded(node)) {
          event.preventDefault();
          this.treeControl.collapse(node);
        }
        break;
    }
  }

  // Scroll to top functionality
  scrollToTop(): void {
    const treeSection = document.querySelector('.tree-section') as HTMLElement;
    if (treeSection) {
      treeSection.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  // Scroll to specific node
  scrollToNode(node: FolderNode): void {
    setTimeout(() => {
      const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
      if (nodeElement) {
        nodeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }

  // Handle scroll events
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.showScrollToTop = target.scrollTop > 300;
    
    // Calculate scroll progress
    const scrollHeight = target.scrollHeight - target.clientHeight;
    this.scrollProgress = scrollHeight > 0 ? (target.scrollTop / scrollHeight) * 100 : 0;
    
    // Throttle scroll events for better performance
    this.throttleScrollEvent();
  }

  // Throttle scroll events
  private scrollTimeout: any;
  private throttleScrollEvent(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      // Additional scroll-based optimizations can be added here
      this.updateScrollPosition();
    }, 100);
  }

  // Update scroll position for performance optimizations
  private updateScrollPosition(): void {
    const treeSection = document.querySelector('.tree-section') as HTMLElement;
    if (treeSection) {
      // Store scroll position for potential restoration
      sessionStorage.setItem('folderTreeScrollPosition', treeSection.scrollTop.toString());
    }
  }

  // Restore scroll position
  restoreScrollPosition(): void {
    const savedPosition = sessionStorage.getItem('folderTreeScrollPosition');
    if (savedPosition) {
      const treeSection = document.querySelector('.tree-section') as HTMLElement;
      if (treeSection) {
        setTimeout(() => {
          treeSection.scrollTop = parseInt(savedPosition);
        }, 100);
      }
    }
  }

  isExpanded(node: FolderNode): boolean {
    return this.treeControl.isExpanded(node);
  }

  toggleItemSelection(item: FolderNode | FileNode): void {
    if (this.isFile(item)) {
      const index = this.selectedFiles.findIndex(
        (i) => i.file_id === item.file_id
      );
      if (index === -1) {
        this.selectedFiles.push(item as FileNode);
        this.selectedFileIds.push(item.file_id);
      } else {
        this.selectedFiles.splice(index, 1);
        this.selectedFileIds = this.selectedFileIds.filter(
          (id) => id !== item.file_id
        );
      }
    }
  }

  isItemSelected(item: FolderNode | FileNode): boolean {
    if (this.isFile(item)) {
      return this.selectedFiles.some((file) => file.file_id === item.file_id);
    }
    return false;
  }

  getItemIcon(item: FolderNode | FileNode): string {
    if ("children" in item) {
      return "folder";
    }
    return this.getFileIcon(item as FileNode);
  }

  getFileIcon(file: FileNode): string {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "picture_as_pdf";
      case "doc":
      case "docx":
        return "description";
      case "xls":
      case "xlsx":
        return "table_chart";
      case "jpg":
      case "jpeg":
      case "png":
        return "image";
      default:
        return "insert_drive_file";
    }
  }

  getFileExtension(file: FileNode): string {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "pdf";
      case "doc":
        return "doc";
      case "docx":
        return "docx";
      case "xls":
        return "xls";
      case "xlsx":
        return "xlsx";
      case "jpg":
        return "jpg";
      case "jpeg":
        return "jpeg";
      case "png":
        return "png";
      case "ppt":
        return "ppt";
      case "pptx":
        return "pptx";
      default:
        return "default";
    }
  }

  getItemSize(item: FolderNode | FileNode): string {
    if (this.isFile(item)) {
      const size = item.fileSize || 0;
      if (size < 1024) return size + " B";
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
      if (size < 1024 * 1024 * 1024)
        return (size / (1024 * 1024)).toFixed(1) + " MB";
      return (size / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }
    return "";
  }

  getItemType(item: FolderNode | FileNode): string {
    if (this.isFile(item)) {
      const extension = item.name.split(".").pop()?.toUpperCase() || "";
      return extension ? `${extension} File` : "File";
    }
    return "Folder";
  }

  getCurrentItems(): (FolderNode | FileNode)[] {
    let items: (FolderNode | FileNode)[] = [];
    let folder: FolderNode[] = this.dataSource.data;
    if (this.currentFolder) {
      items = [
        ...(this.currentFolder.children || []),
        ...(this.currentFolder.files || []),
      ];
    } else {
      // root level
      items = [...(folder || [])];
    }
    if (this.searchFilter) {
      return this.filterItems(items);
    }
    return items;
  }

  updateDisplayItems(): void {
    this.displayItems = this.getCurrentItems();
  }

  private filterItems(
    items: (FolderNode | FileNode)[]
  ): (FolderNode | FileNode)[] {
    const filter = this.searchFilter.toLowerCase();
    return items.filter((item) => {
      const matches = item.name.toLowerCase().includes(filter);
      if ("children" in item) {
        const childMatches = this.filterItems(item.children);
        return matches || childMatches.length > 0;
      }
      return matches;
    });
  }

  canMoveSelectedItems(): boolean {
    return (
      this.selectedFiles.length > 0 &&
      this.selectedFiles.every((item) => this.isFile(item))
    );
  }

  canCopySelectedItems(): boolean {
    return (
      this.selectedFiles.length > 0 &&
      this.selectedFiles.every((item) => this.isFile(item))
    );
  }
  openMoveFileDialog(mode: 'move' | 'copy'): void {
    if (this.selectedFiles.length === 0) {
      this.snackBar.open("Please select at least one file to move", "Close", {
        duration: 3000,
        horizontalPosition: "end",
        verticalPosition: "top",
      });
      return;
    }

    const dialogRef = this.dialog.open(MoveFileDialogComponent, {
      width: "800px",
      height: "600px",
      data: { selectedFiles: this.selectedFiles ,mode},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let payload: Record<string, any>;
        let apiCall;

        if (result.type === "copy") {
          // Copy Files
          const divisionID = Number(sessionStorage.getItem("divisionID"));
          payload = {
            divisionId: divisionID,
            file_ids: result.files.map((file) => file.file_id),
          };
          // Add optional parameters for copy
          const optionalParams = {
            year: result.year,
            unitId: result.unitId,
            caseNo: result.caseNo,
            caseType: result.caseType,
            fileTypeId: result.fileTypeId, // Note camelCase
            documentTypeId: result.documentTypeId,
          };
          Object.entries(optionalParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              payload[key] = value;
            }
          });
          apiCall = this.folderTreeService.copyFilesInfo(payload);
        } else {
          // Move Files
          const departmentID = Number(sessionStorage.getItem("departmentID"));
          payload = {
            deptId: departmentID,
            file_ids: result.files.map((file) => file.file_id),
          };
          // Add optional parameters for move
          const optionalParams = {
            year: result.year,
            unitId: result.unitId,
            caseNo: result.caseNo,
            caseType: result.caseType,
            file_type_id: result.fileTypeId, // Note snake_case
            document_type_id: result.documentTypeId,
          };
          Object.entries(optionalParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              payload[key] = value;
            }
          });
          apiCall = this.folderTreeService.moveFilesInfo(payload);
        }

        // Now call the API
        apiCall.subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.snackBar.open(
                `Successfully ${result.type === "copy" ? "copied" : "moved"} ${
                  result.files.length
                } file${result.files.length > 1 ? "s" : ""}.`,
                "Close",
                {
                  duration: 3000,
                  horizontalPosition: "right",
                  verticalPosition: "top",
                  panelClass: ["green-snackbar"],
                }
              );
              this.loadFolderTree();
              this.selectedFiles = [];
              this.selectedFileIds = [];
              this.finalYear = null;
              this.finalCaseNo = null;
              this.finalcaseType = null;
              this.finalFileTypeId = null;
              this.finalDocumentTypeId = null;
            } else {
              this.snackBar.open(
                response?.message ||
                  `Successfully ${
                    result.type === "copy" ? "copied" : "moved"
                  } ${result.files.length} file${
                    result.files.length > 1 ? "s" : ""
                  }.`,
                "Close",
                {
                  duration: 3000,
                  horizontalPosition: "right",
                  verticalPosition: "top",
                  panelClass: ["green-snackbar"],
                }
              );
              this.loadFolderTree();
              this.selectedFiles = [];
              this.selectedFileIds = [];
              this.finalYear = null;
              this.finalCaseNo = null;
              this.finalcaseType = null;
              this.finalFileTypeId = null;
              this.finalDocumentTypeId = null;
            }
          },
          error: (error) => {
            console.error(
              `Error ${result.type === "copy" ? "copying" : "moving"} files:`,
              error
            );
            this.snackBar.open(
              error?.error?.message ||
                `Successfully ${result.type === "copy" ? "copied" : "moved"} ${
                  result.files.length
                } file${result.files.length > 1 ? "s" : ""}.`,
              "Close",
              {
                duration: 3000,
                horizontalPosition: "right",
                verticalPosition: "top",
                panelClass: ["green-snackbar"],
              }
            );
            this.loadFolderTree();
            this.selectedFiles = [];
            this.selectedFileIds = [];
            this.finalYear = null;
            this.finalCaseNo = null;
            this.finalcaseType = null;
            this.finalFileTypeId = null;
            this.finalDocumentTypeId = null;
          },
        });
      }
    });
  }

  // finallMoveFiles() {
  //   const departmentID = Number(sessionStorage.getItem("departmentID"));
  //   if (!departmentID) {
  //     this._snackBar.open("Department ID missing. Please try again.", "Close", {
  //       duration: 3000,
  //       horizontalPosition: "right",
  //       verticalPosition: "top",
  //       panelClass: ["error-snackbar"],
  //     });
  //     return;
  //   }

  //   if (!this.selectedFileIds || this.selectedFileIds.length === 0) {
  //     this._snackBar.open("Please select at least one file to move.", "Close", {
  //       duration: 3000,
  //       horizontalPosition: "right",
  //       verticalPosition: "top",
  //       panelClass: ["error-snackbar"],
  //     });
  //     return;
  //   }
  //   const payload: Record<string, any> = {
  //     deptId: departmentID,
  //     file_ids: this.selectedFileIds,
  //   };

  //   const optionalParams = {
  //     year: this.finalYear,
  //     unitId:this.finalUnitId,
  //     caseNo: this.finalCaseNo,
  //     caseType: this.finalcaseType,
  //     file_type_id: this.finalFileTypeId,
  //     document_type_id: this.finalDocumentTypeId,
  //   };
  //   Object.entries(optionalParams).forEach(([key, value]) => {
  //     if (value !== undefined && value !== null && value !== "") {
  //       payload[key] = value;
  //     }
  //   });

  //   console.log("Moving files with payload:", payload);

  //   this.folderTreeService.moveFilesInfo(payload).subscribe({
  //     next: (response: any) => {
  //       if (response?.success) {
  //         this._snackBar.open(
  //           `Successfully moved ${this.selectedFileIds.length} file${
  //             this.selectedFileIds.length > 1 ? "s" : ""
  //           }.`,
  //           "Close",
  //           {
  //             duration: 3000,
  //             horizontalPosition: "right",
  //             verticalPosition: "top",
  //             panelClass: ["green-snackbar"],
  //           }
  //         );
  //         this.loadFolderTree();
  //         this.selectedFiles = [];
  //         this.selectedFileIds = [];
  //         this.finalYear = null;
  //         this.finalCaseNo = null;
  //         this.finalcaseType = null;
  //         this.finalFileTypeId = null;
  //         this.finalDocumentTypeId = null;
  //       } else {
  //         this._snackBar.open(
  //           response?.message || "Failed to move files. Please try again.",
  //           "Close",
  //           {
  //             duration: 3000,
  //             horizontalPosition: "right",
  //             verticalPosition: "top",
  //             panelClass: ["error-snackbar"],
  //           }
  //         );
  //       }
  //     },
  //     error: (error) => {
  //       console.error("Error moving files:", error);
  //       this._snackBar.open(
  //         error?.error?.message || "Failed to move files. Please try again.",
  //         "Close",
  //         {
  //           duration: 3000,
  //           horizontalPosition: "right",
  //           verticalPosition: "top",
  //           panelClass: ["red-snackbar"],
  //         }
  //       );
  //     },
  //   });
  // }

  selectedFilesArchive() {
    if (!this.selectedFileIds || this.selectedFileIds.length === 0) {
      this._snackBar.open(
        "Please select at least one file to archive.",
        "Close",
        {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["red-snackbar"],
        }
      );
      return;
    }

    const payload = {
      file_id: this.selectedFileIds,
    };

    this.folderTreeService.archiveFiles(payload).subscribe({
      next: (res: any) => {
        this._snackBar.open("Files archived successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.loadFolderTree();
        this.selectedFiles = [];
        this.selectedFileIds = [];
      },
      error: (err) => {
        console.error("Error archiving files:", err);
        this._snackBar.open("Failed to archive files", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["red-snackbar"],
        });
      },
    });
  }

  selectedCaseNoForMerge(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this._snackBar.open(
        "Please select at least one file to merge.",
        "Close",
        {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["red-snackbar"],
        }
      );
      return;
    }

    // Open the merge case dialog
    const dialogRef = this.dialog.open(MergeCaseDialogComponent, {
      width: "900px",
      // maxWidth: "90vw",
      data: { selectedFiles: this.selectedFiles },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: MergeCaseDialogResult) => {
      if (result) {
        this.performMergeOperation(result);
      }
    });
  }

  openMergeCaseDialog(): void {
    // Open the merge case dialog without requiring selected files
    const dialogRef = this.dialog.open(MergeCaseDialogComponent, {
      width: "600px",
      maxWidth: "90vw",
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: MergeCaseDialogResult) => {
      if (result) {
        this.performMergeOperation(result);
      }
    });
  }

  private performMergeOperation(result: MergeCaseDialogResult): void {
    const payload = {
      sourceCaseNo: result.sourceCaseNo,
      destinationCaseNo: result.destinationCaseNo,
    };

    console.log("Merging folders with payload:", payload);

    this.folderTreeService.mergeFolders(payload).subscribe({
      next: (response: any) => {
        this._snackBar.open(
          `Successfully merged case ${result.sourceCaseNo} into ${result.destinationCaseNo}`,
          "Close",
          {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["green-snackbar"],
          }
        );

        // Refresh the folder tree
        this.loadFolderTree();

        // Clear selections
        this.selectedFiles = [];
        this.selectedFileIds = [];
      },
      error: (error) => {
        console.error("Error merging folders:", error);
        this._snackBar.open(
          error?.error?.message || "Failed to merge folders. Please try again.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["red-snackbar"],
          }
        );
      },
    });
  }

  isFile(node: any): node is FileNode {
    return "file_id" in node;
  }

  openFolder(folder: FolderNode): void {
    this.currentFolder = folder;
    this.breadcrumbs.push(folder);
    this.updateDisplayItems();
  }

  navigateToBreadcrumb(index: number): void {
    if (index === -1) {
      this.currentFolder = null;
      this.breadcrumbs = [];
    } else {
      this.currentFolder = this.breadcrumbs[index];
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    }
    this.updateDisplayItems();
  }

  navigateToRoot(): void {
    this.currentFolder = null;
    this.breadcrumbs = [];
    this.updateDisplayItems();
  }

  navigateToFolder(folder: FolderNode): void {
    this.openFolder(folder);
  }

  viewImage(data) {
    const dialogRef = this.dialog.open(ImagePreviewFolderDailogComponent, {
      data: data,
      width: "850px",
      maxWidth: "100vw",
      height: "90vh",
      panelClass: "custom-dialog-class",
    });

    dialogRef.afterClosed().subscribe(() => {});
    return;
  }
}
