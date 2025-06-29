import { Component, Inject, ViewEncapsulation, OnInit, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import { NestedTreeControl } from "@angular/cdk/tree";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from "@angular/material/dialog";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatSnackBar } from "@angular/material/snack-bar";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject } from "rxjs";

import { DatePipe } from '@angular/common';
import { FolderTreeService } from "../../services/folder-tree.service";
import { FolderNode, FileNode } from '../../models/folder-tree.model';
import { FileIconPipe } from "../../pipe/fileIcon";

interface ApiResponse {
  success: boolean;
  data: any[];
  message?: string;
}

interface MoveFileResponse {
  success: boolean;
  message?: string;
}

export interface MoveFileDialogData {
  selectedFiles: FileNode[];
  unitId:string;
  year?: string;
  caseNo?: string;
  caseTypeId?: string;
  fileTypeId?: string;
  documentTypeId?: string;
  mode:string;
}

export interface MoveFileDialogResult {
  files: FileNode[];
  destination?: any[];
  type: 'move' | 'archive' | 'copy';
  year?: string;
  unitId?:string;
  caseNo?: string;
  caseType?: string;
  fileTypeId?: string;
  documentTypeId?: string;
}

@Component({
  selector: "app-move-file-dialog",
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    MatSelectModule,
    MatDatepickerModule,
    TranslocoModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    MatRippleModule,
    CurrencyPipe,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    MatTooltipModule,
    FileIconPipe,
    MatTreeModule,
    MatDialogModule,
    DatePipe,
  ],
  templateUrl: "./move-file-dialog.component.html",
  styleUrl: "./move-file-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rotateIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(90deg)' })),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ]
})
export class MoveFileDialogComponent implements OnInit {
  treeControl = new NestedTreeControl<FolderNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FolderNode>();
  selectedNode: FolderNode | null = null;
  loading$ = new BehaviorSubject<boolean>(false);
  selectedFiles: FileNode[] = [];
  fileDetails: FileNode[] = [];
  navigationStack: any[] = [];
  items: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<MoveFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveFileDialogData,
    private folderTreeService: FolderTreeService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    if (!data?.selectedFiles?.length) {
      this.snackBar.open('No files selected for moving', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.dialogRef.close();
      return;
    }
    this.selectedFiles = data.selectedFiles;
    this.processFileDetails();
  }

  ngOnInit(): void {
    this.loadFolderTree();
  }

  processFileDetails(): void {
    if (!this.selectedFiles.length) return;

    this.fileDetails = this.selectedFiles.map(file => ({
      name: file.name,
      file_id: file.file_id
    }));
    
    this.cdr.markForCheck();
  }

  isValidDestination(node: FolderNode): boolean {
    // Check if the node is a folder and not a file
    return !node.isFile && node.type === 'folder';
  }

  private getFileType(extension: string): string {
    if (!extension) return 'Unknown';
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      case 'txt':
        return 'Text File';
      case 'zip':
      case 'rar':
        return 'Archive';
      default:
        return 'Unknown';
    }
  }

  hasChild = (_: number, node: FolderNode) => !!node.children && node.children.length > 0;
  isLeaf = (_: number, node: FolderNode) => !node.children || node.children.length === 0;

  getIcon(fileName: string | undefined): string {
    if (!fileName) return 'insert_drive_file';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'insert_drive_file';

    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'txt':
        return 'article';
      case 'zip':
      case 'rar':
        return 'folder_zip';
      default:
        return 'insert_drive_file';
    }
  }

  getLevelClass(level: string): string {
    switch (level) {
      case 'division':
        return 'level-division';
      case 'year':
        return 'level-year';
      case 'unitId':
        return 'level-unitId'; 
      case 'caseNo':
        return 'level-caseNo';
      case 'caseType':
        return 'level-caseType';
      case 'filetype':
        return 'level-filetype';
      case 'documenttype':
        return 'level-documenttype';
      default:
        return '';
    }
  }

  loadFolderTree(): void {
    this.loading$.next(true);
    const payload = {
      division_id: sessionStorage.getItem("divisionID")
    };

    this.folderTreeService.folderTreeView(payload).subscribe({
      next: (response: any) => {
        let processedData: FolderNode[] = [];
        
        if (Array.isArray(response)) {
          processedData = this.processTreeData(response);
        } else if (response?.data && Array.isArray(response.data)) {
          processedData = this.processTreeData(response.data);
        }

        this.dataSource.data = processedData;
        this.treeControl.dataNodes = processedData;
        
        // Log the tree structure for debugging
        this.logTreeStructure(processedData);
        
        if (processedData.length > 0) {
          this.treeControl.expand(processedData[0]);
        }
      },
      error: (error) => {
        console.error('Error loading folder tree:', error);
        this.snackBar.open('Error loading folder tree', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      complete: () => {
        this.loading$.next(false);
        this.cdr.detectChanges();
      }
    });
  }

  private logTreeStructure(nodes: FolderNode[], depth: number = 0): void {
    const indent = '  '.repeat(depth);
    nodes.forEach(node => {
      console.log(`${indent}- ${node.name} (${node.level}) [ID: ${node.id}]`);
      if (node.children && node.children.length > 0) {
        this.logTreeStructure(node.children, depth + 1);
      }
    });
  }

  private processTreeData(data: any[]): FolderNode[] {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      level: item.level,
      type: item.type || 'folder',
      path: item.path,
      children: item.children ? this.processTreeData(item.children) : [],
      files: item.files || []
    }));
  }

  toggleNode(node: FolderNode, event: Event): void {
    event.stopPropagation();
    this.treeControl.toggle(node);
    this.cdr.detectChanges();
  }

  selectNode(node: FolderNode): void {
    if (!node || node.type !== 'folder') {
      return;
    }

    // Don't allow selecting division level (level 0)
    if (node.level === 'division') {
      this.snackBar.open('Cannot select division level', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    this.selectedNode = node;
    this.navigationStack = [];
    this.items = [];

    // Get the complete path from root to selected node
    const path = this.getNodePath(node);
    console.log('Complete path from root to selected node:', path);
    
    // Update navigation stack and items based on node levels
    path.forEach(pathNode => {
      const nodeData = {
        id: pathNode.id,
        level: pathNode.level,
        name: pathNode.name
      };
      console.log('Processing path node:', nodeData);

      switch (pathNode.level) {
        case 'year':
          this.navigationStack.push(nodeData);
          break;
        case 'unitId':
          this.navigationStack.push(nodeData);
          break;
        case 'caseNo':
          this.navigationStack.push(nodeData);
          break;
        case 'caseType':
          this.navigationStack.push(nodeData);
          break;
        case 'filetype':
          this.items.push(nodeData);
          break;
        case 'documenttype':
          this.items.push(nodeData);
          break;
        default:
          console.log('Unknown level in path:', pathNode.level, 'for node:', pathNode.name);
          break;
      }
    });

    console.log('Selected Node:', node);
    console.log('Navigation Stack:', this.navigationStack);
    console.log('Items:', this.items);
    
    this.cdr.detectChanges();
  }

  confirmMove(): void {
    if (!this.selectedNode) {
      this.snackBar.open('Please select a destination folder', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    const payload: MoveFileDialogResult = {
      files: this.data.selectedFiles,
      destination: this.navigationStack.concat(this.items),
      type: 'move'
    };

    // Extract values based on node levels in the path
    this.navigationStack.concat(this.items).forEach(node => {
      console.log('Processing node:', node.name, 'with level:', node.level);
      switch (node.level) {
        case 'year':
          payload.year = node.id || node.name;
          break;
        case 'unitId':
          payload.unitId = node.id || node.name;
          break;
        case 'caseNo':
          payload.caseNo = node.id || node.name;
          break;
        case 'caseType':
          payload.caseType = node.id || node.name;
          break;
        case 'filetype':
          payload.fileTypeId = node.id || node.name;
          break;
        case 'documenttype':
          payload.documentTypeId = node.id || node.name;
          break;
        default:
          console.log('Unknown level:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
    console.log('Navigation Stack:', this.navigationStack);
    console.log('Items:', this.items);
    console.log('Final Payload:', payload);
    this.dialogRef.close(payload);
  }

   confirmCopy(): void {
    if (!this.selectedNode) {
      this.snackBar.open('Please select a destination folder', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    const payload: MoveFileDialogResult = {
      files: this.data.selectedFiles,
      destination: this.navigationStack.concat(this.items),
      type: 'copy'
    };

    // Extract values based on node levels in the path
    this.navigationStack.concat(this.items).forEach(node => {
      console.log('Processing node:', node.name, 'with level:', node.level);
      switch (node.level) {
        case 'year':
          payload.year = node.id || node.name;
          break;
        case 'unitId':
          payload.unitId = node.id || node.name;
          break;
        case 'caseNo':
          payload.caseNo = node.id || node.name;
          break;
        case 'caseType':
          payload.caseType = node.id || node.name;
          break;
        case 'filetype':
          payload.fileTypeId = node.id || node.name;
          break;
        case 'documenttype':
          payload.documentTypeId = node.id || node.name;
          break;
        default:
          console.log('Unknown level:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
    console.log('Navigation Stack:', this.navigationStack);
    console.log('Items:', this.items);
    console.log('Final Payload:', payload);
    this.dialogRef.close(payload);
  }

  // confirmArchive(): void {
  //   const payload: MoveFileDialogResult = {
  //     files: this.data.selectedFiles,
  //     type: 'archive'
  //   };

  //   this.dialogRef.close(payload);
  // }

  close(): void {
    this.dialogRef.close();
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
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

  private getNodePath(node: FolderNode): FolderNode[] {
    const path: FolderNode[] = [];
    
    console.log('Building path for node:', node.name, 'with level:', node.level);
    
    // Find the path by searching through the tree
    const findPath = (nodes: FolderNode[], targetNode: FolderNode, currentPath: FolderNode[]): boolean => {
      for (const currentNode of nodes) {
        const newPath = [...currentPath, currentNode];
        
        console.log('Checking node:', currentNode.name, 'level:', currentNode.level, 'path length:', newPath.length);
        
        // Check if this is the target node
        if ((currentNode.id && currentNode.id === targetNode.id) || 
            (currentNode.name === targetNode.name && currentNode.level === targetNode.level)) {
          console.log('Found target node! Adding path:', newPath.map(n => n.name));
          path.push(...newPath);
          return true;
        }
        
        // Recursively search children
        if (currentNode.children && currentNode.children.length > 0) {
          if (findPath(currentNode.children, targetNode, newPath)) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(this.dataSource.data, node, []);
    console.log('Final path:', path.map(n => `${n.name} (${n.level})`));
    return path;
  }

  isNodeSelected(node: FolderNode): boolean {
    if (!this.selectedNode || !node) return false;
    
    // Check if the node is selected by ID
    if (this.selectedNode.id && node.id) {
      return this.selectedNode.id === node.id;
    }
    
    // Check if the node is selected by name and level
    return this.selectedNode.name === node.name && 
           this.selectedNode.level === node.level;
  }

  trackByFileName(index: number, file: FileNode): string {
    return file.name || index.toString();
  }
}
