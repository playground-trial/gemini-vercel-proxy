export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  const url = new URL(request.url);
  url.hostname = 'generativelanguage.googleapis.com';
  url.port = '443';
  url.protocol = 'https:';

  const newHeaders = new Headers(request.headers);
  newHeaders.delete('host');
  newHeaders.delete('content-length');

  if (request.method !== 'POST') {
    return fetch(new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      redirect: 'follow'
    }));
  }

  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return fetch(new Request(url.toString(), {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      }));
    }

    const bodyJson = JSON.parse(bodyText);
    if (bodyJson.thinking !== undefined) delete bodyJson.thinking;
    if (bodyJson.reasoning !== undefined) delete bodyJson.reasoning;

    const newBody = JSON.stringify(bodyJson);

    return fetch(new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: newBody,
      redirect: 'follow'
    }));
  } catch (e) {
    return fetch(new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      redirect: 'follow'
    }));
  }
}
