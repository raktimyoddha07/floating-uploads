import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {
      name: "Owner Demo",
      username: "owner_demo",
    },
    create: {
      email: "owner@example.com",
      name: "Owner Demo",
      username: "owner_demo",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Owner%20Demo",
    },
  });

  const uploader = await prisma.user.upsert({
    where: { email: "uploader@example.com" },
    update: {
      name: "Uploader Demo",
      username: "uploader_demo",
    },
    create: {
      email: "uploader@example.com",
      name: "Uploader Demo",
      username: "uploader_demo",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Uploader%20Demo",
    },
  });

  const channel = await prisma.channel.upsert({
    where: { youtubeId: "demo-youtube-channel" },
    update: {
      ownerId: owner.id,
      name: "Nature Hub",
      handle: "@naturehub",
    },
    create: {
      ownerId: owner.id,
      name: "Nature Hub",
      youtubeId: "demo-youtube-channel",
      handle: "@naturehub",
      pictureUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Nature%20Hub",
    },
  });

  await prisma.uploaderAssignment.upsert({
    where: { id: "seed-assignment-owner-uploader-channel" },
    update: {
      ownerId: owner.id,
      uploaderId: uploader.id,
      channelId: channel.id,
      permission: "BOTH",
      revokedAt: null,
    },
    create: {
      id: "seed-assignment-owner-uploader-channel",
      ownerId: owner.id,
      uploaderId: uploader.id,
      channelId: channel.id,
      permission: "BOTH",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "NEW_REQUEST",
        title: "Seed notification",
        message: "Demo data has been created for testing.",
        link: "/dashboard",
      },
      {
        userId: uploader.id,
        type: "ACCESS_GRANTED",
        title: "Uploader access granted",
        message: "You can now upload for Nature Hub.",
        link: "/uploader",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.payment.upsert({
    where: { id: "seed-payment-owner" },
    update: {
      userId: owner.id,
      amount: 29,
      currency: "usd",
      status: "SUCCESS",
    },
    create: {
      id: "seed-payment-owner",
      userId: owner.id,
      amount: 29,
      currency: "usd",
      status: "SUCCESS",
    },
  });

  console.log("Seed complete");
  console.log({
    owner: { email: owner.email, username: owner.username },
    uploader: { email: uploader.email, username: uploader.username },
    channel: { id: channel.id, name: channel.name },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
