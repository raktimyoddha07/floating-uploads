export interface UploadOptions {
  fileName: string;
  contentType?: string;
  folder?: string;
}

export interface StorageObject {
  key: string;
  url: string;
}

export interface IStorageProvider {
  uploadFile(file: Buffer, options: UploadOptions): Promise<StorageObject>;
  deleteFile(keyOrUrl: string): Promise<void>;
  generateSignedUrl?(keyOrUrl: string): Promise<string>;
}
