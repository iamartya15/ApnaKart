import { Inventory } from '../../models/inventory.model';
import { NotificationService } from '../notifications/notification.service';

export class InventoryService {
  /**
   * Checks if requested quantity is available in stock.
   * Auto creates mock inventory record if missing.
   */
  static async checkStock(productId: string, quantity: number): Promise<boolean> {
    let inv = await Inventory.findOne({ productId });

    // Auto-seed mock stock if not present (default: 50 items)
    if (!inv) {
      inv = await Inventory.create({
        productId,
        stockLevel: 50,
        reservedStock: 0,
        lowStockThreshold: 5,
        status: 'instock',
        warehouseId: 'WH-DELHI-01',
      });
    }

    return inv.stockLevel >= quantity && inv.status === 'instock';
  }

  /**
   * Reserves stock during checkout creation.
   * Decrements stockLevel and increments reservedStock.
   */
  static async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const inv = await Inventory.findOne({ productId });
    if (!inv || inv.stockLevel < quantity || inv.status === 'outofstock') {
      return false;
    }

    inv.stockLevel -= quantity;
    inv.reservedStock += quantity;

    if (inv.stockLevel <= 0) {
      inv.status = 'outofstock';
    }

    await inv.save();

    // Check for low stock alerts
    if (inv.stockLevel <= inv.lowStockThreshold) {
      console.log(
        `[Inventory Warning] Low stock for product ${productId}. Current level: ${inv.stockLevel}`,
      );
      await NotificationService.sendEmail({
        recipient: 'warehouse-alerts@apnakart.com',
        templateName: 'LOW_STOCK_ALERT',
        variables: { productId, stockLevel: String(inv.stockLevel), warehouse: inv.warehouseId },
      });
    }

    return true;
  }

  /**
   * Confirms stock reservation (removes from reservedStock when paid).
   */
  static async confirmReservation(productId: string, quantity: number): Promise<void> {
    const inv = await Inventory.findOne({ productId });
    if (inv) {
      inv.reservedStock = Math.max(0, inv.reservedStock - quantity);
      await inv.save();
    }
  }

  /**
   * Releases stock reservation (adds back to stockLevel if payment fails or order cancelled).
   */
  static async releaseReservation(productId: string, quantity: number): Promise<void> {
    const inv = await Inventory.findOne({ productId });
    if (inv) {
      inv.reservedStock = Math.max(0, inv.reservedStock - quantity);
      inv.stockLevel += quantity;
      if (inv.stockLevel > 0) {
        inv.status = 'instock';
      }
      await inv.save();
    }
  }
}
export default InventoryService;
