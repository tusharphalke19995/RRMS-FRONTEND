import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FolderTreeService } from './services/folder-tree.service';
import { FolderNode, FileNode } from './models/folder-tree.model';
import { MatDialog } from '@angular/material/dialog';
import { MoveFileDialogComponent } from './pages/move-file-dialog/move-file-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { fuseAnimations } from '@fuse/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-folder-tree',
  templateUrl: './folder-tree.component.html',
  styleUrls: ['./folder-tree.component.scss'],
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
    MatMenuModule
  ],
  animations: [
    fuseAnimations,
    trigger('rotateIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(90deg)' })),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ]
})
export class FolderTreeComponent implements OnInit {
  treeControl = new NestedTreeControl<FolderNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FolderNode>();
  selectedItem: FolderNode | FileNode | null = null;
  breadcrumbs: FolderNode[] = [];
  searchFilter: string = '';
  viewMode: 'grid' | 'list' = 'list';
  displayItems: (FolderNode | FileNode)[] = [];
  items: any;
  finalFileId: any;
  finalYear: any;
  finalCaseNo: any;
  finalcaseType: any;
  finalFileTypeId: any;
  finalDocumentTypeId: any;
  finalDestination: any[];
  selectedItems: (FolderNode | FileNode)[] = [];
  selectedFileIds: number[] = [];

  constructor(
    private folderTreeService: FolderTreeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog, private _snackBar: MatSnackBar,
  ) {
    this.dataSource.data = [];
  }

  ngOnInit(): void {
    this.loadFolderTree();
  }

  hasChild = (_: number, node: FolderNode) => !!node.children && node.children.length > 0;

  loadFolderTree(): void {
    const payload = {
      division_id: sessionStorage.getItem("divisionID")
    };
    this.folderTreeService.folderTreeView(payload).subscribe({
      next: (response: any) => {
        if (response) {
          const processedData = this.processTreeData(response);
          this.dataSource.data = processedData;
          this.treeControl.dataNodes = processedData;
          this.updateDisplayItems();
        } else {
          console.error('Invalid data format received');
          this.snackBar.open('Error loading folder tree: Invalid data format', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        console.error('Error loading folder tree:', error);
        this.snackBar.open('Error loading folder tree', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  processTreeData(data: any[]): FolderNode[] {
    return data.map(item => ({
      ...item,
      children: item.children ? this.processTreeData(item.children) : [],
      files: item.files || []
    }));
  }

  toggleNode(node: FolderNode, event: Event): void {
    event.stopPropagation(); // Prevent node selection when toggling
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  expandAll(): void {
    if (this.treeControl.dataNodes) {
      this.treeControl.expandAll();
    }
  }

  collapseAll(): void {
    if (this.treeControl.dataNodes) {
      this.treeControl.collapseAll();
    }
  }

  isExpanded(node: FolderNode): boolean {
    return this.treeControl.isExpanded(node);
  }

  toggleItemSelection(item: FolderNode | FileNode): void {
    if (this.isFile(item)) {
      const index = this.selectedItems.findIndex(i => i === item);
      if (index === -1) {
        this.selectedItems.push(item);
        this.selectedFileIds.push(item.file_id);
      } else {
        this.selectedItems.splice(index, 1);
        this.selectedFileIds = this.selectedFileIds.filter(id => id !== item.file_id);
      }
    } else {
      // If it's a folder, deselect it
      const index = this.selectedItems.findIndex(i => i === item);
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
      }
    }
  }

  isItemSelected(item: FolderNode | FileNode): boolean {
    return this.selectedItems.includes(item);
  }

  getItemIcon(item: FolderNode | FileNode): string {
    if ('children' in item) {
      return 'folder';
    }
    return this.getFileIcon(item as FileNode);
  }

  getFileIcon(file: FileNode): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      default: return 'insert_drive_file';
    }
  }

  getItemSize(item: FolderNode | FileNode): string {
    if (this.isFile(item)) {
      const size = item.fileSize || 0;
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
      return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return '';
  }

  getItemType(item: FolderNode | FileNode): string {
    if (this.isFile(item)) {
      const extension = item.name.split('.').pop()?.toUpperCase() || '';
      return extension ? `${extension} File` : 'File';
    }
    return 'Folder';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    this.updateDisplayItems();
  }

  navigateToFolder(folder: FolderNode): void {
    const index = this.breadcrumbs.indexOf(folder);
    if (index === -1) {
      this.breadcrumbs.push(folder);
    } else {
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    }
    this.updateDisplayItems();
  }

  navigateToRoot(): void {
    this.breadcrumbs = [];
    this.updateDisplayItems();
  }

  navigateBack() {
    if (this.breadcrumbs.length > 0) {
      this.breadcrumbs.pop();
      this.updateDisplayItems();
    }
  }

  updateDisplayItems(): void {
    if (this.searchFilter) {
      this.displayItems = this.filterItems(this.dataSource.data);
    } else {
      this.displayItems = this.dataSource.data;
    }
  }

  private filterItems(items: (FolderNode | FileNode)[]): (FolderNode | FileNode)[] {
    const filter = this.searchFilter.toLowerCase();
    return items.filter(item => {
      const matches = item.name.toLowerCase().includes(filter);
      if ('children' in item) {
        const childMatches = this.filterItems(item.children);
        return matches || childMatches.length > 0;
      }
      return matches;
    });
  }

  canMoveSelectedItems(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.every(item => this.isFile(item));
  }

  openMoveFileDialog(file?: FileNode) {
    const filesToMove = file ? [file] : this.selectedItems.filter(item => this.isFile(item)) as FileNode[];
    
    if (filesToMove.length === 0) {
      this.snackBar.open('Please select at least one file to move', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    const dialogRef = this.dialog.open(MoveFileDialogComponent, {
      width: "800px",
      height: "600px",
      data: { selectedFiles: filesToMove }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loadFolderTree();
        this.selectedItems = [];
        this.selectedFileIds = [];
      }
    });
  }

  finallMoveFiles() {
    const departmentID = Number(sessionStorage.getItem("departmentID"));
    if (!departmentID) {
      this._snackBar.open("Department ID missing. Please try again.", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }

    if (!this.selectedFileIds || this.selectedFileIds.length === 0) {
      this._snackBar.open("Please select at least one file to move.", "Close", {
        duration: 3000,
        horizontalPosition: "right",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }

    // Create base payload
    const payload: Record<string, any> = {
      deptId: departmentID,
      file_ids: this.selectedFileIds
    };

    // Add optional parameters if they exist
    const optionalParams = {
      year: this.finalYear,
      caseNo: this.finalCaseNo,
      caseType: this.finalcaseType,
      file_type_id: this.finalFileTypeId,
      document_type_id: this.finalDocumentTypeId
    };

    // Only add parameters that have values
    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload[key] = value;
      }
    });

    console.log("Moving files with payload:", payload);

    this.folderTreeService.moveFilesInfo(payload).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this._snackBar.open(
            `Successfully moved ${this.selectedFileIds.length} file${this.selectedFileIds.length > 1 ? 's' : ''}.`,
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
          this.selectedItems = [];
          this.selectedFileIds = [];
          this.finalYear = null;
          this.finalCaseNo = null;
          this.finalcaseType = null;
          this.finalFileTypeId = null;
          this.finalDocumentTypeId = null;
        } else {
          this._snackBar.open(
            response?.message || "Failed to move files. Please try again.",
            "Close",
            {
              duration: 3000,
              horizontalPosition: "right",
              verticalPosition: "top",
              panelClass: ["error-snackbar"],
            }
          );
        }
      },
      error: (error) => {
        console.error("Error moving files:", error);
        this._snackBar.open(
          error?.error?.message || "Failed to move files. Please try again.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          }
        );
      }
    });
  }

  selectedFilesArchive() {
    const payload = {
      file_id: this.finalFileId,
    };

    this.folderTreeService.archiveFiles(payload).subscribe({
      next: (res: any) => {
        this._snackBar.open("File Archive successfully", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["green-snackbar"],
        });
        this.loadFolderTree();
      },
      error: (err) => {
        console.error("Error archiving file:", err);
        this._snackBar.open("Failed to File Archive", "Close", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  isFile(node: any): node is FileNode {
    return 'file_id' in node;
  }
}