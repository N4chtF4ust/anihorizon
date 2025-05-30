export async function GET() {
    const baseUrl =
      'https://eb.netmagcdn.com:2228/hls-playback/a684043aa044e8107434617d8cdd6e0015d1a951b5021410d9f8c4ed9f6bc9a310f88a7887b090f86f0d88fcc3a2853dd6153e8e9660ff4c9465af4a6eeb19940d03434325df3ff28958187792974cfd05d7c4d0c3d957a8bd7b31425199a79a01b49564b2b6908cc421744877ca68d7b42d5b3498f9b8903ebfeab8b4e390f8797242e9abb0d83390ebb3122f83234e/';
    const playlistUrl = baseUrl + 'master.m3u8';
  
    try {
      const res = await fetch(playlistUrl);
      if (!res.ok) throw new Error('Failed to fetch playlist');
  
      const text = await res.text();
  
      return new Response(text, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      console.error(err);
      return new Response('Error fetching M3U8', { status: 500 });
    }
  }
  