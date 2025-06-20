import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileBuffer, fileName } = req.body;
    
    if (!fileBuffer) {
      return res.status(400).json({ error: "File buffer is required" });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bmjqxougjdwaulfmsrhs.supabase.co';
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const buffer = Buffer.from(fileBuffer, 'base64');
    
    // Upload to occupancy-files bucket
    const { error: error1 } = await supabase.storage
      .from('occupancy-files')
      .upload('muster-station-reports.xlsx', buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    // Upload to deck-files bucket
    const { error: error2 } = await supabase.storage
      .from('deck-files')
      .upload('muster-station-reports.xlsx', buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    if (error1 || error2) {
      console.error('Supabase upload errors:', { error1, error2 });
      return res.status(500).json({ 
        error: "Upload failed", 
        details: { 
          occupancyFiles: error1?.message || "Success",
          deckFiles: error2?.message || "Success"
        }
      });
    }

    res.json({ success: true, message: "File uploaded to both Supabase Storage buckets" });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}