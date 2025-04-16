// components/AdBanner.js

import Head from 'next/head';

const AdBannerHorizontal = () => {
  return (
    <>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2855084793444345"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2855084793444345"
        data-ad-slot="9963345848"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
};

export default AdBannerHorizontal;
