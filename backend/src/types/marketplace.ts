export interface NormalizedProduct {
  id: string; // SKU or unique identifier from the marketplace
  title: string;
  description: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewsCount: number;
  marketplace: string; // e.g. Amazon, Flipkart, Meesho, Myntra, Ajio, Croma, Reliance Digital, BigBasket, Blinkit, Zepto
  productUrl: string;
  deliveryTimeDays: number;
  returnPolicyDays: number;
  warrantyMonths: number;
  sellerName: string;
  sellerRating: number;
  couponsAvailable: string[];
  bankOffers: string[];
  emiOptionsAvailable: boolean;
  cashbackPercentage: number;
  specifications: Record<string, string>;
}

export interface ComparisonMatrix {
  cheapest: NormalizedProduct;
  fastest: NormalizedProduct;
  bestValue: NormalizedProduct;
  bestValueScore: number;
  items: Array<NormalizedProduct & { valueScore: number }>;
}
