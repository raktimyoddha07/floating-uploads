import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDirectory = path.join(process.cwd(), "uploads", "tus");

const tusServer = new Server({
  path: "/api/upload",
  datastore: new FileStore({ directory: uploadsDirectory }),
  respectForwardedHeaders: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return tusServer.handle(req, res);
}
