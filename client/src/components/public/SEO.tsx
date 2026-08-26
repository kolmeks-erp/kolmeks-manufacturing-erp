import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Kolmeks | Precision Manufacturing & Engineering',
  description = 'Global contract manufacturing partner specializing in CNC machining, component assembly, electric motor windings, and industrial supply chain solutions.',
}) => {
  useEffect(() => {
    document.title = title.includes('Kolmeks') ? title : `${title} | Kolmeks Manufacturing`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
};
