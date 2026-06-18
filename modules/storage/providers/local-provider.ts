import fs from "fs";
import path from "path";
import { IStorageProvider, StorageObject, UploadOptions } from "../types";

export class LocalStorageProvider implements IStorageProvider {
  private uploadsDir: string;
  private baseUrl: string;

  constructor(uploadsDir?: string, baseUrl?: string) {
    this.uploadsDir = uploadsDir || path.join(process.cwd(), "uploads");
    this.baseUrl = (
      baseUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private sanitizeSegment(value: string) {
    return value
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  private resolveStoragePath(keyOrUrl: string) {
    const normalized = keyOrUrl.startsWith("/uploads/")
      ? keyOrUrl.replace(/^\/uploads\//, "")
      : keyOrUrl;

    const safeSegments = normalized
      .split("/")
      .filter(Boolean)
      .map((segment) => this.sanitizeSegment(segment));

    return path.join(this.uploadsDir, ...safeSegments);
  }

  async uploadFile(
    file: Buffer,
    options: UploadOptions,
  ): Promise<StorageObject> {
    const timestamp = Date.now();
    const sanitizedFileName =
      this.sanitizeSegment(options.fileName) || "upload.bin";
    const folder = options.folder
      ? options.folder
          .split("/")
          .filter(Boolean)
          .map((segment) => this.sanitizeSegment(segment))
          .join("/")
      : "";

    const key = folder
      ? `${folder}/${timestamp}-${sanitizedFileName}`
      : `${timestamp}-${sanitizedFileName}`;

    const filePath = this.resolveStoragePath(key);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, file);

    return {
      key,
      url: `/uploads/${key}`,
    };
  }

  async deleteFile(keyOrUrl: string): Promise<void> {
    const filePath = this.resolveStoragePath(keyOrUrl);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async generateSignedUrl(keyOrUrl: string): Promise<string> {
    const relativeUrl = keyOrUrl.startsWith("/uploads/")
      ? keyOrUrl
      : `/uploads/${keyOrUrl}`;
    return `${this.baseUrl}${relativeUrl}`;
  }
}
