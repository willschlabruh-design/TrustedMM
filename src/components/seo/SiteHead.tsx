import Head from 'next/head';
import { useRouter } from 'next/router';
import { DEFAULT_SEO, pageTitle, pageUrl, SITE_NAME } from '../../lib/seo';

type SiteHeadProps = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
};

export default function SiteHead({
  title,
  description = DEFAULT_SEO.description,
  image = DEFAULT_SEO.ogImage,
  noIndex,
}: SiteHeadProps) {
  const router = useRouter();
  const canonical = pageUrl(router.asPath.split('?')[0] || '/');
  const resolvedTitle = pageTitle(title);

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={resolvedTitle} />

      <meta name="twitter:card" content={DEFAULT_SEO.twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="theme-color" content="#081229" />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Head>
  );
}
