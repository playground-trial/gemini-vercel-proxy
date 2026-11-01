export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let path = req.url;
    if (path.includes('/api/index')) {
      path = req.method === 'GET' ? '/v1beta/openai/models' : '/v1beta/openai/chat/completions';
    }
    
    const targetUrl = `https://generativelanguage.googleapis.com${path}`;
    const fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
      }
      if (body && typeof body === 'object') {
        delete body.thinking;
        delete body.reasoning;
        fetchOptions.body = JSON.stringify(body);
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();
    
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Node Proxy Crash", details: error.message });
  }
}
