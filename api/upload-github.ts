import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { metadata, base64Content, fileName } = req.body;

    if (!metadata || !base64Content || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Your GitHub upload logic here (same as before)
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'QMWebDesigns/High-School-Student-App-2';
    const branch = process.env.GITHUB_BRANCH || 'main';

    // ... rest of your upload logic

    return res.status(200).json({ success: true, downloadUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}