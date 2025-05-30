// app/api/hls-proxy/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get the source URL from query parameters
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get('url');
  
  if (!sourceUrl) {
    console.error('Missing URL parameter');
    return new NextResponse(JSON.stringify({ error: 'Missing URL parameter' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
  
  console.log('Attempting to proxy:', sourceUrl);
  
  try {
    // Fetch the manifest from the source URL with all necessary headers
    const response = await fetch(sourceUrl, {
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
      console.error(`Source responded with status: ${response.status} ${response.statusText}`);
      return new NextResponse(JSON.stringify({ 
        error: `Source responded with status: ${response.status} ${response.statusText}`,
        url: sourceUrl
      }), {
        status: 502, // Using 502 Bad Gateway to indicate upstream server issue
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }
    
    // Get the content of the manifest
    const content = await response.text();
    console.log('Received manifest content:', content.substring(0, 100) + '...');
    
    if (!content || content.trim() === '') {
      console.error('Received empty content from source');
      return new NextResponse(JSON.stringify({ 
        error: 'Received empty content from source',
        url: sourceUrl
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }
    
    // Get base URL for resolving relative URLs
    const baseUrl = new URL('./', sourceUrl).toString();
    const currentUrl = new URL(request.url);
    const proxyBaseUrl = `${currentUrl.protocol}//${currentUrl.host}/api/hls-proxy/content?baseUrl=${encodeURIComponent(baseUrl)}&path=`;
    
    // Process the manifest to rewrite URLs
    const modifiedContent = rewriteManifestUrls(content, proxyBaseUrl);
    
    // Return the manifest content as is without modification for testing
    return new NextResponse(modifiedContent, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error proxying HLS manifest:', error);
    return new NextResponse(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      url: sourceUrl
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
}

function rewriteManifestUrls(manifest, proxyBaseUrl) {
  // This handles standard m3u8 format
  let modifiedManifest = manifest;
  
  // Replace URLs in standard stream references (lines that don't start with #)
  modifiedManifest = modifiedManifest.replace(
    /^(?!#)(.+\.m3u8)$/gm, 
    (match) => `${proxyBaseUrl}${encodeURIComponent(match)}`
  );
  
  // Replace URLs in EXT-X-I-FRAME-STREAM-INF lines
  modifiedManifest = modifiedManifest.replace(
    /URI="([^"]+\.m3u8)"/g,
    (match, uri) => `URI="${proxyBaseUrl}${encodeURIComponent(uri)}"`
  );
  
  // Replace URLs in EXT-X-MEDIA lines
  modifiedManifest = modifiedManifest.replace(
    /URI="([^"]+\.m3u8)"/g,
    (match, uri) => `URI="${proxyBaseUrl}${encodeURIComponent(uri)}"`
  );
  
  // Replace .ts segment URLs if they exist
  modifiedManifest = modifiedManifest.replace(
    /^(?!#)(.+\.ts)$/gm,
    (match) => `${proxyBaseUrl}${encodeURIComponent(match)}`
  );
  
  return modifiedManifest;
}