import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VideoMetadata {
  duration: number; // in seconds
  resolution: string;
  codec: string;
  fileSize: number;
  frameRate: string;
}

export const getVideoMetadata = (filePath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const format = metadata.format;

      if (!videoStream || !format) {
        return reject(new Error('Invalid video file'));
      }

      resolve({
        duration: format.duration || 0,
        resolution: `${videoStream.width}x${videoStream.height}`,
        codec: videoStream.codec_name || 'unknown',
        fileSize: format.size || 0,
        frameRate: videoStream.r_frame_rate || 'unknown',
      });
    });
  });
};

export const extractThumbnail = (filePath: string, outputDir: string, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(filePath)
      .on('end', () => {
        resolve(path.join(outputDir, filename));
      })
      .on('error', (err) => {
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: outputDir,
        filename: filename,
        timestamps: ['50%'], // Take screenshot at 50% of the video
      });
  });
};
