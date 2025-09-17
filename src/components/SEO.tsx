import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'ETHICAL HacXorZ - AI Assistant with Ethics',
  description = 'A transparent AI assistant that provides helpful information while maintaining ethical guidelines and showing confidence levels.',
  keywords = 'AI assistant, ethical AI, artificial intelligence, chat bot, transparency, confidence levels',
  image = '/og-image.png',
  url = window.location.href,
  type = 'website'
}) => {
  const fullTitle = title.includes('ETHICAL HacXorZ') ? title : `${title} | ETHICAL HacXorZ`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="ETHICAL HacXorZ" />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#00c1b3" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ETHICAL HacXorZ" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="ETHICAL HacXorZ - AI Assistant Preview" />
      <meta property="og:site_name" content="ETHICAL HacXorZ" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content="ETHICAL HacXorZ - AI Assistant Preview" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "ETHICAL HacXorZ",
          "description": description,
          "url": url,
          "applicationCategory": "AI Assistant",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "creator": {
            "@type": "Organization",
            "name": "ETHICAL HacXorZ Team"
          },
          "featureList": [
            "AI-powered conversations",
            "Ethical guidelines compliance",
            "Transparency and confidence levels",
            "Chat history management",
            "Privacy-focused design"
          ]
        })}
      </script>
    </Helmet>
  );
};