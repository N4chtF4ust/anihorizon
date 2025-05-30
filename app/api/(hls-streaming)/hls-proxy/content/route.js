// app/api/hls-proxy/content/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get parameters from the query string
  const { searchParams } = new URL(request.url);
  const baseUrl = searchParams.get('baseUrl');
  const path = searchParams.get('path');
  
  if (!baseUrl || !path) {
    return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
  

  
  try {
    // Construct the full URL - handle both absolute and relative paths
    let fullUrl;
    if (path.startsWith('http')) {
      fullUrl = path;
    } else {
      fullUrl = new URL(path, baseUrl).toString();
    }
    

    
    // Fetch the content
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': new URL(request.url).origin,
        'Referer': new URL(request.url).origin
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Content source responded with status: ${response.status}`);
      return new NextResponse(JSON.stringify({ 
        error: `Content source responded with status: ${response.status}`,
        url: fullUrl
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (path.endsWith('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (path.endsWith('.ts')) {
      contentType = 'video/mp2t';
    } else if (path.endsWith('.mp4')) {
      contentType = 'video/mp4';
    } else if (path.endsWith('.key')) {
      contentType = 'application/octet-stream';
    }
    
    // For text content like m3u8, process and rewrite URLs
    if (contentType === 'application/vnd.apple.mpegurl') {
      const text = await response.text();
      const currentUrl = new URL(request.url);
      const proxyBaseUrl = `${currentUrl.protocol}//${currentUrl.host}/api/hls-proxy/content?baseUrl=${encodeURIComponent(baseUrl)}&path=`;
      
      const modifiedContent = rewriteContentUrls(text, proxyBaseUrl);
      
      return new NextResponse(modifiedContent, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      // For binary content like video segments, stream it directly
      const arrayBuffer = await response.arrayBuffer();
      
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  } catch (error) {
    console.error('Error proxying content:', error);
    return new NextResponse(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      baseUrl,
      path
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
}

function rewriteContentUrls(content, proxyBaseUrl) {
  // For m3u8 files, rewrite relative URLs
  let modifiedContent = content;
  
  // Replace segment URLs in lines after EXTINF that don't start with #
  modifiedContent = modifiedContent.replace(
    /^(?!#)(.+\.ts)$/gm,
    (match) => `${proxyBaseUrl}${encodeURIComponent(match)}`
  );
  
  // Replace key URLs
  modifiedContent = modifiedContent.replace(
    /#EXT-X-KEY:METHOD=[^,]+,URI="([^"]+)"/g,
    (match, uri) => match.replace(uri, `${proxyBaseUrl}${encodeURIComponent(uri)}`)
  );
  
  // Replace MAP URLs
  modifiedContent = modifiedContent.replace(
    /#EXT-X-MAP:URI="([^"]+)"/g,
    (match, uri) => match.replace(uri, `${proxyBaseUrl}${encodeURIComponent(uri)}`)
  );
  
  return modifiedContent;
}