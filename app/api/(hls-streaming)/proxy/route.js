export async function GET(req) {
  const targetUrl = new URL(req.url).searchParams.get('url');

  if (!targetUrl) {
    return new Response('Forbidden: Missing URL', { status: 403 });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const parsedUrl = new URL(decodedUrl);

    // ✅ Step 1: Allow specific domains
    const allowedDomains = [
      /^([a-zA-Z0-9-]+\.)?netmagcdn\.com$/,
      /^([a-zA-Z0-9-]+\.)?megastatics\.com$/,
    ];

    const isHostAllowed = allowedDomains.some((regex) =>
      regex.test(parsedUrl.hostname)
    );

    if (!isHostAllowed) {
      return new Response('Forbidden: Host not allowed', { status: 403 });
    }

    // 🛡️ Step 2: Validate origin if needed
    let origin = req.headers.get('origin');
    if (!origin) {
      const referer = req.headers.get('referer');
      try {
        origin = referer ? new URL(referer).origin : 'https://unknown';
      } catch (e) {
        origin = 'https://unknown';
      }
    }

    const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || '*';
    if (allowedOrigin !== '*' && origin !== allowedOrigin) {
      return new Response('Forbidden: Origin not allowed', { status: 403 });
    }

    // ⏬ Step 3: Proxy the request
    const res = await fetch(decodedUrl);

    // Special case for m3u8 playlist rewriting
    if (decodedUrl.endsWith('.m3u8')) {
      const text = await res.text();
      const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);

      // Rewrite .ts files to use the proxy API for fetching
      const rewritten = text.replace(
        /^(?!#)(.*\.(m3u8|ts))$/gm,
        (match) => `/api/proxy?url=${encodeURIComponent(baseUrl + match)}`
      );

      // Stream the rewritten text directly to the frontend
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(rewritten));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    // 🚀 Bandwidth logging version for media stream
    const { readable, writable } = new TransformStream();
    let totalBytes = 0;

    const reader = res.body.getReader();
    const writer = writable.getWriter();

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
        await writer.write(value);

        // Log bandwidth for each .ts file (if the URL ends with .ts)
        if (decodedUrl.endsWith('.ts')) {
          const tsMb = (value.length / (1024 * 1024)).toFixed(2);
          console.log(`[Bandwidth] ${tsMb} MB transferred for ${decodedUrl}`);
        }
      }
      await writer.close();

      const mb = (totalBytes / (1024 * 1024)).toFixed(2);
      console.log(`[Bandwidth] ${mb} MB transferred from ${decodedUrl}`);
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Invalid URL or error occurred', { status: 400 });
  }
}
