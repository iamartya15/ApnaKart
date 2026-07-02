import { adapterRegistry } from './adapters/adapter.registry';
import { NormalizedProduct, ComparisonMatrix } from '../types/marketplace';

export class CompareService {
  /**
   * Compares list of products by searching/resolving details and computing scores.
   */
  static async compareProducts(productIds: string[]): Promise<ComparisonMatrix> {
    const products: NormalizedProduct[] = [];

    // Resolve products from active adapters
    const resolvePromises = productIds.map(async (fullId) => {
      // Extract marketplace name from first slug element
      const parts = fullId.split('-');
      const marketplace = parts[0];
      // Re-capitalize first character (e.g. amazon -> Amazon)
      const capMarketplace = marketplace.charAt(0).toUpperCase() + marketplace.slice(1);

      const adapter = adapterRegistry.getAdapter(capMarketplace);
      if (adapter) {
        return adapter.getDetails(fullId).catch((err) => {
          console.error(`Failed to resolve details for product ${fullId}:`, err);
          return null;
        });
      }
      return null;
    });

    const resolved = await Promise.all(resolvePromises);
    resolved.forEach((item) => {
      if (item) products.push(item);
    });

    if (products.length === 0) {
      throw new Error('No valid products resolved for comparison.');
    }

    // Identify cheapest and fastest
    let cheapest = products[0];
    let fastest = products[0];

    products.forEach((prod) => {
      if (prod.price < cheapest.price) {
        cheapest = prod;
      }
      // Speed check (lower delivery time is faster)
      if (prod.deliveryTimeDays < fastest.deliveryTimeDays) {
        fastest = prod;
      }
    });

    // Compute Best Value Score for each product
    const itemsWithScores = products.map((prod) => {
      const score = this.calculateValueScore(prod, cheapest.price, fastest.deliveryTimeDays);
      return {
        ...prod,
        valueScore: Math.round(score * 10) / 10, // Round to 1 decimal place
      };
    });

    // Identify best value product
    let bestValueItem = itemsWithScores[0];
    itemsWithScores.forEach((item) => {
      if (item.valueScore > bestValueItem.valueScore) {
        bestValueItem = item;
      }
    });

    return {
      cheapest,
      fastest,
      bestValue: bestValueItem,
      bestValueScore: bestValueItem.valueScore,
      items: itemsWithScores,
    };
  }

  /**
   * Calculates a value score between 0 and 100 based on weighted metrics:
   * 1. Price (50%): lower is better. Normalized against cheapest price.
   * 2. Rating (20%): higher is better. Normalized against max rating (5.0).
   * 3. Delivery Speed (15%): faster is better. Normalized against fastest delivery.
   * 4. Cashback & Rewards (15%): higher cashback increases value.
   */
  private static calculateValueScore(
    product: NormalizedProduct,
    cheapestPrice: number,
    fastestDays: number,
  ): number {
    // 1. Price Score: (cheapestPrice / product.price) * 50
    const priceScore = (cheapestPrice / product.price) * 50;

    // 2. Rating Score: (product.rating / 5.0) * 20
    const ratingScore = (product.rating / 5.0) * 20;

    // 3. Delivery Score: 15% weight. If instant delivery (0.01 days), give full 15 points.
    // Else, score is: (fastestDays / product.deliveryTimeDays) * 15
    const deliveryScore =
      product.deliveryTimeDays <= 0.05 ? 15 : (fastestDays / product.deliveryTimeDays) * 15;

    // 4. Cashback & Rewards Score: 15% weight. Standardize: (cashbackPercentage / 10) * 15. Max at 15.
    const cashbackScore = Math.min(15, (product.cashbackPercentage / 10) * 15);

    return priceScore + ratingScore + deliveryScore + cashbackScore;
  }
}
export default CompareService;
