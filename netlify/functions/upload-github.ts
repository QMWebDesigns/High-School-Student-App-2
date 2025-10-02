// Netlify Function: Upload PDF to GitHub (server-side, avoids CORS and hides token)
// Expects POST JSON: { metadata, base64Content, fileName }
// Env vars: GITHUB_TOKEN (required), GITHUB_REPO, GITHUB_BRANCH (defaults to 'main')

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'QMWebDesigns/High-School-Student-App-2';
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token) {
      return json(400, { error: 'Server token not configured' });
    }

    const body = JSON.parse(event.body || '{}');
    const { metadata, base64Content, fileName } = body;

    if (!metadata || !base64Content || !fileName) {
      return json(400, { error: 'Missing metadata, base64Content, or fileName' });
    }

    const path = buildPath(metadata, fileName);
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    const commitBody = {
      message: `Add ${metadata.title} - ${metadata.examType} (${metadata.grade})`,
      content: base64Content,
      branch
    };

    const gh = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commitBody)
    });

    if (!gh.ok) {
      let detail: any = null;
      try { detail = await gh.json(); } catch {}
      const msg = detail?.message || `GitHub error ${gh.status}`;
      return json(gh.status, { error: msg });
    }

    const downloadUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    return json(200, { success: true, downloadUrl });
  } catch (e: any) {
    return json(500, { error: e?.message || 'Server error' });
  }
};

function buildPath(metadata: any, fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const segments = [
    'papers',
    `grade-${encodeURIComponent(String(metadata.grade || ''))}`,
    encodeURIComponent(String(metadata.subject || '')),
    encodeURIComponent(String(metadata.year || '')),
    encodeURIComponent(String(metadata.examType || '')),
    sanitized
  ];
  return segments.join('/');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

function json(statusCode: number, data: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(data)
  };
}

