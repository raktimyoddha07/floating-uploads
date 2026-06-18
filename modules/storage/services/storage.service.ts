import { createStorageProvider } from "../providers/provider-factory";
import { IStorageProvider, StorageObject, UploadOptions } from "../types";

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider: IStorageProvider = createStorageProvider()) {
    this.provider = provider;
  }

  async upload(file: Buffer, options: UploadOptions): Promise<StorageObject> {
    return this.provider.uploadFile(file, options);
  }

  async delete(keyOrUrl: string): Promise<void> {
    return this.provider.deleteFile(keyOrUrl);
  }

  async getUrl(keyOrUrl: string): Promise<string> {
    if (this.provider.generateSignedUrl) {
      return this.provider.generateSignedUrl(keyOrUrl);
    }

    return keyOrUrl;
  }
}

export const storageService = new StorageService();
