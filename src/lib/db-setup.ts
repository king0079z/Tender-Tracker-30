import pool from './db';

export async function setupDatabase() {
  const client = await pool.connect();
  try {
    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    console.log('Creating tables...');

    // Create candidates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        stage INTEGER NOT NULL DEFAULT 1,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        cv TEXT,
        interview_date TIMESTAMP,
        meeting_location TEXT,
        meeting_link TEXT,
        suggested_job_title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Candidates table created or already exists');

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        interviewer_name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Comments table created or already exists');

    // Create interviewers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidate_interviewers (
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        interviewer_name VARCHAR(255) NOT NULL,
        PRIMARY KEY (candidate_id, interviewer_name)
      );
    `);
    console.log('Candidate interviewers table created or already exists');

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for candidates table
    await client.query(`
      DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
      CREATE TRIGGER update_candidates_updated_at
          BEFORE UPDATE ON candidates
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('Failed to setup database:', error);
  process.exit(1);
});