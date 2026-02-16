/**
 * Invite Database Operations - Prisma Version
 */

import { prisma } from '@/lib/prisma';

export async function createInvite(
  teamId: string,
  createdBy: string,
  maxUses: number = 50
): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, '');
  
  const invite = await prisma.teamInvite.create({
    data: {
      teamId,
      createdBy,
      token,
      maxUses,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return invite.token;
}

// Alias for backward compatibility
export async function generateInviteLink(
  teamId: string,
  userId: string,
  options?: { maxUses?: number }
): Promise<{ link: string; token: string }> {
  const token = await createInvite(teamId, userId, options?.maxUses ?? 50);
  // Use relative URL - the actual origin will be determined at runtime
  const link = `/teams/invite?token=${token}`;
  return { link, token };
}

export async function getInviteByToken(token: string) {
  return await prisma.teamInvite.findUnique({
    where: { token },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function redeemInvite(
  token: string,
  userId: string
): Promise<boolean> {
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
  });

  if (!invite) return false;
  if (invite.expiresAt < new Date()) return false;
  if (invite.useCount >= invite.maxUses) return false;

  // Check if user is already a member
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: invite.teamId,
      userId,
    },
  });

  if (existingMember) return false;

  // Add user to team
  await prisma.teamMember.create({
    data: {
      teamId: invite.teamId,
      userId,
      role: 'member',
    },
  });

  // Update invite
  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      useCount: { increment: 1 },
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return true;
}

export async function getTeamInvites(teamId: string) {
  return await prisma.teamInvite.findMany({
    where: {
      teamId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function deleteInvite(inviteId: string): Promise<void> {
  await prisma.teamInvite.delete({
    where: { id: inviteId },
  });
}
