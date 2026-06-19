import { Inngest } from "inngest";

const isDev = process.env.INNGEST_DEV === "1" || process.env.NODE_ENV === "development";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "upload-monitor-yt",
  ...(isDev ? {
    isDev: true,
    baseUrl: "http://localhost:8288",
  } : {})
});
