import type { NextApiRequest, NextApiResponse } from 'next'
import type { Candidate } from '@/types'
import pool from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await pool.connect();
    
    try {
      switch (req.method) {
        case 'GET':
          const { rows: candidates } = await client.query(`
            SELECT 
              c.*,
              json_agg(DISTINCT ci.interviewer_name) as interviewers,
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', cm.id,
                  'interviewerName', cm.interviewer_name,
                  'text', cm.text,
                  'status', cm.status,
                  'timestamp', cm.created_at
                )
              ) FILTER (WHERE cm.id IS NOT NULL) as comments
            FROM candidates c
            LEFT JOIN candidate_interviewers ci ON c.id = ci.candidate_id
            LEFT JOIN comments cm ON c.id = cm.candidate_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
          `);
          
          const formattedCandidates = candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            jobTitle: candidate.job_title,
            stage: candidate.stage,
            status: candidate.status,
            cv: candidate.cv,
            interviewDate: candidate.interview_date,
            meetingLocation: candidate.meeting_location,
            meetingLink: candidate.meeting_link,
            suggestedJobTitle: candidate.suggested_job_title,
            interviewers: candidate.interviewers || [],
            comments: candidate.comments || []
          }));

          res.status(200).json(formattedCandidates);
          break;
        
        case 'POST':
          const candidate = req.body as Candidate;
          
          // Start a transaction
          await client.query('BEGIN');
          
          try {
            // Insert candidate
            const { rows: [newCandidate] } = await client.query(`
              INSERT INTO candidates (
                name, email, job_title, stage, status, cv, 
                interview_date, meeting_location, meeting_link, 
                suggested_job_title
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *
            `, [
              candidate.name,
              candidate.email,
              candidate.jobTitle,
              candidate.stage,
              candidate.status,
              candidate.cv || null,
              candidate.interviewDate || null,
              candidate.meetingLocation || null,
              candidate.meetingLink || null,
              candidate.suggestedJobTitle || null
            ]);

            // Insert interviewers
            if (candidate.interviewers?.length > 0) {
              for (const interviewer of candidate.interviewers) {
                await client.query(`
                  INSERT INTO candidate_interviewers (candidate_id, interviewer_name)
                  VALUES ($1, $2)
                `, [newCandidate.id, interviewer]);
              }
            }

            // Insert comments
            if (candidate.comments?.length > 0) {
              for (const comment of candidate.comments) {
                await client.query(`
                  INSERT INTO comments (candidate_id, interviewer_name, text, status)
                  VALUES ($1, $2, $3, $4)
                `, [newCandidate.id, comment.interviewerName, comment.text, comment.status]);
              }
            }

            await client.query('COMMIT');

            res.status(201).json({
              ...newCandidate,
              interviewers: candidate.interviewers || [],
              comments: candidate.comments || []
            });
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          }
          break;
        
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in candidates API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}