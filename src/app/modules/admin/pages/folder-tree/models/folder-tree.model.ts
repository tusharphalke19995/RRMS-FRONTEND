export interface FolderNode {
  id?: string;
  name: string;
  level: string;
  type: string;
  children?: FolderNode[];
  files?: FileNode[];
  isFile?: boolean;
  path?: string;
  expanded?: boolean;
  isFolder?: boolean;
  fileSize?: string;
  uniqueId?: string;
  fullPath?: string;
}

export interface FileNode {
  file_id: number;
  name: string;
  // Provided by folder-tree API (may vary by endpoint/version)
  caseId?: number;
  case_id?: number;
  fileHash?: string;
  file_hash?: string;
  path?: string;
  created_at?: string;
  uploaded_by?: string;
  fileType?: string;
  fileSize?: number;
} 