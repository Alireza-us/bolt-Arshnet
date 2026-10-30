import { useEffect } from 'react';

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
};

const BASE = '[YOUR DOMAIN]';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeo({ title, description, path = '/' }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `${BASE}${path}`);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    const existing = document.getElementById('ld-json-localbusiness');
    if (!existing) {
      const ld = document.createElement('script');
      ld.id = 'ld-json-localbusiness';
      ld.type = 'application/ld+json';
      ld.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Arshnet',
        description:
          'Freelance IT contractor: CCTV & IP cameras, VoIP phone systems, and network & helpdesk support for small businesses.',
        telephone: '[PHONE NUMBER]',
        email: '[CONTACT EMAIL]',
        areaServed: '[CITY / REGION]',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '[CITY]',
          addressRegion: '[REGION]',
          addressCountry: '[COUNTRY]',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
          },
        ],
        priceRange: '$$',
      });
      document.head.appendChild(ld);
    }
  }, [title, description, path]);
}
