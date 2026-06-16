import { ConnectChannelCard, AddUploaderModal } from "@/components/channel/ConnectChannelCard";
import { UploaderTable } from "@/components/uploader/UploaderTable";

export default function AppointUploaderPage() {
  // This will eventually be fetched from the database
  const hasChannels = true;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Appoint Uploader
          </h1>
          <p className="text-muted-foreground">
            Manage uploader access for your connected YouTube channels.
          </p>
        </div>
        
        {hasChannels && <AddUploaderModal />}
      </div>

      {!hasChannels ? (
        <ConnectChannelCard />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Active Assignments</h2>
          </div>
          <UploaderTable />
        </div>
      )}
    </div>
  );
}
