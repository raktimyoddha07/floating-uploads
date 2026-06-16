import { prisma } from "@/lib/prisma";

export class ChannelRepository {
  async findByOwnerId(ownerId: string) {
    return prisma.channel.findMany({
      where: { ownerId },
      include: {
        _count: {
          select: { requests: { where: { status: "PENDING_REVIEW" } } }
        }
      }
    });
  }

  async create(data: { ownerId: string; name: string; youtubeId: string; handle?: string; pictureUrl?: string }) {
    return prisma.channel.create({ data });
  }

  async findById(id: string) {
    return prisma.channel.findUnique({ where: { id } });
  }
}

export const channelRepository = new ChannelRepository();
