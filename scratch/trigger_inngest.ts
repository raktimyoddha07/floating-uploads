import { inngest } from '../inngest/client';

async function main() {
  console.log("Sending event to Inngest...");
  try {
    const res = await inngest.send({
      name: "upload/process",
      data: { requestId: "cmql5f58t000xj6ggd90ussh9" }
    });
    console.log("Event sent successfully:", res);
  } catch (error) {
    console.error("Event sending failed:", error);
  }
}

main();
