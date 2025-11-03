import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEO = ({
  title = "Handmade Children's Clothing | Australian Made by Nanny Rae Rae",
  description = "Discover unique, handcrafted children's clothing made in Australia. Quality pieces lovingly sewn by Nanny Rae Rae. Shop exclusive designs for babies and kids.",
  keywords = "handmade children's clothing, Australian made kids clothes, handcrafted baby wear, unique children's fashion, sustainable kids clothing",
  ogImage = "https://kqshrevhtrusxrwkgdmd.supabase.co/storage/v1/object/public/brand-assets/about-rae/nanny-rae-rae-og-image.png",
  ogType = "website",
  noIndex = false,
  canonicalUrl,
  structuredData
}: SEOProps) => {
  const baseUrl = "https://bynannyraerae.com.au";
  const fullTitle = title.includes("Nanny Rae Rae") ? title : `${title} | Nanny Rae Rae`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Viewport for mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${baseUrl}${canonicalUrl}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl} />
      <meta property="og:site_name" content="Handmade by Nanny Rae Rae" />
      <meta property="og:locale" content="en_AU" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@handmadebynannyraerae" />

      {/* Additional Meta */}
      <meta name="author" content="Nanny Rae Rae" />
      <meta name="generator" content="Handmade by Nanny Rae Rae" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;