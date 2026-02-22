import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const nickname = formData.get('nickname') as string | null;
    const imageFile = formData.get('image') as Blob | null;
    const removeImage = formData.get('removeImage') === 'true';
    const jerseyChangesStr = formData.get('jerseyChanges') as string | null;

    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ error: 'Il nome deve avere almeno 2 caratteri' }, { status: 400 });
    }
    if (!lastName || lastName.length < 2) {
      return NextResponse.json({ error: 'Il cognome deve avere almeno 2 caratteri' }, { status: 400 });
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = imageFile.type || 'image/jpeg';
      imageUrl = `data:${mimeType};base64,${base64}`;
    } else if (removeImage) {
      imageUrl = null;
    }

    const updateData: {
      firstName: string;
      lastName: string;
      nickname: string | null;
      image?: string | null;
    } = {
      firstName,
      lastName,
      nickname: nickname || null,
    };

    if (imageFile || removeImage) {
      updateData.image = imageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { playerProfile: true },
    });

    if (updatedUser.playerProfile) {
      const avatarUrl = (imageFile || removeImage) ? imageUrl : updatedUser.playerProfile.avatarUrl;
      await prisma.player.update({
        where: { id: updatedUser.playerProfile.id },
        data: { 
          name: firstName,
          surname: lastName,
          nickname: nickname || null,
          avatarUrl: avatarUrl,
        },
      });
    }

    if (jerseyChangesStr) {
      try {
        const jerseyChanges = JSON.parse(jerseyChangesStr) as Array<{
          teamId: string;
          jerseyNumber: number | null;
          playerId: string | null;
        }>;

        // Find or create player for this user
        let player = await prisma.player.findUnique({
          where: { userId: userId },
        });

        // If no player exists, create one
        if (!player) {
          player = await prisma.player.create({
            data: {
              userId: userId,
              name: firstName,
              surname: lastName,
              nickname: nickname || null,
            },
          });
        }

        for (const change of jerseyChanges) {
          if (!change.playerId) {
            change.playerId = player.id;
          }
          
          if (change.jerseyNumber !== null && change.jerseyNumber >= 1 && change.jerseyNumber <= 99) {
            const existing = await prisma.playerTeam.findUnique({
              where: {
                playerId_teamId: {
                  playerId: change.playerId,
                  teamId: change.teamId,
                },
              },
            });

            if (existing) {
              await prisma.playerTeam.update({
                where: { id: existing.id },
                data: { jerseyNumber: change.jerseyNumber },
              });
            } else {
              await prisma.playerTeam.create({
                data: {
                  playerId: change.playerId,
                  teamId: change.teamId,
                  jerseyNumber: change.jerseyNumber,
                  primaryRole: 'member',
                  secondaryRoles: [],
                },
              });
            }
          }
        }
      } catch (e) {
        console.error('Error updating jersey numbers:', e);
      }
    }

    return NextResponse.json({ 
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      image: updatedUser.image,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio' },
      { status: 500 }
    );
  }
}
