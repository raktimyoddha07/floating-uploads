import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await uploadRequestService.getRequestsForUploader(userId);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Failed to fetch uploader requests", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
