import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const safePath = pathSegments.join("/");
  
  // Prevent directory traversal attacks
  if (safePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "uploads", safePath);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  // Determine content type based on extension
  const ext = path.extname(filePath).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".webm") contentType = "video/webm";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    // Create a readable stream from the fs ReadStream
    const readable = new ReadableStream({
      start(controller) {
        file.on("data", (chunk) => controller.enqueue(chunk));
        file.on("end", () => controller.close());
        file.on("error", (err) => controller.error(err));
      },
      cancel() {
        file.destroy();
      }
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": contentType,
      },
    });
  } else {
    const file = fs.createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        file.on("data", (chunk) => controller.enqueue(chunk));
        file.on("end", () => controller.close());
        file.on("error", (err) => controller.error(err));
      },
      cancel() {
        file.destroy();
      }
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
      },
    });
  }
}
