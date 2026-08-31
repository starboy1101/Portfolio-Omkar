import { useEffect } from 'react';
import { portfolio } from '../data/portfolio';
import { trackPageView } from '../services/analytics';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  imageAlt?: string;
}

const upsertMeta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
};

const upsertCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
};

const Seo = ({
  title,
  description,
  path,
  noIndex = false,
  imageAlt = 'Omkar Mahabdi — AI/ML engineering and data analytics portfolio',
}: SeoProps) => {
  useEffect(() => {
    const configuredSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
    const liveOrigin = import.meta.env.PROD ? window.location.origin : portfolio.profile.portfolio_url;
    const siteOrigin = (configuredSiteUrl || liveOrigin).replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${siteOrigin}${normalizedPath === '/' ? '/' : normalizedPath}`;
    const imageUrl = `${siteOrigin}/og-portfolio.jpg`;

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    upsertMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    upsertMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    upsertMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', imageAlt);
    upsertCanonical(canonicalUrl);

    void trackPageView(normalizedPath, title);
  }, [description, imageAlt, noIndex, path, title]);

  return null;
};

export default Seo;
