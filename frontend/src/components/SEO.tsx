import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  jsonLd?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = "ApnaKart - India's Smartest AI Shopping Platform",
  description = 'Compare prices across Amazon, Flipkart, Meesho, Myntra, and Ajio with real-time AI recommendations and review audits.',
  keywords = 'shopping aggregator, price comparison india, ai shopping assistant, amazon flipkart meesho compare',
  canonical = 'https://apnakart.com',
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // Dynamic Title
    document.title = title;

    // Helper to update or create metatags
    const setMetaTag = (attr: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonical);

    // Twitter
    setMetaTag('property', 'twitter:title', title);
    setMetaTag('property', 'twitter:description', description);

    // Canonical link tag
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute('href', canonical);

    // JSON-LD Schema integration
    const scriptId = 'jsonld-schema';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...jsonLd,
      });
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, keywords, canonical, ogType, jsonLd]);

  return null;
};

export default SEO;
