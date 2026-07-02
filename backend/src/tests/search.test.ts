import { SearchService } from '../services/search.service';
import { CompareService } from '../services/compare.service';
import { adapterRegistry } from '../services/adapters/adapter.registry';

describe('ApnaKart Phase 3 Engine Tests', () => {
  it('should aggregate searches from active adapters concurrently', async () => {
    const query = 'iPhone';
    const products = await SearchService.search(query);

    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);

    // Check that results contain enabled marketplaces (like Amazon)
    const marketplaces = products.map((p) => p.marketplace);
    expect(marketplaces).toContain('Amazon');
    expect(marketplaces).toContain('Flipkart');

    // Disable Flipkart and verify it doesn't return
    adapterRegistry.toggleAdapter('Flipkart', false);
    const productsAfterDisable = await SearchService.search(query);
    const marketplacesAfter = productsAfterDisable.map((p) => p.marketplace);
    expect(marketplacesAfter).not.toContain('Flipkart');

    // Enable Flipkart back
    adapterRegistry.toggleAdapter('Flipkart', true);
  });

  it('should compute the Best Value Score for comparison matches', async () => {
    const productsToCompare = ['amazon-iphone15', 'flipkart-iphone15'];

    const matrix = await CompareService.compareProducts(productsToCompare);

    expect(matrix).toBeDefined();
    expect(matrix.cheapest).toBeDefined();
    expect(matrix.fastest).toBeDefined();
    expect(matrix.bestValue).toBeDefined();

    // Verify scores are numbers between 0 and 100
    expect(matrix.bestValueScore).toBeGreaterThan(0);
    expect(matrix.bestValueScore).toBeLessThanOrEqual(100);

    matrix.items.forEach((item) => {
      expect(item.valueScore).toBeDefined();
      expect(item.valueScore).toBeGreaterThan(0);
    });
  });
});
