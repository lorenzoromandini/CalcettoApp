'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function generateInviteLink(
  clubId: string,
  options?: { maxUses?: number }
): Promise<{ link: string; token: string }> {
  const session = await getSession()
  
  if (!session?.id) {
    throw new Error('Not authenticated')
  }

  const token = crypto.randomUUID().replace(/-/g, '')
  
  // Note: maxUses field not in current schema - invites don't have usage limits
  const invite = await prisma.clubInvite.create({
    data: {
      clubId,
      createdBy: session.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const link = `/clubs/invite?token=${invite.token}`
  return { link, token: invite.token }
}
