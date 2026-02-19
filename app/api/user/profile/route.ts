import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const nickname = formData.get('nickname') as string | null;
    const imageFile = formData.get('image') as Blob | null;
    const removeImage = formData.get('removeImage') === 'true';

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
      where: { id: session.user.id },
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
