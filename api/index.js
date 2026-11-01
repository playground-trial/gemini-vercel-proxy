export const config = { runtime: 'edge' };

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    url.hostname = 'generativelanguage.googleapis.com';
    url.port = '443';
    url.protocol = 'https:';

    // 核心修复：丢弃原有请求头，仅重新构建合法的白名单请求头
    const safeHeaders = new Headers();
    safeHeaders.set('Content-Type', 'application/json');
    if (request.headers.has('Authorization')) {
      safeHeaders.set('Authorization', request.headers.get('Authorization'));
    }

    // 快速响应客户端的非对话探测，避免 404
    if (request.method !== 'POST') {
      return new Response("Vercel Proxy is active", { status: 200 });
    }

    // 解析并清洗请求体
    const bodyText = await request.text();
    if (!bodyText) return new Response("Empty body", { status: 400 });

    const bodyJson = JSON.parse(bodyText);
    delete bodyJson.thinking;
    delete bodyJson.reasoning;

    // 使用纯净的请求头转发至 Google
    return await fetch(url.toString(), {
      method: 'POST',
      headers: safeHeaders,
      body: JSON.stringify(bodyJson)
    });
    
  } catch (err) {
    // 将可能出现的崩溃信息转换为面板可见的明文报错
    return new Response(JSON.stringify({ 
      error: "Vercel Execution Error", 
      details: err.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
