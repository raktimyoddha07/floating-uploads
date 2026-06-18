import { channelRepository } from "../repositories/channel.repository";

export class ChannelService {
  async getOwnerChannels(ownerId: string) {
    return channelRepository.findByOwnerId(ownerId);
  }

  async connectMockChannel(ownerId: string, name: string) {
    // In the future, this will initiate the actual Google OAuth flow
    // For now, we mock it.
    const mockYoutubeId = `yt_${Math.random().toString(36).substring(7)}`;
    return channelRepository.create({
      ownerId,
      name,
      youtubeId: mockYoutubeId,
      handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
      pictureUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=" +
        encodeURIComponent(name),
    });
  }

  async getChannelDetails(channelId: string) {
    return channelRepository.findDetailedById(channelId);
  }
}

export const channelService = new ChannelService();
