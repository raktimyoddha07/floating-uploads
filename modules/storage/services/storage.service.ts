import { IStorageProvider, UploadOptions } from '../types';
import { LocalStorageProvider } from '../providers/local-provider';

// This acts as a factory or dependency injection point
// Later, you can conditionally use an R2StorageProvider based on env variables
export class StorageService {
  private provider: IStorageProvider;

  constructor() {
    // Determine which provider to use. Hardcoding local for now as per requirements.
    this.provider = new LocalStorageProvider();
  }

  async upload(file: Buffer, options: UploadOptions): Promise<string> {
    return this.provider.uploadFile(file, options);
  }

  async delete(fileUrl: string): Promise<void> {
    return this.provider.deleteFile(fileUrl);
  }

  async getUrl(fileUrl: string): Promise<string> {
    if (this.provider.generateSignedUrl) {
      return this.provider.generateSignedUrl(fileUrl);
    }
    return fileUrl;
  }
}

// Export a singleton instance for ease of use
export const storageService = new StorageService();
