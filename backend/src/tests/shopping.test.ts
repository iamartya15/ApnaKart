import { Cart } from '../models/cart.model';
import { Inventory } from '../models/inventory.model';
import { Coupon } from '../models/coupon.model';
import { Order } from '../models/order.model';
import { CartController } from '../controllers/cart.controller';
import { InventoryService } from '../services/shopping/inventory.service';
import { PDFInvoiceService } from '../services/shopping/pdf-invoice.service';
import { RedirectService } from '../services/shopping/redirect.service';

describe('ApnaKart Phase 5 Shopping Flow Tests', () => {
  it('should reserve and release inventory stock correctly', async () => {
    const productId = 'amazon-iphone15';

    // Seed inventory stock
    await Inventory.findOneAndUpdate(
      { productId },
      {
        stockLevel: 20,
        reservedStock: 0,
        lowStockThreshold: 2,
        status: 'instock',
        warehouseId: 'WH-01',
      },
      { upsert: true },
    );

    // Verify stock availability
    const check1 = await InventoryService.checkStock(productId, 5);
    expect(check1).toBe(true);

    // Reserve 5 items
    const reserveSuccess = await InventoryService.reserveStock(productId, 5);
    expect(reserveSuccess).toBe(true);

    const invAfterReserve = await Inventory.findOne({ productId });
    expect(invAfterReserve?.stockLevel).toBe(15);
    expect(invAfterReserve?.reservedStock).toBe(5);

    // Release reservation
    await InventoryService.releaseReservation(productId, 5);
    const invAfterRelease = await Inventory.findOne({ productId });
    expect(invAfterRelease?.stockLevel).toBe(20);
    expect(invAfterRelease?.reservedStock).toBe(0);
  });

  it('should compile an HTML invoice layout matching order metrics', () => {
    const mockOrder = new Order({
      items: [
        {
          productId: 'p1',
          title: 'Product 1',
          price: 1000,
          quantity: 2,
          imageUrl: 'img',
          marketplace: 'Amazon',
        },
      ],
      shippingAddress: {
        fullName: 'John Doe',
        addressLine1: 'Delhi',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
        phone: '9999',
      },
      billingAddress: {
        fullName: 'John Doe',
        addressLine1: 'Delhi',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
        phone: '9999',
      },
      deliverySlot: 'Standard',
      subtotal: 2000,
      tax: 360,
      shippingCharges: 0,
      discount: 200,
      total: 2160,
      paymentMethod: 'card',
      paymentProvider: 'stripe',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      idempotencyKey: 'idemp-tx-1234',
    });

    const html = PDFInvoiceService.generateHTMLInvoice(mockOrder);

    expect(html).toContain('INV-');
    expect(html).toContain('John Doe');
    expect(html).toContain('₹2160');
    expect(html).toContain('Product 1 (Amazon)');
  });

  it('should generate affiliate redirection links and log clicks', async () => {
    const redirectUrl = await RedirectService.generateAndLogRedirect(
      undefined,
      'flipkart-sneakers',
      'Flipkart',
      'https://www.flipkart.com/shoes',
    );

    expect(redirectUrl).toContain('affid=apnakart_aff');

    const clicksAnalytics = await RedirectService.getReferralAnalytics();
    expect(clicksAnalytics.totalClicks).toBeGreaterThan(0);
    expect(clicksAnalytics.breakdown.Flipkart).toBeGreaterThan(0);
  });
});
