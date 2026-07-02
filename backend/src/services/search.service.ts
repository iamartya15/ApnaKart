import { adapterRegistry } from './adapters/adapter.registry';
import { NormalizedProduct } from '../types/marketplace';
import { redisClient } from '../config/redis';

export class SearchService {
  private static trendingQueries = [
    'iPhone 15',
    'MacBook Air M3',
    'Running Shoes',
    'Amul Milk',
    'Bread',
  ];
  private static recentQueries: string[] = [];

  // Simple spell check dictionary
  private static spellDictionary: Record<string, string> = {
    iphne: 'iphone',
    ipon: 'iphone',
    macbok: 'macbook',
    shos: 'shoes',
    running: 'running',
    mlk: 'milk',
  };

  /**
   * Search across all active marketplace adapters concurrently.
   * Leverages Redis caching for rapid response times.
   */
  static async search(query: string, category?: string): Promise<NormalizedProduct[]> {
    const cleanQuery = this.correctSpelling(query.trim());

    // Log search history
    this.logQuery(cleanQuery);

    const cacheKey = `search:query:${cleanQuery.toLowerCase()}:${category || 'all'}`;

    // 1. Try fetching from Redis Cache
    if (redisClient.isOpen) {
      try {
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
          console.log(`[Cache Hit] Serving search results for: "${cleanQuery}"`);
          return JSON.parse(cachedResults);
        }
      } catch (cacheError) {
        console.warn('Redis read failed, querying adapters directly:', cacheError);
      }
    }

    console.log(`[Cache Miss] Querying active adapters concurrently for: "${cleanQuery}"`);
    const activeAdapters = adapterRegistry.getActiveAdapters();

    // 2. Query all active adapters in parallel
    const searchPromises = activeAdapters.map((adapter) =>
      adapter.search(cleanQuery, category).catch((err) => {
        console.error(`Adapter [${adapter.name}] search failed:`, err);
        return [] as NormalizedProduct[];
      }),
    );

    const promiseResults = await Promise.allSettled(searchPromises);
    const combinedProducts: NormalizedProduct[] = [];

    promiseResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        combinedProducts.push(...result.value);
      }
    });

    // Sort by price ascending as default order
    const sortedProducts = combinedProducts.sort((a, b) => a.price - b.price);

    // 3. Cache the results in Redis (expiry: 10 minutes)
    if (redisClient.isOpen && sortedProducts.length > 0) {
      try {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(sortedProducts));
      } catch (cacheError) {
        console.warn('Redis write failed:', cacheError);
      }
    }

    return sortedProducts;
  }

  /**
   * Autocomplete search suggestions.
   */
  static autocomplete(prefix: string): string[] {
    const term = prefix.toLowerCase().trim();
    if (!term) return [];

    const candidates = [
      'iphone 15',
      'iphone 15 pro',
      'samsung galaxy s24',
      'samsung s24 ultra',
      'macbook air m3',
      'macbook pro m3',
      'nike zoom shoes',
      'running shoes',
      'amul toned milk',
      'white sandwich bread',
      'grocery items',
    ];

    return candidates.filter((item) => item.includes(term));
  }

  /**
   * Spell checker logic using a simple distance dictionary map.
   */
  private static correctSpelling(query: string): string {
    const words = query.split(/\s+/);
    const corrected = words.map((word) => {
      const lower = word.toLowerCase();
      return this.spellDictionary[lower] || word;
    });
    return corrected.join(' ');
  }

  /**
   * Log the search query in local memory history array.
   */
  private static logQuery(query: string) {
    if (!this.recentQueries.includes(query)) {
      this.recentQueries.unshift(query);
      if (this.recentQueries.length > 10) {
        this.recentQueries.pop();
      }
    }
  }

  static getRecentQueries(): string[] {
    return this.recentQueries;
  }

  static getTrendingQueries(): string[] {
    return this.trendingQueries;
  }
}
export default SearchService;
