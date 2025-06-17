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
  breadcrumbs: FolderNode[] = [];
  searchFilter: string = '';
  loading$ = new BehaviorSubject<boolean>(false);
  selectedFiles: FileNode[] = [];
  originalData: FolderNode[] = [];
  fileDetails: FileNode[] = [];

  constructor(
    public dialogRef: MatDialogRef<MoveFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveFileDialogData,
    private folderTreeService: FolderTreeService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
    console.log('Selected files:', this.selectedFiles);
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
  isLeaf = (_: number, node: FolderNode) => {
    return node.type === 'folder' && (!node.children || node.children.length === 0);
  };

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

    console.log('Loading folder tree with payload:', payload);

    this.folderTreeService.folderTreeView(payload).subscribe({
      next: (response: any) => {
        console.log('Folder tree response:', response);
        
        let processedData: FolderNode[] = [];
        
        if (Array.isArray(response)) {
          processedData = this.processTreeData(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          processedData = this.processTreeData(response.data);
        } else {
          console.error('Invalid response format:', response);
          this.snackBar.open('Error: Invalid folder tree data format', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loading$.next(false);
          return;
        }

        console.log('Processed folder tree data:', processedData);
        
        this.dataSource.data = processedData;
        this.originalData = processedData;
        this.treeControl.dataNodes = processedData;
        
        // Expand the root node by default
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
        this.loading$.next(false);
      },
      complete: () => {
        this.loading$.next(false);
        this.cdr.markForCheck();
      }
    });
  }

  private processTreeData(data: any[]): FolderNode[] {
    console.log('Processing tree data:', data);
    
    return data.map(item => {
      const node: FolderNode = {
        id: item.id,
        name: item.name,
        level: item.level,
        type: item.type || 'folder',
        path: item.path,
        children: item.children ? this.processTreeData(item.children) : [],
        files: item.files || []
      };
      
      console.log('Processed node:', node);
      return node;
    });
  }

  isNodeSelected(node: FolderNode): boolean {
    return this.selectedNode === node;
  }

  selectNode(node: FolderNode): void {
    if (!this.isValidDestination(node)) {
      this.snackBar.open('Please select a valid folder destination', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }
    this.selectedNode = node;
    this.updateBreadcrumbs(node);
    this.cdr.markForCheck();
  }

  private updateBreadcrumbs(node: FolderNode): void {
    const path: FolderNode[] = [];
    let currentNode: FolderNode | null = node;

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = this.findParentNode(currentNode);
    }

    this.breadcrumbs = path;
  }

  private findParentNode(node: FolderNode): FolderNode | null {
    const findInChildren = (nodes: FolderNode[]): FolderNode | null => {
      for (const n of nodes) {
        if (n.children?.some(child => child.id === node.id)) {
          return n;
        }
        const found = findInChildren(n.children || []);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return findInChildren(this.dataSource.data);
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

    this.loading$.next(true);
    const payload = {
      file_ids: this.selectedFiles.map(file => file.file_id),
      destination_folder_id: this.selectedNode.id
    };

    this.folderTreeService.moveFilesInfo(payload).subscribe({
      next: (response: MoveFileResponse) => {
        if (response.success) {
          this.snackBar.open('Files moved successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(response.message || 'Failed to move files', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        console.error('Error moving files:', error);
        this.snackBar.open('Error moving files', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      complete: () => {
        this.loading$.next(false);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getSelectedPath(): string {
    if (!this.selectedNode) return '';
    return this.breadcrumbs.map(crumb => crumb.name).join(' / ');
  }

  navigateToBreadcrumb(index: number): void {
    if (index === -1) {
      this.selectedNode = null;
      this.breadcrumbs = [];
      return;
    }
    
    const targetNode = this.breadcrumbs[index];
    if (targetNode) {
      this.selectNode(targetNode);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchFilter = filterValue.trim().toLowerCase();
    this.filterTreeData();
  }

  private filterTreeData(): void {
    if (!this.searchFilter) {
      this.dataSource.data = this.originalData;
      return;
    }

    const filterNodes = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.filter(node => {
        const nameMatch = node.name.toLowerCase().includes(this.searchFilter);
        const childrenMatch = node.children ? filterNodes(node.children).length > 0 : false;
        return nameMatch || childrenMatch;
      }).map(node => ({
        ...node,
        children: node.children ? filterNodes(node.children) : []
      }));
    };

    this.dataSource.data = filterNodes(this.originalData);
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
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
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive';
      case 'txt':
        return 'text_snippet';
      case 'mp3':
      case 'wav':
        return 'audio_file';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video_file';
      default:
        return 'insert_drive_file';
    }
  }

  toggleNode(node: FolderNode, event: Event): void {
    event.stopPropagation(); // Prevent node selection when toggling
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  navigateToFolder(folder: FolderNode): void {
    const index = this.breadcrumbs.indexOf(folder);
    if (index === -1) {
      this.breadcrumbs.push(folder);
    } else {
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    }
  }

  navigateToRoot(): void {
    this.breadcrumbs = [];
  }
}
