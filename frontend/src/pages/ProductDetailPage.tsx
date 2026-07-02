import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSearchQuery } from '../hooks/useSearchQueries';
import {
  ArrowLeft,
  TrendingDown,
  Star,
  Sparkles,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  useReviewTrustQuery,
  useSellerTrustQuery,
  useProductSummaryQuery,
} from '../hooks/useAIQueries';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Extract raw search query word from id for mock details resolution
  const rawQuery = id?.split('-')[1] || 'iphone15';

  const { data: searchResults, isLoading } = useSearchQuery(rawQuery, '', !!rawQuery);
  const [product, setProduct] = useState<any>(null);

  const { data: reviewTrust } = useReviewTrustQuery(id || '');
  const { data: sellerTrust } = useSellerTrustQuery('seller-123');
  const { data: aiSummary } = useProductSummaryQuery(id || '');

  useEffect(() => {
    if (searchResults?.products) {
      const match = searchResults.products.find((p: any) => p.id === id);
      setProduct(match || searchResults.products[0]);
    }
  }, [searchResults, id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving detailed catalog records...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-semibold">Failed to resolve product specifications.</p>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2 border rounded-full font-bold"
        >
          Go back to Search
        </button>
      </div>
    );
  }

  // Mock historical prices for Recharts line chart (last 6 months)
  const mockPriceHistory = [
    { month: 'Jan', price: Math.round(product.price * 1.15) },
    { month: 'Feb', price: Math.round(product.price * 1.12) },
    { month: 'Mar', price: Math.round(product.price * 1.08) },
    { month: 'Apr', price: Math.round(product.price * 1.05) },
    { month: 'May', price: Math.round(product.price * 1.03) },
    { month: 'Jun', price: product.price },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <SEO
        title={`${product.title} - Price Compare & AI Review Audit`}
        description={`Check live price, cashback details, seller trust analysis, and AI reviews summary for ${product.title} across marketplaces.`}
        jsonLd={{
          '@type': 'Product',
          name: product.title,
          image: product.imageUrl,
          description: product.title,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      {/* Back button link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main product profile card */}
      <div className="grid gap-8 md:grid-cols-2 bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Left Side: image & badge info */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {product.marketplace}
            </span>
          </div>
        </div>

        {/* Right Side: price, rating details, buy link */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">
              {product.brand}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{product.title}</h2>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 px-2.5 py-0.5 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                {product.rating}
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {product.reviewsCount} verified reviews
              </span>
            </div>
          </div>

          <div className="border-t border-b py-5 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {product.discountPercentage}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Includes GST. Shipping rates calculated at checkout.
            </p>
          </div>

          <div className="space-y-2 text-sm font-semibold">
            <p>
              🕒 Delivery Speed:{' '}
              <span className="text-foreground">
                {product.deliveryTimeDays <= 0.05
                  ? 'Instant (15 mins)'
                  : `${product.deliveryTimeDays} days`}
              </span>
            </p>
            <p>
              🛡️ Warranty Details:{' '}
              <span className="text-foreground">{product.warrantyMonths} months warranty</span>
            </p>
            <p>
              🔄 Return Policy:{' '}
              <span className="text-foreground">
                {product.returnPolicyDays} days returns accepted
              </span>
            </p>
          </div>

          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 block text-sm"
          >
            Buy on {product.marketplace} Official Site
          </a>
        </div>
      </div>

      {/* Pricing & AI Prediction Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recharts history graph */}
        <div className="md:col-span-2 bg-card border rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Price Tracking History (6 Months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPriceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Price']} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI summary pros/cons & prediction alerts */}
        <div className="md:col-span-1 space-y-6">
          {/* Price prediction */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm bg-gradient-to-br from-indigo-500/5 to-pink-500/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <TrendingDown className="w-4 h-4 text-indigo-500" />
              AI Price Prediction
            </h3>
            <p className="text-sm font-semibold">
              We predict a price drop of{' '}
              <span className="text-green-600 dark:text-green-400">₹3,400 (approx 4.5%)</span>{' '}
              within 10 days.
            </p>
            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 rounded-xl flex gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <p className="text-xs text-indigo-800 dark:text-indigo-300 font-semibold">
                Recommendation: **Wait to Buy** to get the best value score.
              </p>
            </div>
          </div>

          {/* AI Fake Review Trust Score */}
          {reviewTrust && (
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Review Fraud Trust Analyzer
              </h3>
              <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">
                    Trust Score
                  </span>
                  <p className="text-lg font-extrabold text-emerald-600">
                    {reviewTrust.trustScore}%
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">
                    Fake Reviews
                  </span>
                  <p className="text-lg font-extrabold text-red-500">
                    {reviewTrust.fakePercentage}%
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-xs font-semibold">
                <p className="text-muted-foreground">
                  🟢 Key Positives: {reviewTrust.mostMentionedPositives?.slice(0, 2).join(', ')}
                </p>
                <p className="text-muted-foreground">
                  🔴 Key Negatives: {reviewTrust.mostMentionedNegatives?.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* AI Scam Seller Trust Score */}
          {sellerTrust && (
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                Merchant Trust Score
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-bold">Seller Trust Index</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 font-extrabold text-xs rounded-full">
                  {sellerTrust.sellerTrustScore}% Safe
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground pt-2 border-t">
                <p>🚚 Speed: {sellerTrust.deliverySuccessRate}%</p>
                <p>🔄 Return: {sellerTrust.returnRatePercentage}%</p>
              </div>
            </div>
          )}

          {/* Summarized review pros/cons */}
          {aiSummary && (
            <div className="bg-card border rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI Review Summary
              </h3>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <span className="text-green-600 dark:text-green-400 block font-extrabold">
                    🟢 Pros:
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    {aiSummary.pros?.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-red-500 block font-extrabold">🔴 Cons:</span>
                  <p className="text-muted-foreground mt-0.5">
                    {aiSummary.cons?.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications grid table layout */}
      <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Product Specifications</h3>
        <div className="grid gap-px bg-border rounded-2xl overflow-hidden sm:grid-cols-2 border">
          {Object.entries(product.specifications || {}).map(([key, val]: any) => (
            <div
              key={key}
              className="flex gap-4 p-4 bg-card text-sm font-semibold hover:bg-muted/10 transition-colors"
            >
              <span className="w-1/3 text-muted-foreground">{key}</span>
              <span className="w-2/3 text-foreground">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductDetailPage;
