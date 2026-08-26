import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Kolmeks | Precision Manufacturing & Engineering',
  description = 'Explore Kolmeks contract manufacturing capabilities, precision engineering, quality focus, and industrial component solutions.',
  type = 'website',
}) => {
  useEffect(() => {
    const fullTitle = title.includes('Kolmeks') ? title : `${title} | Kolmeks Manufacturing`;
    document.title = fullTitle;

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Open Graph Meta Tags
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: window.location.href },
    ];

    ogTags.forEach(({ property, content }) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', content);
    });
  }, [title, description, type]);

  return null;
};
