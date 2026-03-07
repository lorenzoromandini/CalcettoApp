const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS member_statistics (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          club_member_id TEXT NOT NULL UNIQUE,
          club_id TEXT NOT NULL,
          appearances INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          draws INTEGER DEFAULT 0,
          goals INTEGER DEFAULT 0,
          current_win_streak INTEGER DEFAULT 0,
          max_win_streak INTEGER DEFAULT 0,
          current_loss_streak INTEGER DEFAULT 0,
          max_loss_streak INTEGER DEFAULT 0,
          avg_rating DOUBLE PRECISION,
          total_ratings INTEGER DEFAULT 0,
          goals_conceded INTEGER,
          matches_as_gk INTEGER,
          last_match_date TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT fk_club_member 
              FOREIGN KEY (club_member_id) 
              REFERENCES club_members(id) 
              ON DELETE CASCADE
      )
    `;
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_member_statistics_club_id ON member_statistics(club_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_member_statistics_club_member_id ON member_statistics(club_member_id)`;
    
    console.log('MemberStatistics table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();