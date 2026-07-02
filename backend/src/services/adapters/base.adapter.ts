import { MarketplaceAdapter } from './adapter.interface';
import { NormalizedProduct } from '../../types/marketplace';
import { getMockProducts } from './mock-data';

export class BaseMarketplaceAdapter implements MarketplaceAdapter {
  name: string;
  isEnabled: boolean;

  constructor(name: string, isEnabled: boolean = true) {
    this.name = name;
    this.isEnabled = isEnabled;
  }

  async search(query: string, _category?: string): Promise<NormalizedProduct[]> {
    if (!this.isEnabled) return [];

    // Simulate real network scraper delays (100ms - 300ms)
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 200) + 100));

    return getMockProducts(query, this.name);
  }

  async getDetails(productId: string): Promise<NormalizedProduct | null> {
    if (!this.isEnabled) return null;

    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 100) + 50));

    // Extract query details from slug structure
    const rawId = productId.includes('-') ? productId.split('-').slice(1).join('-') : productId;
    const items = getMockProducts(rawId, this.name);
    return items[0] || null;
  }
}
export default BaseMarketplaceAdapter;
