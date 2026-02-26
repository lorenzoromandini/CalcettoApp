import { prisma } from '../lib/db';
import { ClubPrivilege, PlayerRole, MatchMode, MatchStatus } from '@prisma/client';
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
      nickname: 'Testy',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.email);

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

  // Add user as owner member with embedded player data
  const clubMember = await prisma.clubMember.upsert({
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
      privileges: ClubPrivilege.OWNER,
      primaryRole: PlayerRole.ATT,
      secondaryRoles: [PlayerRole.CEN],
      jerseyNumber: 10,
    },
  });

  console.log('Added user as club owner with player data');

  // Create additional test members
  const additionalUsers = [
    { email: 'player1@example.com', firstName: 'Mario', lastName: 'Rossi', nickname: 'SuperMario' },
    { email: 'player2@example.com', firstName: 'Luigi', lastName: 'Bianchi', nickname: 'Gigi' },
    { email: 'player3@example.com', firstName: 'Giovanni', lastName: 'Verdi', nickname: 'Gio' },
    { email: 'player4@example.com', firstName: 'Francesco', lastName: 'Neri', nickname: 'Franco' },
    { email: 'player5@example.com', firstName: 'Antonio', lastName: 'Gialli', nickname: 'Tony' },
  ];

  const roles = [PlayerRole.POR, PlayerRole.DIF, PlayerRole.DIF, PlayerRole.CEN, PlayerRole.CEN];

  for (let i = 0; i < additionalUsers.length; i++) {
    const userData = additionalUsers[i];
    const testUser = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        nickname: userData.nickname,
        password: hashedPassword,
      },
    });

    await prisma.clubMember.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: testUser.id,
        },
      },
      update: {},
      create: {
        clubId: club.id,
        userId: testUser.id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: roles[i],
        secondaryRoles: [],
        jerseyNumber: i + 1,
      },
    });

    console.log(`Created member: ${userData.firstName} ${userData.lastName}`);
  }

  // Create a test match
  const match = await prisma.match.create({
    data: {
      clubId: club.id,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: 'Campo Sportivo Test',
      mode: MatchMode.FIVE_V_FIVE,
      status: MatchStatus.SCHEDULED,
      createdBy: user.id,
    },
  });

  console.log('Created test match:', match.id);

  // Create formations for the match
  const homeFormation = await prisma.formation.create({
    data: {
      matchId: match.id,
      isHome: true,
      formationName: '5-1-2-1',
    },
  });

  const awayFormation = await prisma.formation.create({
    data: {
      matchId: match.id,
      isHome: false,
      formationName: '5-1-2-1',
    },
  });

  console.log('Created formations');

  // Add formation positions for all members
  const allMembers = await prisma.clubMember.findMany({
    where: { clubId: club.id },
    take: 10,
  });

  // Create home formation positions (first 5 members)
  for (let i = 0; i < 5 && i < allMembers.length; i++) {
    const member = allMembers[i];
    await prisma.formationPosition.create({
      data: {
        formationId: homeFormation.id,
        clubMemberId: member.id,
        positionX: 50 + (i - 2) * 15, // Spread horizontally
        positionY: 20 + (i % 2) * 30, // Alternate rows
        positionLabel: i === 0 ? 'GK' : i < 3 ? 'DEF' : 'MID',
        played: true,
      },
    });
  }

  // Create away formation positions (next 5 members)
  for (let i = 5; i < 10 && i < allMembers.length; i++) {
    const member = allMembers[i];
    await prisma.formationPosition.create({
      data: {
        formationId: awayFormation.id,
        clubMemberId: member.id,
        positionX: 50 + (i - 7) * 15,
        positionY: 20 + ((i - 5) % 2) * 30,
        positionLabel: i === 5 ? 'GK' : i < 8 ? 'DEF' : 'MID',
        played: true,
      },
    });
  }

  console.log('Created formation positions');

  // Create a completed match with ratings
  const completedMatch = await prisma.match.create({
    data: {
      clubId: club.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      location: 'Campo Sportivo Vecchio',
      mode: MatchMode.FIVE_V_FIVE,
      status: MatchStatus.COMPLETED,
      homeScore: 3,
      awayScore: 2,
      createdBy: user.id,
      scoreFinalizedBy: user.id,
      scoreFinalizedAt: new Date(),
      ratingsCompletedBy: user.id,
      ratingsCompletedAt: new Date(),
    },
  });

  // Add some goals
  const scorers = allMembers.slice(0, 3);
  for (const scorer of scorers) {
    await prisma.goal.create({
      data: {
        matchId: completedMatch.id,
        scorerId: scorer.id,
        isOwnGoal: false,
      },
    });
  }

  // Add some ratings
  const ratableMembers = allMembers.slice(0, 5);
  for (const member of ratableMembers) {
    await prisma.playerRating.create({
      data: {
        matchId: completedMatch.id,
        clubMemberId: member.id,
        rating: 7.5,
      },
    });
  }

  console.log('Created completed match with goals and ratings');

  console.log('Seeding complete!');
  console.log('Login with: test@example.com / password123');
  console.log('Test club has 6 members with roles and jersey numbers');
  console.log('Two matches created: 1 scheduled, 1 completed with ratings');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
