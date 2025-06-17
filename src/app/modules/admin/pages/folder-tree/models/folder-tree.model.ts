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
}

export interface FileNode {
  file_id: number;
  name: string;
  path?: string;
  created_at?: string;
  uploaded_by?: string;
  fileType?: string;
  fileSize?: number;
} 