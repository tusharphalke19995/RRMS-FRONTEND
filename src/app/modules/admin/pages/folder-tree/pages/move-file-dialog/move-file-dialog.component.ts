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
      case 'fileType':
        return 'level-fileType';
      case 'documentType':
        return 'level-documentType';
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

  // Add a method to find all nodes with a specific name and level for debugging
  private findNodesByNameAndLevel(name: string, level: string): FolderNode[] {
    const foundNodes: FolderNode[] = [];
    
    const searchNodes = (nodes: FolderNode[]): void => {
      nodes.forEach(node => {
        if (node.name === name && node.level === level) {
          console.log(`Found matching node: ${node.name} (${node.level}) - uniqueId: ${node.uniqueId}, fullPath: ${node.fullPath}`);
          foundNodes.push(node);
        }
        if (node.children && node.children.length > 0) {
          searchNodes(node.children);
        }
      });
    };
    
    searchNodes(this.dataSource.data);
    return foundNodes;
  }

  // Check if a node exists in the tree
  private isNodeInTree(targetNode: FolderNode): boolean {
    const searchNode = (nodes: FolderNode[]): boolean => {
      for (const node of nodes) {
        if (node.uniqueId === targetNode.uniqueId) {
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (searchNode(node.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return searchNode(this.dataSource.data);
  }

  private processTreeData(data: any[]): FolderNode[] {
    let nodeCounter = 0;
    
    const processNode = (item: any, parentPath: string = ''): FolderNode => {
      const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      const uniqueId = `node_${nodeCounter++}_${item.id || item.name}`;
      
      return {
        id: item.id,
        name: item.name,
        level: item.level,
        type: item.type || 'folder',
        path: item.path,
        uniqueId: uniqueId,
        fullPath: currentPath,
        children: item.children ? item.children.map((child: any) => processNode(child, currentPath)) : [],
        files: item.files || []
      };
    };
    
    return data.map(item => processNode(item));
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

    console.log('=== SELECTING NODE ===');
    console.log('Selected node details:', {
      name: node.name,
      level: node.level,
      id: node.id,
      uniqueId: node.uniqueId,
      fullPath: node.fullPath,
      type: node.type
    });

    // Debug: Find all nodes with the same name and level
    const similarNodes = this.findNodesByNameAndLevel(node.name, node.level);
    console.log(`Found ${similarNodes.length} nodes with name "${node.name}" and level "${node.level}":`, similarNodes);

    // Debug: Check if the selected node is actually in the tree
    const isNodeInTree = this.isNodeInTree(node);
    console.log('Is selected node in tree:', isNodeInTree);

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
        name: pathNode.name,
        uniqueId: pathNode.uniqueId
      };
      console.log('Processing path node:', nodeData);

      switch (pathNode.level) {
        case 'year':
          this.navigationStack.push(nodeData);
          console.log(`Added year node to navigationStack: ${nodeData.name}`);
          break;
        case 'unitId':
          this.navigationStack.push(nodeData);
          console.log(`Added unitId node to navigationStack: ${nodeData.name}`);
          break;
        case 'caseNo':
          this.navigationStack.push(nodeData);
          console.log(`Added caseNo node to navigationStack: ${nodeData.name}`);
          break;
        case 'caseType':
          this.navigationStack.push(nodeData);
          console.log(`Added caseType node to navigationStack: ${nodeData.name}`);
          break;
        case 'fileType':
          this.navigationStack.push(nodeData);
          console.log(`Added fileType node to navigationStack: ${nodeData.name}`);
          break;
        case 'documentType':
          this.navigationStack.push(nodeData);
          console.log(`Added documentType node to navigationStack: ${nodeData.name}`);
          break;
        default:
          console.log('Unknown level in path:', pathNode.level, 'for node:', pathNode.name);
          // Add unknown levels to navigationStack as well
          this.navigationStack.push(nodeData);
          break;
      }
    });

    console.log('Selected Node:', node);
    console.log('Navigation Stack:', this.navigationStack);
    console.log('Items:', this.items);
    console.log('=== END SELECTING NODE ===');
    
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
      destination: this.navigationStack,
      type: 'move'
    };

    console.log('=== BUILDING MOVE PAYLOAD ===');
    console.log('Navigation Stack (all levels):', this.navigationStack);

    // Extract values based on node levels in the path
    this.navigationStack.forEach(node => {
      console.log(`Processing node for payload: ${node.name} (${node.level}) - ID: ${node.id}`);
      switch (node.level) {
        case 'year':
          payload.year = node.id || node.name;
          console.log(`Set payload.year = ${payload.year}`);
          break;
        case 'unitId':
          payload.unitId = node.id || node.name;
          console.log(`Set payload.unitId = ${payload.unitId}`);
          break;
        case 'caseNo':
          payload.caseNo = node.id || node.name;
          console.log(`Set payload.caseNo = ${payload.caseNo}`);
          break;
        case 'caseType':
          payload.caseType = node.id || node.name;
          console.log(`Set payload.caseType = ${payload.caseType}`);
          break;
        case 'fileType':
          payload.fileTypeId = node.id || node.name;
          console.log(`Set payload.fileTypeId = ${payload.fileTypeId}`);
          break;
        case 'documentType':
          payload.documentTypeId = node.id || node.name;
          console.log(`Set payload.documentTypeId = ${payload.documentTypeId}`);
          break;
        default:
          console.log('Unknown level for payload:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
    console.log('Final Payload:', payload);
    console.log('=== END BUILDING MOVE PAYLOAD ===');
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
      destination: this.navigationStack, // Use only navigationStack since all levels are there now
      type: 'copy'
    };

    console.log('=== BUILDING COPY PAYLOAD ===');
    console.log('Navigation Stack (all levels):', this.navigationStack);

    // Extract values based on node levels in the path
    this.navigationStack.forEach(node => {
      console.log(`Processing node for payload: ${node.name} (${node.level}) - ID: ${node.id}`);
      switch (node.level) {
        case 'year':
          payload.year = node.id || node.name;
          console.log(`Set payload.year = ${payload.year}`);
          break;
        case 'unitId':
          payload.unitId = node.id || node.name;
          console.log(`Set payload.unitId = ${payload.unitId}`);
          break;
        case 'caseNo':
          payload.caseNo = node.id || node.name;
          console.log(`Set payload.caseNo = ${payload.caseNo}`);
          break;
        case 'caseType':
          payload.caseType = node.id || node.name;
          console.log(`Set payload.caseType = ${payload.caseType}`);
          break;
        case 'fileType':
          payload.fileTypeId = node.id || node.name;
          console.log(`Set payload.fileTypeId = ${payload.fileTypeId}`);
          break;
        case 'documentType':
          payload.documentTypeId = node.id || node.name;
          console.log(`Set payload.documentTypeId = ${payload.documentTypeId}`);
          break;
        default:
          console.log('Unknown level for payload:', node.level, 'for node:', node.name);
          break;
      }
    });

    console.log('Selected Node:', this.selectedNode);
    console.log('Final Payload:', payload);
    console.log('=== END BUILDING COPY PAYLOAD ===');
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
    
    console.log('Building path for node:', node.name, 'with level:', node.level, 'ID:', node.id, 'uniqueId:', node.uniqueId);
    
    // If the node has a fullPath, try to build the path from that
    if (node.fullPath) {
      console.log('Using fullPath to build node path:', node.fullPath);
      const pathFromFullPath = this.buildPathFromFullPath(node.fullPath);
      if (pathFromFullPath.length > 0) {
        console.log('Successfully built path from fullPath:', pathFromFullPath);
        return pathFromFullPath;
      }
    }
    
    // Fallback to searching through the tree
    console.log('Falling back to tree search method');
    
    // Find the path by searching through the tree
    const findPath = (nodes: FolderNode[], targetNode: FolderNode, currentPath: FolderNode[]): boolean => {
      for (const currentNode of nodes) {
        const newPath = [...currentPath, currentNode];
        
        console.log('Checking node:', currentNode.name, 'level:', currentNode.level, 'ID:', currentNode.id, 'uniqueId:', currentNode.uniqueId, 'path length:', newPath.length);
        
        // Use uniqueId for precise node matching
        const isTargetNode = (
          // First priority: uniqueId match (most precise)
          (currentNode.uniqueId && targetNode.uniqueId && currentNode.uniqueId === targetNode.uniqueId) ||
          // Second priority: ID match
          (currentNode.id && targetNode.id && currentNode.id === targetNode.id) ||
          // Third priority: name and level match (fallback)
          (currentNode.name === targetNode.name && currentNode.level === targetNode.level)
        );
        
        if (isTargetNode) {
          console.log('Found target node! Adding path:', newPath.map(n => `${n.name} (${n.level}) [ID: ${n.id}] [uniqueId: ${n.uniqueId}]`));
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
    console.log('Final path:', path.map(n => `${n.name} (${n.level}) [ID: ${n.id}] [uniqueId: ${n.uniqueId}]`));
    return path;
  }

  // Build path from fullPath string
  private buildPathFromFullPath(fullPath: string): FolderNode[] {
    const pathParts = fullPath.split('/');
    const path: FolderNode[] = [];
    
    console.log('Building path from parts:', pathParts);
    
    const findNodeByPath = (nodes: FolderNode[], targetName: string): FolderNode | null => {
      for (const node of nodes) {
        if (node.name === targetName) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeByPath(node.children, targetName);
          if (found) return found;
        }
      }
      return null;
    };
    
    for (const part of pathParts) {
      const node = findNodeByPath(this.dataSource.data, part);
      if (node) {
        path.push(node);
        console.log(`Added to path: ${node.name} (${node.level}) [ID: ${node.id}]`);
      } else {
        console.log(`Could not find node for path part: ${part}`);
      }
    }
    
    return path;
  }

  isNodeSelected(node: FolderNode): boolean {
    if (!this.selectedNode || !node) return false;
    
    // Use the same precise matching logic as getNodePath
    const isSelected = (
      // First priority: uniqueId match (most precise)
      (this.selectedNode.uniqueId && node.uniqueId && this.selectedNode.uniqueId === node.uniqueId) ||
      // Second priority: ID match
      (this.selectedNode.id && node.id && this.selectedNode.id === node.id) ||
      // Third priority: name and level match (fallback)
      (this.selectedNode.name === node.name && this.selectedNode.level === node.level)
    );
    
    return isSelected;
  }

  trackByFileName(index: number, file: FileNode): string {
    return file.name || index.toString();
  }

  // Debug method - can be called from browser console
  debugNodeSelection(nodeName: string, nodeLevel: string): void {
    console.log('=== DEBUG NODE SELECTION ===');
    console.log(`Looking for node: ${nodeName} (${nodeLevel})`);
    
    const foundNodes = this.findNodesByNameAndLevel(nodeName, nodeLevel);
    console.log(`Found ${foundNodes.length} matching nodes:`, foundNodes);
    
    if (foundNodes.length > 0) {
      const firstNode = foundNodes[0];
      console.log('Testing path building for first node:', firstNode);
      const path = this.getNodePath(firstNode);
      console.log('Generated path:', path);
      
      // Simulate selection
      this.selectNode(firstNode);
    } else {
      console.log('No nodes found with the specified name and level');
    }
    console.log('=== END DEBUG ===');
  }

  // Method to select node by uniqueId (for testing)
  selectNodeByUniqueId(uniqueId: string): void {
    console.log('=== SELECTING NODE BY UNIQUE ID ===');
    console.log(`Looking for node with uniqueId: ${uniqueId}`);
    
    const findNodeByUniqueId = (nodes: FolderNode[]): FolderNode | null => {
      for (const node of nodes) {
        if (node.uniqueId === uniqueId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeByUniqueId(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const targetNode = findNodeByUniqueId(this.dataSource.data);
    if (targetNode) {
      console.log('Found node by uniqueId:', targetNode);
      this.selectNode(targetNode);
    } else {
      console.log('No node found with the specified uniqueId');
    }
    console.log('=== END SELECTING BY UNIQUE ID ===');
  }

  // Simple test method to select a year node
  testYearSelection(year: string): void {
    console.log(`=== TESTING YEAR SELECTION: ${year} ===`);
    
    // Find all year nodes
    const yearNodes = this.findNodesByNameAndLevel(year, 'year');
    console.log(`Found ${yearNodes.length} year nodes for ${year}:`, yearNodes);
    
    if (yearNodes.length > 0) {
      // Select the first one
      const selectedYearNode = yearNodes[0];
      console.log('Selecting year node:', selectedYearNode);
      this.selectNode(selectedYearNode);
      
      // Simulate move to see the payload
      setTimeout(() => {
        console.log('=== SIMULATING MOVE ===');
        this.confirmMove();
      }, 1000);
    } else {
      console.log(`No year node found for ${year}`);
    }
    
    console.log(`=== END TESTING YEAR SELECTION: ${year} ===`);
  }

  // List all available year nodes
  listAllYearNodes(): void {
    console.log('=== LISTING ALL YEAR NODES ===');
    
    const allYearNodes: FolderNode[] = [];
    
    const findYearNodes = (nodes: FolderNode[]): void => {
      nodes.forEach(node => {
        if (node.level === 'year') {
          allYearNodes.push(node);
          console.log(`Year node: ${node.name} - uniqueId: ${node.uniqueId} - fullPath: ${node.fullPath}`);
        }
        if (node.children && node.children.length > 0) {
          findYearNodes(node.children);
        }
      });
    };
    
    findYearNodes(this.dataSource.data);
    console.log(`Total year nodes found: ${allYearNodes.length}`);
    console.log('All year nodes:', allYearNodes);
    console.log('=== END LISTING YEAR NODES ===');
  }

  // List all available fileType nodes
  listAllFiletypeNodes(): void {
    console.log('=== LISTING ALL fileType NODES ===');
    
    const allFiletypeNodes: FolderNode[] = [];
    
    const findFiletypeNodes = (nodes: FolderNode[]): void => {
      nodes.forEach(node => {
        if (node.level === 'fileType') {
          allFiletypeNodes.push(node);
          console.log(`fileType node: ${node.name} - uniqueId: ${node.uniqueId} - fullPath: ${node.fullPath}`);
        }
        if (node.children && node.children.length > 0) {
          findFiletypeNodes(node.children);
        }
      });
    };
    
    findFiletypeNodes(this.dataSource.data);
    console.log(`Total fileType nodes found: ${allFiletypeNodes.length}`);
    console.log('All fileType nodes:', allFiletypeNodes);
    console.log('=== END LISTING fileType NODES ===');
  }

  // List all available documentType nodes
  listAllDocumenttypeNodes(): void {
    console.log('=== LISTING ALL documentType NODES ===');
    
    const allDocumenttypeNodes: FolderNode[] = [];
    
    const findDocumenttypeNodes = (nodes: FolderNode[]): void => {
      nodes.forEach(node => {
        if (node.level === 'documentType') {
          allDocumenttypeNodes.push(node);
          console.log(`documentType node: ${node.name} - uniqueId: ${node.uniqueId} - fullPath: ${node.fullPath}`);
        }
        if (node.children && node.children.length > 0) {
          findDocumenttypeNodes(node.children);
        }
      });
    };
    
    findDocumenttypeNodes(this.dataSource.data);
    console.log(`Total documentType nodes found: ${allDocumenttypeNodes.length}`);
    console.log('All documentType nodes:', allDocumenttypeNodes);
    console.log('=== END LISTING documentType NODES ===');
  }

  // Test selection of fileType node
  testFiletypeSelection(filetypeName: string): void {
    console.log(`=== TESTING fileType SELECTION: ${filetypeName} ===`);
    
    const filetypeNodes = this.findNodesByNameAndLevel(filetypeName, 'fileType');
    console.log(`Found ${filetypeNodes.length} fileType nodes for ${filetypeName}:`, filetypeNodes);
    
    if (filetypeNodes.length > 0) {
      const selectedFiletypeNode = filetypeNodes[0];
      console.log('Selecting fileType node:', selectedFiletypeNode);
      this.selectNode(selectedFiletypeNode);
      
      // Simulate move to see the payload
      setTimeout(() => {
        console.log('=== SIMULATING MOVE ===');
        this.confirmMove();
      }, 1000);
    } else {
      console.log(`No fileType node found for ${filetypeName}`);
    }
    
    console.log(`=== END TESTING fileType SELECTION: ${filetypeName} ===`);
  }

  // Test selection of documentType node
  testDocumenttypeSelection(documenttypeName: string): void {
    console.log(`=== TESTING documentType SELECTION: ${documenttypeName} ===`);
    
    const documenttypeNodes = this.findNodesByNameAndLevel(documenttypeName, 'documentType');
    console.log(`Found ${documenttypeNodes.length} documentType nodes for ${documenttypeName}:`, documenttypeNodes);
    
    if (documenttypeNodes.length > 0) {
      const selectedDocumenttypeNode = documenttypeNodes[0];
      console.log('Selecting documentType node:', selectedDocumenttypeNode);
      this.selectNode(selectedDocumenttypeNode);
      
      // Simulate move to see the payload
      setTimeout(() => {
        console.log('=== SIMULATING MOVE ===');
        this.confirmMove();
      }, 1000);
    } else {
      console.log(`No documentType node found for ${documenttypeName}`);
    }
    
    console.log(`=== END TESTING documentType SELECTION: ${documenttypeName} ===`);
  }

  // Debug current selection and payload
  debugCurrentSelection(): void {
    console.log('=== DEBUG CURRENT SELECTION ===');
    console.log('Selected Node:', this.selectedNode);
    console.log('Navigation Stack:', this.navigationStack);
    console.log('Items:', this.items);
    
    if (this.navigationStack.length > 0) {
      console.log('Navigation Stack Details:');
      this.navigationStack.forEach((node, index) => {
        console.log(`${index + 1}. ${node.name} (${node.level}) - ID: ${node.id} - uniqueId: ${node.uniqueId}`);
      });
      
      // Check what would be in the payload
      const mockPayload: any = {};
      this.navigationStack.forEach(node => {
        switch (node.level) {
          case 'year':
            mockPayload.year = node.id || node.name;
            break;
          case 'unitId':
            mockPayload.unitId = node.id || node.name;
            break;
          case 'caseNo':
            mockPayload.caseNo = node.id || node.name;
            break;
          case 'caseType':
            mockPayload.caseType = node.id || node.name;
            break;
          case 'fileType':
            mockPayload.fileTypeId = node.id || node.name;
            break;
          case 'documentType':
            mockPayload.documentTypeId = node.id || node.name;
            break;
        }
      });
      
      console.log('Mock Payload:', mockPayload);
      console.log('Missing fields:');
      if (!mockPayload.year) console.log('- year');
      if (!mockPayload.unitId) console.log('- unitId');
      if (!mockPayload.caseNo) console.log('- caseNo');
      if (!mockPayload.caseType) console.log('- caseType');
      if (!mockPayload.fileTypeId) console.log('- fileTypeId');
      if (!mockPayload.documentTypeId) console.log('- documentTypeId');
    } else {
      console.log('No nodes in navigation stack');
    }
    
    console.log('=== END DEBUG CURRENT SELECTION ===');
  }

  // Test complete path selection (from year to documentType)
  testCompletePathSelection(year: string, unitId: string, caseNo: string, caseType: string, fileType?: string, documentType?: string): void {
    console.log(`=== TESTING COMPLETE PATH SELECTION ===`);
    console.log(`Year: ${year}, UnitId: ${unitId}, CaseNo: ${caseNo}, CaseType: ${caseType}`);
    if (fileType) console.log(`fileType: ${fileType}`);
    if (documentType) console.log(`documentType: ${documentType}`);
    
    // Find the target node (start with the deepest level if provided)
    let targetNode: FolderNode | null = null;
    
    if (documentType) {
      const documenttypeNodes = this.findNodesByNameAndLevel(documentType, 'documentType');
      if (documenttypeNodes.length > 0) {
        targetNode = documenttypeNodes[0];
        console.log('Found documentType node:', targetNode);
      }
    } else if (fileType) {
      const filetypeNodes = this.findNodesByNameAndLevel(fileType, 'fileType');
      if (filetypeNodes.length > 0) {
        targetNode = filetypeNodes[0];
        console.log('Found fileType node:', targetNode);
      }
    } else {
      const caseTypeNodes = this.findNodesByNameAndLevel(caseType, 'caseType');
      if (caseTypeNodes.length > 0) {
        targetNode = caseTypeNodes[0];
        console.log('Found caseType node:', targetNode);
      }
    }
    
    if (targetNode) {
      console.log('Selecting target node:', targetNode);
      this.selectNode(targetNode);
      
      // Debug the selection
      setTimeout(() => {
        this.debugCurrentSelection();
      }, 500);
    } else {
      console.log('Could not find target node');
    }
    
    console.log('=== END TESTING COMPLETE PATH SELECTION ===');
  }

  // Test the specific scenario from your payload
  testSpecificScenario(): void {
    console.log('=== TESTING SPECIFIC SCENARIO ===');
    console.log('Testing the scenario where fileType and documentType are missing');
    
    // Based on your payload: year: 2021, unitId: "1382", caseNo: "20443138220210021", caseType: "2"
    // Let's find what fileType and documentType nodes should be in this path
    
    // First, let's find all nodes in the 2021 year
    const year2021Nodes = this.findNodesByNameAndLevel('2021', 'year');
    console.log('Year 2021 nodes:', year2021Nodes);
    
    if (year2021Nodes.length > 0) {
      const year2021Node = year2021Nodes[0];
      console.log('Selecting year 2021 node:', year2021Node);
      this.selectNode(year2021Node);
      
      // Debug what we have so far
      setTimeout(() => {
        console.log('After selecting year 2021:');
        this.debugCurrentSelection();
        
        // Now let's find fileType and documentType nodes under this path
        console.log('Looking for fileType and documentType nodes...');
        this.listAllFiletypeNodes();
        this.listAllDocumenttypeNodes();
      }, 500);
    }
    
    console.log('=== END TESTING SPECIFIC SCENARIO ===');
  }

  // Force include fileType and documentType in payload (for testing)
  forceIncludeFiletypeAndDocumenttype(filetypeName: string, documenttypeName: string): void {
    console.log(`=== FORCE INCLUDING fileType AND documentType ===`);
    console.log(`fileType: ${filetypeName}, documentType: ${documenttypeName}`);
    
    // Find the nodes
    const filetypeNodes = this.findNodesByNameAndLevel(filetypeName, 'fileType');
    const documenttypeNodes = this.findNodesByNameAndLevel(documenttypeName, 'documentType');
    
    console.log('Found fileType nodes:', filetypeNodes);
    console.log('Found documentType nodes:', documenttypeNodes);
    
    // Add them to navigationStack if they exist
    if (filetypeNodes.length > 0) {
      const filetypeNode = filetypeNodes[0];
      const nodeData = {
        id: filetypeNode.id,
        level: filetypeNode.level,
        name: filetypeNode.name,
        uniqueId: filetypeNode.uniqueId
      };
      this.navigationStack.push(nodeData);
      // console.log(`Added fileType node to navigationStack: ${nodeData.name}`);
    }
    
    if (documenttypeNodes.length > 0) {
      const documenttypeNode = documenttypeNodes[0];
      const nodeData = {
        id: documenttypeNode.id,
        level: documenttypeNode.level,
        name: documenttypeNode.name,
        uniqueId: documenttypeNode.uniqueId
      };
      this.navigationStack.push(nodeData);
      // console.log(`Added documentType node to navigationStack: ${nodeData.name}`);
    }
    
    // Debug the current state
    this.debugCurrentSelection();
    
    // console.log('=== END FORCE INCLUDING fileType AND documentType ===');
  }
}
