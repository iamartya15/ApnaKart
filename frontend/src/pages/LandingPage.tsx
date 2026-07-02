import { SEO } from '../components/SEO';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <SEO
        title="ApnaKart - India's Smartest AI Shopping Super App"
        description="Search, compare, and get AI insights across multiple e-commerce marketplaces like Amazon, Flipkart, Meesho, Myntra, and more with ApnaKart."
        jsonLd={{
          '@type': 'Organization',
          name: 'ApnaKart',
          url: 'https://apnakart.com',
          logo: 'https://apnakart.com/icon.svg',
          sameAs: ['https://twitter.com/apnakart', 'https://facebook.com/apnakart'],
        }}
      />
      <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center mb-6">
        ApnaKart AI Shopping Super App
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-8">
        India's smartest shopping search engine. Compare products and track real-time price
        histories across all top Indian marketplaces with cutting-edge AI.
      </p>
      <div className="flex gap-4">
        <a
          href="/search"
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-opacity-90 transition-all"
        >
          Search Products
        </a>
        <a
          href="/compare"
          className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold hover:bg-opacity-90 transition-all border border-border"
        >
          Compare Matrix
        </a>
      </div>
    </div>
  );
};
