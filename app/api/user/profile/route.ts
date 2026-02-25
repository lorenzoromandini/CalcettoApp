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

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update jersey numbers in ClubMember table (new schema)
    if (jerseyChangesStr) {
      try {
        const jerseyChanges = JSON.parse(jerseyChangesStr) as Array<{
          clubId: string;
          jerseyNumber: number | null;
        }>;

        for (const change of jerseyChanges) {
          // Find the club membership for this user
          const membership = await prisma.clubMember.findFirst({
            where: {
              userId: userId,
              clubId: change.clubId,
            },
          });

          if (membership && change.jerseyNumber !== null && change.jerseyNumber >= 1 && change.jerseyNumber <= 99) {
            // Update the jersey number in ClubMember
            await prisma.clubMember.update({
              where: { id: membership.id },
              data: { jerseyNumber: change.jerseyNumber },
            });
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
