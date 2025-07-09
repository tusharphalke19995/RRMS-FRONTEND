export interface IFileUploadModel {
    blobId?: number;
    remarks?: string;
    name?: string;
    blobFilePath?: string | null;
    rawFile?: File;
    validationErrors?: string[];
    hideDelete?: boolean | false;
    description?: string;
    userFileName?: string;
   
  }
  
  export interface IFileUploadModelApproval {
    blobId?: number;
    remarks?: string;
    name?: string;
    blobFilePath?: string | null;
    rawFile?: File;
    validationErrors?: string[];
    hideDelete?: boolean | false;
    description?: string;
    userFileName?: string;
    category?:string;
  }
  
  export interface IFileUploadEvent {
    selectedFiles: IFileUploadModel[];
    removedFiles: IFileUploadModel[];
    controlId: number;
  }
  
  export interface IImageSource extends IFileUploadModel {
    imageBytearray?: any;
    blobFile?: Blob;
  }
  
  export interface IVerificationFileUploadModel {
    blobId?: number;
    remarks?: string;
    name?: string;
    blobFilePath?: string | null;
    rawFile?: File;
    validationErrors?: string[];
    hideDelete?: boolean | false;
    description?: string;
    size:any,
    type:any
    blobFile:any
  }


//  export interface FileWithMetadata extends File {
//   fileId?: number; 
//     metadata?: {
//       subject: string;
//       fileType: string;
//       classification: string;
//       hashTag: string;
//       documentType:string
//     };
//   }


export interface Metadata {
  subject: string;
  fileType: string | number;      
  classification: string | number;
  hashTag?: string;                
  documentType: string | number;
}

export interface FileWithMetadata extends File {
  fileId?: number;
  filePath?: string;
  fileHash?: string;
  uploaded_by?: number;
  subject?: string;                
  fileType?: string | number;
  classification?: string | number;
  documentType?: string | number;
  hashTag?: string;
fileName?:string;
  metadata?: Metadata;            
}
  export interface CustomFile extends File {
    validationErrors?: string[];
  }