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


 export interface FileWithMetadata extends File {
    metadata?: {
      subject: string;
      fileType: string;
      classification: string;
      hashTag: string;
      fileStage:string
    };
  }

  export interface CustomFile extends File {
    validationErrors?: string[];
  }