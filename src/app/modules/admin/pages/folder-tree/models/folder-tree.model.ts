export interface FolderNode {
  id: number;
  name: string;
  level: string;
  type?: string;
  children?: FolderNode[];
  files?: FileNode[];
  path?: string;
}

export interface FileNode {
  name: string;
  file_id: number;
  uploaded_by?: string;
  created_at?: string;
  path?: string;
  size?: number;
  type?: string;
} 