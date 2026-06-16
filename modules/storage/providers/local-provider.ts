import fs from 'fs';
import path from 'path';
import { IStorageProvider, UploadOptions } from '../types';

export class LocalStorageProvider implements IStorageProvider {
  private uploadsDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    // In local dev, we serve the uploads directory statically or via an API route
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, options: UploadOptions): Promise<string> {
    // Generate a unique filename to avoid collisions
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${options.fileName.replace(/\s+/g, '_')}`;
    const filePath = path.join(this.uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, file);

    // Return the relative URL that can be used to access the file
    // Assuming an API route or static serving maps /uploads to the uploads folder
    return `/uploads/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract filename from the URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const filePath = path.join(this.uploadsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  // Not strictly needed for local, but adding for interface compatibility
  async generateSignedUrl(fileUrl: string): Promise<string> {
    return `${this.baseUrl}${fileUrl}`;
  }
}
