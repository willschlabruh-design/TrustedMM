export const SITE_URL = 'https://trustedmm.com';
export const SITE_NAME = 'TrustedMM';

export const DEFAULT_SEO = {
  title: 'TrustedMM – Secure Digital Asset Escrow',
  description: 'Secure escrow platform for digital asset transactions.',
  ogImage: `${SITE_URL}/og-image.png`,
  twitterCard: 'summary_large_image' as const,
};

export function pageUrl(path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized === '/' ? '' : normalized}`;
}

export function pageTitle(title?: string) {
  if (!title) return DEFAULT_SEO.title;
  return title.includes('TrustedMM') ? title : `${title} · TrustedMM`;
}
