import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import ReviewRequestsClient from "./ReviewRequestsClient";

export default async function ReviewRequestPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const requests = await uploadRequestService.getRequestsForOwner(
    session.user.id,
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ReviewRequestsClient requests={requests} />
    </div>
  );
}
