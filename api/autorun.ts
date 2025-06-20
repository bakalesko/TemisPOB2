import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`https://bmjqxougjdwaulfmsrhs.supabase.co/storage/v1/object/deck-files/update_trigger.txt?timestamp=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk',
        'Content-Type': 'text/plain',
        'x-upsert': 'true'
      },
      body: 'RUN'
    });

    console.log('AutoRun Storage API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'AutoRun trigger updated successfully',
        status: response.status 
      });
    } else {
      return res.status(response.status).json({ 
        success: false, 
        error: `Supabase request failed: ${response.statusText}`,
        status: response.status 
      });
    }
  } catch (error) {
    console.error('AutoRun API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}