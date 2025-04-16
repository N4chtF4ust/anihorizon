export async function GET(req) {
  const targetUrl = req.nextUrl.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  const res = await fetch(targetUrl);

  const contentType = res.headers.get('content-type') || 'text/plain';

  // Handle .m3u8 playlist rewriting
  if (targetUrl.endsWith('.m3u8')) {
    const text = await res.text();
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

    // Replace relative m3u8/ts paths with proxied paths
    const rewritten = text.replace(
      /^(?!#)(.*\.(m3u8|ts))$/gm,
      (match) => `/api/proxy?url=${encodeURIComponent(baseUrl + match)}`
    );

    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
      },
    });
  }

  // Handle binary streaming (e.g., .ts segments)
  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
    },
  });
}
