'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function generateInviteLink(
  clubId: string,
  options?: { maxUses?: number }
): Promise<{ link: string; token: string }> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const token = crypto.randomUUID().replace(/-/g, '')
  
  const invite = await prisma.clubInvite.create({
    data: {
      clubId,
      createdBy: session.user.id,
      token,
      maxUses: options?.maxUses ?? 50,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const link = `/clubs/invite?token=${invite.token}`
  return { link, token: invite.token }
}
