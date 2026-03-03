import { PrismaClient, ClubPrivilege, PlayerRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const FIRST_NAMES = [
  'Marco', 'Luca', 'Giuseppe', 'Antonio', 'Francesco', 'Stefano', 'Alessandro', 'Davide',
  'Matteo', 'Andrea', 'Simone', 'Federico', 'Roberto', 'Michele', 'Paolo', 'Daniele',
  'Emanuele', 'Riccardo', 'Lorenzo', 'Gabriele', 'Christian', 'Fabio'
]

const LAST_NAMES = [
  'Rossi', 'Bianchi', 'Ferrari', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti',
  'Esposito', 'Rizzo', 'Moretti', 'Barbieri', 'Lombardi', 'Giordano', 'Mancini',
  'Santoro', 'Marino', 'Greco', 'Bruno', 'Amato', 'De Luca', 'Dalla Costa'
]

const ROLES: PlayerRole[] = ['POR', 'DIF', 'CEN', 'ATT']

async function main() {
  console.log('Starting seed...')

  // Cerca il club per nome (prendiamo il primo che troviamo con quel nome)
  const clubs = await prisma.club.findMany({
    where: { name: 'dffddds' }
  })

  let club = clubs[0]

  if (!club) {
    console.log('Club "dffddds" non trovato. Creazione...')
    
    // Prima crea un utente owner
    const ownerPassword = await hash('password123', 10)
    const owner = await prisma.user.create({
      data: {
        email: 'owner@dffddds.com',
        password: ownerPassword,
        firstName: 'Owner',
        lastName: 'Dffddds'
      }
    })
    
    club = await prisma.club.create({
      data: {
        name: 'dffddds',
        description: 'Club di test per formazioni',
        createdBy: owner.id
      }
    })
    
    // Crea owner come club member
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: owner.id,
        jerseyNumber: 1,
        primaryRole: 'POR',
        secondaryRoles: [],
        privileges: ClubPrivilege.OWNER
      }
    })
    
    console.log(`Club creato con ID: ${club.id}`)
  } else {
    console.log(`Trovato club esistente con ID: ${club.id}`)
  }

  // Conta quanti membri ci sono già
  const existingMembers = await prisma.clubMember.count({
    where: { clubId: club.id }
  })
  
  console.log(`Membri esistenti nel club: ${existingMembers}`)
  
  // Calcola quanti ne dobbiamo aggiungere per arrivare a 22 totali
  const membersToCreate = Math.max(0, 22 - existingMembers)
  
  if (membersToCreate === 0) {
    console.log('Il club ha già 22 membri!')
    return
  }
  
  console.log(`Creazione di ${membersToCreate} nuovi membri...`)

  // Crea i membri mancanti
  for (let i = 0; i < membersToCreate; i++) {
    const userIndex = existingMembers + i
    const email = `testuser${userIndex + 1}@example.com`
    const firstName = FIRST_NAMES[userIndex % FIRST_NAMES.length]
    const lastName = LAST_NAMES[userIndex % LAST_NAMES.length]
    const jerseyNumber = userIndex + 1
    const primaryRole = ROLES[userIndex % ROLES.length]

    // Crea l'utente
    const hashedPassword = await hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    })

    // Crea il club member
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: user.id,
        jerseyNumber,
        primaryRole,
        secondaryRoles: ROLES.filter(r => r !== primaryRole).slice(0, 2),
        privileges: ClubPrivilege.MEMBER
      }
    })

    console.log(`✓ Creato: ${firstName} ${lastName} (Maglia #${jerseyNumber}, Ruolo: ${primaryRole})`)
  }

  // Verifica finale
  const finalCount = await prisma.clubMember.count({
    where: { clubId: club.id }
  })

  console.log('\n✅ Seed completato!')
  console.log(`Totale membri nel club "dffddds": ${finalCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed fallito:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
