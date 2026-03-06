import { PrismaClient, ClubPrivilege, PlayerRole, MatchStatus, MatchMode } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Generate realistic CUID-style IDs
const generateId = () => createId();

async function main() {
  console.log('🌱 Starting database seed...');

  // Generate IDs upfront for reference
  const userIds = Array.from({ length: 12 }, () => generateId());
  const clubId = generateId();
  const memberIds = Array.from({ length: 12 }, () => generateId());
  const matchIds = Array.from({ length: 4 }, () => generateId());
  const goalIds = Array.from({ length: 15 }, () => generateId());

  // Clear existing data (in correct order to avoid FK constraints)
  console.log('Clearing existing data...');
  await prisma.playerRating.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.formationPosition.deleteMany({});
  await prisma.formation.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.clubInvite.deleteMany({});
  await prisma.clubMember.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  console.log('Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: userIds[0],
        email: 'mario.rossi@example.com',
        firstName: 'Mario',
        lastName: 'Rossi',
        nickname: 'SuperMario',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[1],
        email: 'luigi.bianchi@example.com',
        firstName: 'Luigi',
        lastName: 'Bianchi',
        nickname: 'Gigi',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[2],
        email: 'giovanni.verdi@example.com',
        firstName: 'Giovanni',
        lastName: 'Verdi',
        nickname: 'Gio',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[3],
        email: 'antonio.neri@example.com',
        firstName: 'Antonio',
        lastName: 'Neri',
        nickname: 'Tony',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[4],
        email: 'francesco.gialli@example.com',
        firstName: 'Francesco',
        lastName: 'Gialli',
        nickname: 'Ciccio',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[5],
        email: 'alessandro.blu@example.com',
        firstName: 'Alessandro',
        lastName: 'Blu',
        nickname: 'Alex',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[6],
        email: 'marco.rosa@example.com',
        firstName: 'Marco',
        lastName: 'Rosa',
        nickname: 'Mark',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[7],
        email: 'stefano.arancio@example.com',
        firstName: 'Stefano',
        lastName: 'Arancio',
        nickname: 'Steve',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[8],
        email: 'paolo.viola@example.com',
        firstName: 'Paolo',
        lastName: 'Viola',
        nickname: 'Paul',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[9],
        email: 'luca.marrone@example.com',
        firstName: 'Luca',
        lastName: 'Marrone',
        nickname: 'Luchino',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[10],
        email: 'diego.azzurri@example.com',
        firstName: 'Diego',
        lastName: 'Azzurri',
        nickname: null,
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: userIds[11],
        email: 'roberto.rosso@example.com',
        firstName: 'Roberto',
        lastName: 'Rosso',
        nickname: 'Roby',
        password: await bcrypt.hash('password123', 10),
        image: null,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create Club
  console.log('Creating club...');
  const club = await prisma.club.create({
    data: {
      id: clubId,
      name: 'Porcodio FC',
      description: 'La squadra più forte del quartiere!',
      imageUrl: null,
      createdBy: users[0].id,
    },
  });

  console.log(`Created club: ${club.name}`);

  // Create Club Members
  console.log('Creating club members...');
  const members = await Promise.all([
    // Owner
    prisma.clubMember.create({
      data: {
        id: memberIds[0],
        clubId: club.id,
        userId: users[0].id,
        privileges: ClubPrivilege.OWNER,
        primaryRole: PlayerRole.CEN,
        secondaryRoles: [PlayerRole.ATT],
        jerseyNumber: 10,
        symbol: '⭐',
      },
    }),
    // Manager
    prisma.clubMember.create({
      data: {
        id: memberIds[1],
        clubId: club.id,
        userId: users[1].id,
        privileges: ClubPrivilege.MANAGER,
        primaryRole: PlayerRole.POR,
        secondaryRoles: [],
        jerseyNumber: 1,
        symbol: '🧤',
      },
    }),
    // Regular members with various roles and numbers
    prisma.clubMember.create({
      data: {
        id: memberIds[2],
        clubId: club.id,
        userId: users[2].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.DIF,
        secondaryRoles: [PlayerRole.CEN],
        jerseyNumber: 4,
        symbol: '🛡️',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[3],
        clubId: club.id,
        userId: users[3].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.DIF,
        secondaryRoles: [],
        jerseyNumber: 5,
        symbol: '💪',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[4],
        clubId: club.id,
        userId: users[4].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.CEN,
        secondaryRoles: [PlayerRole.DIF],
        jerseyNumber: 8,
        symbol: '🎯',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[5],
        clubId: club.id,
        userId: users[5].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.CEN,
        secondaryRoles: [PlayerRole.ATT],
        jerseyNumber: 6,
        symbol: '⚡',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[6],
        clubId: club.id,
        userId: users[6].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.ATT,
        secondaryRoles: [PlayerRole.CEN],
        jerseyNumber: 7,
        symbol: '🔥',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[7],
        clubId: club.id,
        userId: users[7].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.ATT,
        secondaryRoles: [],
        jerseyNumber: 9,
        symbol: '⚽',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[8],
        clubId: club.id,
        userId: users[8].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.ATT,
        secondaryRoles: [PlayerRole.CEN],
        jerseyNumber: 11,
        symbol: '🚀',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[9],
        clubId: club.id,
        userId: users[9].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.DIF,
        secondaryRoles: [],
        jerseyNumber: 3,
        symbol: '🏰',
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[10],
        clubId: club.id,
        userId: users[10].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.POR,
        secondaryRoles: [],
        jerseyNumber: 12,
        symbol: null,
      },
    }),
    prisma.clubMember.create({
      data: {
        id: memberIds[11],
        clubId: club.id,
        userId: users[11].id,
        privileges: ClubPrivilege.MEMBER,
        primaryRole: PlayerRole.CEN,
        secondaryRoles: [PlayerRole.DIF, PlayerRole.ATT],
        jerseyNumber: 14,
        symbol: '🎩',
      },
    }),
  ]);

  console.log(`Created ${members.length} club members`);

  // Create Matches
  console.log('Creating matches...');
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const matches = await Promise.all([
    // Completed matches with ratings
    prisma.match.create({
      data: {
        id: matchIds[0],
        clubId: club.id,
        scheduledAt: threeWeeksAgo,
        location: 'Campo Comunale - Via Roma',
        mode: MatchMode.FIVE_V_FIVE,
        status: MatchStatus.COMPLETED,
        homeScore: 5,
        awayScore: 3,
        createdBy: users[0].id,
        scoreFinalizedBy: users[0].id,
        scoreFinalizedAt: new Date(threeWeeksAgo.getTime() + 2 * 60 * 60 * 1000),
        ratingsCompletedBy: users[0].id,
        ratingsCompletedAt: new Date(threeWeeksAgo.getTime() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.match.create({
      data: {
        id: matchIds[1],
        clubId: club.id,
        scheduledAt: twoWeeksAgo,
        location: 'Campo Sportivo - Via Milano',
        mode: MatchMode.FIVE_V_FIVE,
        status: MatchStatus.COMPLETED,
        homeScore: 4,
        awayScore: 4,
        createdBy: users[0].id,
        scoreFinalizedBy: users[0].id,
        scoreFinalizedAt: new Date(twoWeeksAgo.getTime() + 2 * 60 * 60 * 1000),
        ratingsCompletedBy: users[0].id,
        ratingsCompletedAt: new Date(twoWeeksAgo.getTime() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.match.create({
      data: {
        id: matchIds[2],
        clubId: club.id,
        scheduledAt: oneWeekAgo,
        location: 'Campo Comunale - Via Roma',
        mode: MatchMode.EIGHT_V_EIGHT,
        status: MatchStatus.COMPLETED,
        homeScore: 6,
        awayScore: 2,
        createdBy: users[1].id,
        scoreFinalizedBy: users[1].id,
        scoreFinalizedAt: new Date(oneWeekAgo.getTime() + 2 * 60 * 60 * 1000),
        ratingsCompletedBy: users[1].id,
        ratingsCompletedAt: new Date(oneWeekAgo.getTime() + 24 * 60 * 60 * 1000),
      },
    }),
    // Scheduled match
    prisma.match.create({
      data: {
        id: matchIds[3],
        clubId: club.id,
        scheduledAt: oneWeekFromNow,
        location: 'Campo Comunale - Via Roma',
        mode: MatchMode.FIVE_V_FIVE,
        status: MatchStatus.SCHEDULED,
        homeScore: 0,
        awayScore: 0,
        createdBy: users[0].id,
      },
    }),
  ]);

  console.log(`Created ${matches.length} matches`);

  // Create Goals
  console.log('Creating goals...');
  const goals = await Promise.all([
    // Match 1 goals
    prisma.goal.create({
      data: {
        id: goalIds[0],
        matchId: matchIds[0],
        scorerId: memberIds[6],
        assisterId: memberIds[4],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[1],
        matchId: matchIds[0],
        scorerId: memberIds[7],
        assisterId: memberIds[6],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[2],
        matchId: matchIds[0],
        scorerId: memberIds[4],
        assisterId: null,
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[3],
        matchId: matchIds[0],
        scorerId: memberIds[8],
        assisterId: memberIds[5],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[4],
        matchId: matchIds[0],
        scorerId: memberIds[6],
        assisterId: memberIds[7],
        isOwnGoal: false,
      },
    }),
    // Match 2 goals
    prisma.goal.create({
      data: {
        id: goalIds[5],
        matchId: matchIds[1],
        scorerId: memberIds[7],
        assisterId: null,
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[6],
        matchId: matchIds[1],
        scorerId: memberIds[8],
        assisterId: memberIds[6],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[7],
        matchId: matchIds[1],
        scorerId: memberIds[5],
        assisterId: memberIds[4],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[8],
        matchId: matchIds[1],
        scorerId: memberIds[6],
        assisterId: null,
        isOwnGoal: false,
      },
    }),
    // Match 3 goals
    prisma.goal.create({
      data: {
        id: goalIds[9],
        matchId: matchIds[2],
        scorerId: memberIds[8],
        assisterId: memberIds[6],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[10],
        matchId: matchIds[2],
        scorerId: memberIds[7],
        assisterId: memberIds[8],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[11],
        matchId: matchIds[2],
        scorerId: memberIds[6],
        assisterId: memberIds[4],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[12],
        matchId: matchIds[2],
        scorerId: memberIds[4],
        assisterId: null,
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[13],
        matchId: matchIds[2],
        scorerId: memberIds[5],
        assisterId: memberIds[7],
        isOwnGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        id: goalIds[14],
        matchId: matchIds[2],
        scorerId: memberIds[8],
        assisterId: memberIds[5],
        isOwnGoal: false,
      },
    }),
  ]);

  console.log(`Created ${goals.length} goals`);

  // Create Player Ratings
  console.log('Creating player ratings...');
  
  // Helper to generate random ratings
  const generateRatings = (matchId: string, memberIdList: string[], baseRating: number) => {
    return memberIdList.map((memberId, index) => {
      // Add some variation to ratings
      const variation = (Math.random() - 0.5) * 2; // -1 to +1
      const rating = Math.max(4.0, Math.min(10.0, baseRating + variation));
      
      const ratingId = generateId();
      return prisma.playerRating.create({
        data: {
          id: ratingId,
          matchId,
          clubMemberId: memberId,
          rating: Math.round(rating * 100) / 100,
          comment: index === 0 ? 'MVP! Grande partita!' : undefined,
        },
      });
    });
  };

  const ratings = await Promise.all([
    // Match 1 ratings - good performance
    ...generateRatings(matchIds[0], memberIds.slice(0, 8), 7.5),
    // Match 2 ratings - average
    ...generateRatings(matchIds[1], memberIds.slice(0, 8), 6.5),
    // Match 3 ratings - excellent
    ...generateRatings(matchIds[2], memberIds.slice(0, 10), 8.0),
  ]);

  console.log(`Created ${ratings.length} player ratings`);

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - ${users.length} users`);
  console.log(`  - 1 club: "${club.name}"`);
  console.log(`  - ${members.length} club members`);
  console.log(`  - ${matches.length} matches (3 completed, 1 scheduled)`);
  console.log(`  - ${goals.length} goals scored`);
  console.log(`  - ${ratings.length} player ratings`);
  console.log('\n📝 Login credentials:');
  console.log('  Email: mario.rossi@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });