import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.model';
import { InventoryService } from '../services/shopping/inventory.service';
import { PDFInvoiceService } from '../services/shopping/pdf-invoice.service';
import { redisClient } from '../config/redis';

export class OrderController {
  /**
   * Finalizes order placement.
   */
  static async placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idempotencyKey, shippingAddress, billingAddress, paymentMethod, paymentProvider } =
        req.body;
      const userId = (req as any).user?.id;

      if (
        !idempotencyKey ||
        !shippingAddress ||
        !billingAddress ||
        !paymentMethod ||
        !paymentProvider
      ) {
        res.status(400).json({ success: false, message: 'Missing order details.' });
        return;
      }

      // Check idempotency cache
      const idempotencyCacheKey = `idempotency:${idempotencyKey}`;
      if (redisClient.isOpen) {
        const cached = await redisClient.get(idempotencyCacheKey);
        if (cached) {
          res.status(200).json({ success: true, order: JSON.parse(cached) });
          return;
        }
      }

      // Fetch checkout details from cache
      const checkoutCacheKey = `checkout:summary:${idempotencyKey}`;
      let checkoutData: any;

      if (redisClient.isOpen) {
        const cachedSummary = await redisClient.get(checkoutCacheKey);
        if (cachedSummary) {
          checkoutData = JSON.parse(cachedSummary);
        }
      }

      if (!checkoutData) {
        res
          .status(400)
          .json({ success: false, message: 'Checkout session expired. Re-calculate prices.' });
        return;
      }

      // Create Order
      const order = await Order.create({
        user: userId,
        items: checkoutData.items,
        shippingAddress,
        billingAddress,
        deliverySlot: checkoutData.deliverySlot,
        couponCode: checkoutData.couponCode,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shippingCharges: checkoutData.shippingCharges,
        discount: checkoutData.discount,
        total: checkoutData.total,
        paymentMethod,
        paymentProvider,
        idempotencyKey,
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(),
            description: 'Order placed, awaiting payment authorization.',
          },
        ],
      });

      // Cache order under idempotency key
      if (redisClient.isOpen) {
        await redisClient.setEx(idempotencyCacheKey, 86400, JSON.stringify(order)); // cache for 1 day
      }

      res.status(201).json({
        success: true,
        order,
      });
    } catch (error: any) {
      // If duplicate key error, fetch existing order
      if (error.code === 11000) {
        const existing = await Order.findOne({ idempotencyKey: req.body.idempotencyKey });
        res.status(200).json({ success: true, order: existing });
        return;
      }
      next(error);
    }
  }

  // Cancel order
  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
        res
          .status(400)
          .json({ success: false, message: 'Order cannot be cancelled at this status.' });
        return;
      }

      order.orderStatus = 'cancelled';
      order.timeline.push({
        status: 'cancelled',
        timestamp: new Date(),
        description: 'Order cancelled by customer.',
      });
      await order.save();

      // Release inventory hold
      for (const item of order.items) {
        await InventoryService.releaseReservation(item.productId, item.quantity);
      }

      res.status(200).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }

  // Return request
  static async returnOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order || order.orderStatus !== 'delivered') {
        res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });
        return;
      }

      order.orderStatus = 'returned';
      order.paymentStatus = 'refunded';
      order.timeline.push({
        status: 'returned',
        timestamp: new Date(),
        description: 'Return request approved. Refund initiated.',
      });
      await order.save();

      res.status(200).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }

  // Get order history list
  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, orders });
    } catch (error) {
      next(error);
    }
  }

  // Get details & Invoice serve
  static async getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404).send('Invoice not found.');
        return;
      }

      const html = PDFInvoiceService.generateHTMLInvoice(order);
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }
}
export default OrderController;
