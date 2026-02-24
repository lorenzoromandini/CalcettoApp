import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('Created user:', user.email);

  // Create player profile for user
  const player = await prisma.player.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: 'Test',
      surname: 'User',
    },
  });

  console.log('Created player:', player.id);

  // Create a test club
  const club = await prisma.club.upsert({
    where: { id: 'test-club-001' },
    update: {},
    create: {
      id: 'test-club-001',
      name: 'Test Club',
      description: 'A test club for development',
      createdBy: user.id,
    },
  });

  console.log('Created club:', club.name);

  // Add user as owner member
  await prisma.clubMember.upsert({
    where: {
      clubId_userId: {
        clubId: club.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      clubId: club.id,
      userId: user.id,
      privilege: 'owner',
    },
  });

  console.log('Added user as club owner');

  // Create player club relationship with roles
  await prisma.playerClub.upsert({
    where: {
      playerId_clubId: {
        playerId: player.id,
        clubId: club.id,
      },
    },
    update: {},
    create: {
      playerId: player.id,
      clubId: club.id,
      jerseyNumber: 10,
      primaryRole: 'attacker',
      secondaryRoles: ['midfielder'],
    },
  });

  console.log('Created player club relationship');

  console.log('Seeding complete!');
  console.log('Login with: test@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
