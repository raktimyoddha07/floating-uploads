export interface UploadOptions {
  fileName: string;
  contentType?: string;
}

export interface IStorageProvider {
  uploadFile(file: Buffer, options: UploadOptions): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  generateSignedUrl?(fileUrl: string): Promise<string>;
}
