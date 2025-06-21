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
import { FileIconPipe } from "../../../content-mng/pipe/fileIcon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject } from "rxjs";

import { DatePipe } from '@angular/common';
import { FolderTreeService } from "../../services/folder-tree.service";
import { FolderNode, FileNode } from '../../models/folder-tree.model';

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
    path.forEach(node => {
      const nodeData = {
        id: node.id,
        level: node.level,
        name: node.name
      };
      console.log('Processing path node:', nodeData);

      switch (node.level) {
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
        case 'fileType':
          this.items.push(nodeData);
          break;
        case 'documentType':
          this.items.push(nodeData);
          break;
        default:
          console.log('Unknown level in path:', node.level, 'for node:', node.name);
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

    // Validate that we have at least one level selected
    if (this.navigationStack.length === 0 && this.items.length === 0) {
      this.snackBar.open('Invalid destination folder selected', 'Close', {
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
        case 'fileType':
          payload.fileTypeId = node.id || node.name;
          break;
        case 'documentType':
          payload.documentTypeId = node.id || node.name;
          break;
        default:
          console.log('Unknown level:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
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

    // Validate that we have at least one level selected
    if (this.navigationStack.length === 0 && this.items.length === 0) {
      this.snackBar.open('Invalid destination folder selected', 'Close', {
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
        case 'fileType':
          payload.fileTypeId = node.id || node.name;
          break;
        case 'documentType':
          payload.documentTypeId = node.id || node.name;
          break;
        default:
          console.log('Unknown level:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
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
    let currentNode = node;

    // Traverse up to find all parent nodes
    while (currentNode && currentNode.level !== 'division') {
      path.unshift(currentNode);
      const parent = this.findParentNode(currentNode);
      if (!parent) break;
      currentNode = parent;
    }

    return path;
  }

  private findParentNode(node: FolderNode): FolderNode | null {
    const findInNodes = (nodes: FolderNode[]): FolderNode | null => {
      for (const currentNode of nodes) {
        // Check if current node has the target node as a child
        if (currentNode.children?.some(child => 
          (child.id && child.id === node.id) || 
          (child.name === node.name && child.level === node.level)
        )) {
          return currentNode;
        }
        // Recursively check children
        if (currentNode.children) {
          const found = findInNodes(currentNode.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInNodes(this.dataSource.data);
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
