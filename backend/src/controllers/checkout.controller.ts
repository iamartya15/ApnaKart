import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/coupon.model';
import { Order } from '../models/order.model';
import { InventoryService } from '../services/shopping/inventory.service';
import { redisClient } from '../config/redis';

export class CheckoutController {
  /**
   * Prepares and computes checkout details.
   * Enforces stock checking, idempotency keys, and coupon validations.
   */
  static async computeCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, deliverySlot, couponCode, idempotencyKey } = req.body;
      const userId = (req as any).user?.id;

      if (!items || items.length === 0 || !deliverySlot || !idempotencyKey) {
        res.status(400).json({ success: false, message: 'Missing required checkout parameters.' });
        return;
      }

      // 1. Enforce Idempotency check to prevent duplicate order placements
      if (redisClient.isOpen) {
        const cachedOrder = await redisClient.get(`idempotency:${idempotencyKey}`);
        if (cachedOrder) {
          console.log(`[Idempotency Hit] Returning cached checkout for key: ${idempotencyKey}`);
          res.status(200).json({ success: true, cached: true, order: JSON.parse(cachedOrder) });
          return;
        }
      }

      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        res.status(200).json({ success: true, cached: true, order: existingOrder });
        return;
      }

      // 2. Validate Stock Availability
      for (const item of items) {
        const available = await InventoryService.checkStock(item.productId, item.quantity);
        if (!available) {
          res.status(400).json({
            success: false,
            message: `Requested quantity for product ${item.title} is currently unavailable.`,
          });
          return;
        }
      }

      // 3. Compute pricing (18% standard GST tax)
      let subtotal = 0;
      items.forEach((item: any) => {
        subtotal += item.price * item.quantity;
      });

      const taxRate = 0.18;
      const tax = Math.round(subtotal * taxRate * 100) / 100;

      // Standard shipping charge: ₹100 if subtotal < ₹2000, else free
      const shippingCharges = subtotal < 2000 ? 100 : 0;

      // 4. Coupon Code discount check
      let discount = 0;
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (coupon && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'flat') {
            discount = coupon.value;
          } else {
            discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
          }
        }
      }

      const total = Math.max(0, subtotal + tax + shippingCharges - discount);

      const checkoutSummary = {
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
        deliverySlot,
        items,
        couponCode,
        idempotencyKey,
      };

      // Set checkout cache in Redis (expires in 30 minutes)
      if (redisClient.isOpen) {
        await redisClient.setEx(
          `checkout:summary:${idempotencyKey}`,
          1800,
          JSON.stringify(checkoutSummary),
        );
      }

      res.status(200).json({
        success: true,
        ...checkoutSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  // Pre-seed mock coupons helper
  static async seedCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mockCoupons = [
        {
          code: 'KART500',
          discountType: 'flat',
          value: 500,
          minOrderAmount: 2000,
          expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        },
        {
          code: 'SUPER10',
          discountType: 'percentage',
          value: 10,
          minOrderAmount: 1000,
          expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        },
      ];

      for (const coup of mockCoupons) {
        await Coupon.findOneAndUpdate({ code: coup.code }, coup, { upsert: true });
      }

      res.status(200).json({ success: true, message: 'Mock coupons seeded.' });
    } catch (error) {
      next(error);
    }
  }
}
export default CheckoutController;
