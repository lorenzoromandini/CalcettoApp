import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ilovegojoskin@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: {
          club: {
            deletedAt: null
          }
        },
        include: {
          club: true
        }
      }
    }
  });

  if (!user) {
    console.log('Utente non trovato');
    return;
  }

  console.log('Utente:', user.firstName, user.lastName, `(${user.email})`);
  console.log('ID:', user.id);
  console.log('');
  console.log('Team associati:', user.memberships.length);
  
  for (const m of user.memberships) {
    console.log(`  - ${m.club.name} (${m.role}) - ID: ${m.club.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
