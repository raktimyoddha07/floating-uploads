import { prisma } from "@/lib/prisma";

export class ChannelRepository {
  async findByOwnerId(ownerId: string) {
    return prisma.channel.findMany({
      where: { ownerId },
      include: {
        _count: {
          select: {
            requests: { where: { status: "PENDING_REVIEW" } },
            assignments: { where: { revokedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    ownerId: string;
    name: string;
    youtubeId: string;
    handle?: string;
    pictureUrl?: string;
  }) {
    return prisma.channel.create({ data });
  }

  async findById(id: string) {
    return prisma.channel.findUnique({ where: { id } });
  }

  async findDetailedById(id: string) {
    return prisma.channel.findUnique({
      where: { id },
      include: {
        owner: true,
        assignments: {
          where: { revokedAt: null },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: { grantedAt: "desc" },
        },
        requests: {
          include: { uploader: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            requests: { where: { status: "PENDING_REVIEW" } },
            assignments: { where: { revokedAt: null } },
          },
        },
      },
    });
  }
}

export const channelRepository = new ChannelRepository();
