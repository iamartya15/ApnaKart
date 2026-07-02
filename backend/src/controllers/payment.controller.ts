import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.model';
import { Transaction } from '../models/transaction.model';
import { StripeProvider } from '../services/payments/stripe-provider';
import { RazorpayProvider } from '../services/payments/razorpay-provider';
import { InventoryService } from '../services/shopping/inventory.service';
import { NotificationService } from '../services/notifications/notification.service';
import { redisClient } from '../config/redis';

const stripeProvider = new StripeProvider();
const razorpayProvider = new RazorpayProvider();

export class PaymentController {
  /**
   * Initiates payment order session creation.
   */
  static async createPaymentSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderId, provider } = req.body;
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      if (order.paymentStatus === 'paid') {
        res.status(400).json({ success: false, message: 'Order is already paid.' });
        return;
      }

      // Check if inventory stock is reserved successfully
      for (const item of order.items) {
        const reserved = await InventoryService.reserveStock(item.productId, item.quantity);
        if (!reserved) {
          res
            .status(400)
            .json({ success: false, message: `Failed to reserve stock for item: ${item.title}` });
          return;
        }
      }

      let sessionDetails;
      if (provider === 'stripe') {
        sessionDetails = await stripeProvider.createSession(orderId, order.total);
      } else if (provider === 'razorpay') {
        sessionDetails = await razorpayProvider.createSession(orderId, order.total);
      } else if (provider === 'cod') {
        // Cash on delivery: complete order immediately
        order.paymentStatus = 'pending';
        order.orderStatus = 'processing';
        order.timeline.push({
          status: 'processing',
          timestamp: new Date(),
          description: 'Order confirmed under COD.',
        });
        await order.save();

        // Confirm reservation to subtract from warehouse reserves
        for (const item of order.items) {
          await InventoryService.confirmReservation(item.productId, item.quantity);
        }

        res.status(200).json({
          success: true,
          method: 'cod',
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?status=cod_placed&orderId=${orderId}`,
        });
        return;
      } else {
        res.status(400).json({ success: false, message: 'Unsupported payment provider.' });
        return;
      }

      // Save transaction log as pending
      await Transaction.create({
        orderId,
        paymentProvider: provider,
        amount: order.total,
        status: 'pending',
        providerPaymentId: sessionDetails.sessionId,
      });

      res.status(200).json({
        success: true,
        method: provider,
        paymentUrl: sessionDetails.paymentUrl,
        sessionId: sessionDetails.sessionId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle mock redirect validation success (simulates standard payment checkouts).
   */
  static async mockSuccessRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, provider } = req.query;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).send('Order not found.');
        return;
      }

      // Complete payment
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.transactionId = `mock_tx_${Math.random().toString(36).substring(7)}`;
      order.timeline.push({
        status: 'paid',
        timestamp: new Date(),
        description: `Payment verified via mock ${provider} portal.`,
      });
      await order.save();

      // Clean inventory hold records
      for (const item of order.items) {
        await InventoryService.confirmReservation(item.productId, item.quantity);
      }

      // Update Transaction status
      await Transaction.findOneAndUpdate(
        { orderId },
        { status: 'success', providerPaymentId: order.transactionId },
        { upsert: true },
      );

      // Dispatch Notifications
      const userEmail = (req as any).user?.email || 'customer@apnakart.com';
      await NotificationService.sendEmail({
        recipient: userEmail,
        templateName: 'ORDER_PLACED',
        variables: { orderId: String(order._id), amount: String(order.total) },
      });

      // Clear Cart Redis Cache
      const cacheKey = `cart:user:${order.user}`;
      if (redisClient.isOpen) {
        await redisClient.del(cacheKey);
      }

      // Redirect client back to profile order history
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?status=success&orderId=${orderId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook verification endpoint (supports Stripe & Razorpay triggers).
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-signature'] as string;
      const provider = req.params.provider;

      let verified = false;
      if (provider === 'stripe') {
        verified = await stripeProvider.verifyWebhookSignature(req.body, signature);
      } else if (provider === 'razorpay') {
        verified = await razorpayProvider.verifyWebhookSignature(req.body, signature);
      }

      if (!verified) {
        res.status(400).json({ success: false, message: 'Webhook signature verification failed.' });
        return;
      }

      // Complete transactions updates
      res.status(200).json({ success: true, message: 'Webhook processed.' });
    } catch (error) {
      next(error);
    }
  }
}
export default PaymentController;
