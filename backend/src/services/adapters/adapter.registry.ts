import { BaseMarketplaceAdapter } from './base.adapter';
import { MarketplaceAdapter } from './adapter.interface';

class AdapterRegistry {
  private adapters: Map<string, MarketplaceAdapter> = new Map();

  constructor() {
    // Register all default marketplace adapters with initial enabled flags
    const marketplaces = [
      'Amazon',
      'Flipkart',
      'Meesho',
      'Myntra',
      'Ajio',
      'Croma',
      'Reliance Digital',
      'Snapdeal',
      'JioMart',
      'BigBasket',
      'Blinkit',
      'Zepto',
    ];

    marketplaces.forEach((name) => {
      // Defaulting Myntra and Snapdeal to disabled to demonstrate admin toggles!
      const isEnabled = !['Myntra', 'Snapdeal'].includes(name);
      this.adapters.set(name, new BaseMarketplaceAdapter(name, isEnabled));
    });
  }

  /**
   * Retrieves all registered adapters.
   */
  getAllAdapters(): MarketplaceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Retrieves all enabled/active adapters for search queries.
   */
  getActiveAdapters(): MarketplaceAdapter[] {
    return Array.from(this.adapters.values()).filter((adapter) => adapter.isEnabled);
  }

  /**
   * Retrieves a specific adapter by marketplace name.
   */
  getAdapter(name: string): MarketplaceAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Dynamically toggles an adapter's operational status.
   */
  toggleAdapter(name: string, isEnabled: boolean): boolean {
    const adapter = this.adapters.get(name);
    if (adapter) {
      adapter.isEnabled = isEnabled;
      return true;
    }
    return false;
  }
}

/*
 * TODO [Future Marketplace Integration Strategy]:
 * For production deployment with official integrations:
 * 1. Implement specific adapters extending BaseMarketplaceAdapter or implementing MarketplaceAdapter.
 * 2. E.g. For Amazon: Connect via Amazon PA-API (Product Advertising API) or Seller Partner API (SP-API)
 *    using official SDKs and OAuth processes.
 * 3. Add credentials (Client ID, SP-API tokens) inside backend/.env
 * 4. Replace BaseMarketplaceAdapter for 'Amazon' with the new AmazonPAAPIAdapter instance in registry.
 */

export const adapterRegistry = new AdapterRegistry();
export default adapterRegistry;
