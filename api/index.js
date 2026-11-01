export const config = { runtime: 'edge' };

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    url.hostname = 'generativelanguage.googleapis.com';
    url.port = '443';
    url.protocol = 'https:';

    const newHeaders = new Headers(request.headers);
    newHeaders.delete('host');
    newHeaders.delete('content-length');

    if (request.method !== 'POST') {
      return fetch(url.toString(), {
        method: request.method,
        headers: newHeaders
      });
    }

    const bodyText = await request.text();
    let newBody = bodyText;

    if (bodyText) {
      try {
        const bodyJson = JSON.parse(bodyText);
        let modified = false;
        if (bodyJson.thinking !== undefined) { delete bodyJson.thinking; modified = true; }
        if (bodyJson.reasoning !== undefined) { delete bodyJson.reasoning; modified = true; }
        if (modified) { newBody = JSON.stringify(bodyJson); }
      } catch (parseError) {
        // 如果不是合法 JSON，跳过清洗直接放行，防止代码崩溃
      }
    }

    return await fetch(url.toString(), {
      method: 'POST',
      headers: newHeaders,
      body: newBody || undefined
    });

  } catch (err) {
    // 如果依然出错，将原本隐藏的 Vercel 崩溃信息转化为可见的明文报错
    return new Response(JSON.stringify({ 
      error: "Vercel Proxy Error", 
      details: err.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
