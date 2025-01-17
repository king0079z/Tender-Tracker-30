import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/lib/db'

type ResponseData = {
  success: boolean;
  error?: string;
  details?: {
    timestamp: string;
    candidatesCount: number;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await pool.connect();
    try {
      // Test database connection
      const { rows } = await client.query('SELECT NOW()');
      
      // Test candidates table
      const candidatesResult = await client.query('SELECT COUNT(*) FROM candidates');
      
      res.status(200).json({
        success: true,
        details: {
          timestamp: rows[0].now,
          candidatesCount: parseInt(candidatesResult.rows[0].count)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}