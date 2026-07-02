import { NormalizedProduct } from '../../types/marketplace';

export interface MarketplaceAdapter {
  name: string;
  isEnabled: boolean;
  search(query: string, category?: string): Promise<NormalizedProduct[]>;
  getDetails(productId: string): Promise<NormalizedProduct | null>;
}
export default MarketplaceAdapter;
