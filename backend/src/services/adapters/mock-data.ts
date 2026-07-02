import { NormalizedProduct } from '../../types/marketplace';

// Pre-defined products with realistic details for standard search matches
export const getMockProducts = (query: string, marketplace: string): NormalizedProduct[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: NormalizedProduct[] = [];

  const createItem = (
    id: string,
    title: string,
    brand: string,
    category: string,
    basePrice: number,
    specs: Record<string, string>,
    desc: string = '',
  ): NormalizedProduct => {
    // Introduce variation per marketplace
    let priceMultiplier = 1.0;
    let deliveryDays = 3;
    let cashback = 2;
    let rating = 4.3;
    let reviewsCount = 100;
    let returnDays = 7;
    let warranty = 12;

    switch (marketplace) {
      case 'Amazon':
        priceMultiplier = 0.97; // Generally cheapest
        deliveryDays = 2;
        cashback = 5; // Amazon Pay ICICI card
        rating = 4.5;
        reviewsCount = 1500;
        break;
      case 'Flipkart':
        priceMultiplier = 0.99;
        deliveryDays = 1; // Fastest standard delivery
        cashback = 5; // Flipkart Axis Card
        rating = 4.4;
        reviewsCount = 1200;
        break;
      case 'Croma':
        priceMultiplier = 1.02;
        deliveryDays = 3;
        warranty = 24; // Extended warranty
        rating = 4.2;
        reviewsCount = 300;
        break;
      case 'Reliance Digital':
        priceMultiplier = 1.01;
        deliveryDays = 2;
        cashback = 10; // High bank cashback
        rating = 4.3;
        reviewsCount = 400;
        break;
      case 'Blinkit':
      case 'Zepto':
      case 'Blinkit / Zepto':
        priceMultiplier = 1.05; // Convenience premium
        deliveryDays = 0.01; // Instant (15 mins)
        returnDays = 0; // No return on grocery
        rating = 4.6;
        reviewsCount = 800;
        break;
      case 'Meesho':
        priceMultiplier = 0.88; // Lower tier budget
        deliveryDays = 5;
        rating = 3.9;
        reviewsCount = 600;
        break;
    }

    const price = Math.round(basePrice * priceMultiplier);
    const originalPrice = Math.round(price * 1.2);
    const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);

    return {
      id: `${marketplace.toLowerCase()}-${id}`,
      title: `${title} (${marketplace})`,
      description:
        desc || `${title} by ${brand}. High-quality product available on ${marketplace}.`,
      brand,
      category,
      imageUrl: getMockImageUrl(category),
      price,
      originalPrice,
      discountPercentage,
      rating,
      reviewsCount,
      marketplace,
      productUrl: `https://www.${marketplace.toLowerCase().replace(/\s+/g, '')}.com/dp/${id}`,
      deliveryTimeDays: deliveryDays,
      returnPolicyDays: returnDays,
      warrantyMonths: warranty,
      sellerName: `${brand} Retail Solutions`,
      sellerRating: 4.4,
      couponsAvailable: price > 50000 ? ['FLAT5000', 'SUPERKART'] : ['KART100'],
      bankOffers: [
        '5% Unlimited Cashback on co-branded cards',
        'Flat ₹1,500 off on HDFC Credit Card EMI transactions',
      ],
      emiOptionsAvailable: price > 10000,
      cashbackPercentage: cashback,
      specifications: specs,
    };
  };

  // 1. Mobile Phone Matches
  if (normalizedQuery.includes('iphone') || normalizedQuery.includes('apple')) {
    results.push(
      createItem('iphone15', 'Apple iPhone 15 (128GB, Black)', 'Apple', 'Electronics', 79900, {
        Display: '6.1-inch Super Retina XDR',
        Processor: 'A16 Bionic chip',
        Camera: '48MP Main + 12MP Ultra Wide',
        Storage: '128 GB',
        OS: 'iOS 17',
      }),
    );
  } else if (
    normalizedQuery.includes('samsung') ||
    normalizedQuery.includes('galaxy') ||
    normalizedQuery.includes('s24')
  ) {
    results.push(
      createItem('galaxys24', 'Samsung Galaxy S24 (256GB, Gray)', 'Samsung', 'Electronics', 74999, {
        Display: '6.2-inch Dynamic AMOLED 2X',
        Processor: 'Exynos 2400',
        Camera: '50MP + 10MP + 12MP',
        Storage: '256 GB',
        OS: 'Android 14',
      }),
    );
  }

  // 2. Laptops
  else if (normalizedQuery.includes('macbook') || normalizedQuery.includes('laptop')) {
    results.push(
      createItem(
        'macbookm3',
        'Apple MacBook Air M3 (13-inch, 8GB/256GB)',
        'Apple',
        'Electronics',
        114900,
        {
          Display: '13.6-inch Liquid Retina',
          Processor: 'Apple M3 Chip',
          RAM: '8 GB',
          Storage: '256 GB SSD',
          OS: 'macOS Sonoma',
        },
      ),
    );
  }

  // 3. Fashion
  else if (
    normalizedQuery.includes('shoes') ||
    normalizedQuery.includes('nike') ||
    normalizedQuery.includes('running')
  ) {
    results.push(
      createItem('nikerun', 'Nike Air Zoom Running Shoes', 'Nike', 'Fashion', 8995, {
        OuterMaterial: 'Mesh',
        Closure: 'Lace-Up',
        Sole: 'Rubber',
        Weight: '280g',
      }),
    );
  }

  // 4. Groceries
  else if (
    normalizedQuery.includes('milk') ||
    normalizedQuery.includes('bread') ||
    normalizedQuery.includes('grocery')
  ) {
    results.push(
      createItem('milkpack', 'Amul Taaza Toned Milk (1L)', 'Amul', 'Grocery', 66, {
        Type: 'Toned Milk',
        Volume: '1 Litre',
        ShelfLife: '120 days',
      }),
    );
  }

  // General fallback for all queries so search never returns empty!
  if (results.length === 0) {
    const formattedTitle = query.charAt(0).toUpperCase() + query.slice(1);
    results.push(
      createItem(
        'generic-item',
        `${formattedTitle} Premium Edition`,
        'PremiumBrand',
        'General',
        1500,
        {
          Quality: 'High-grade verified',
          Standard: 'Certified export quality',
        },
      ),
    );
  }

  return results;
};

// Generates placeholder images based on categories
const getMockImageUrl = (category: string): string => {
  switch (category) {
    case 'Electronics':
      return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60';
    case 'Fashion':
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60';
    case 'Grocery':
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
    default:
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
  }
};
