import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { error, type, timestamp } = req.body
    
    // Log to server console
    console.error('🔴 Client Runtime Error:', {
      type,
      error,
      timestamp,
      userAgent: req.headers['user-agent'],
      ip: req.connection.remoteAddress
    })
    
    res.status(200).json({ received: true })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}