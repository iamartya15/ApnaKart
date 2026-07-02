import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.model';
import { RedirectService } from '../services/shopping/redirect.service';
import { Cart } from '../models/cart.model';

export class AnalyticsController {
  /**
   * Returns complete checkout funnel and marketing conversion metrics.
   */
  static async getFunnelMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await Order.find({});
      const activeCarts = await Cart.countDocuments({ status: 'active' });

      const totalOrdersPlaced = orders.length;
      const completedOrders = orders.filter(
        (o) => o.orderStatus === 'delivered' || o.paymentStatus === 'paid',
      ).length;

      // Calculate conversion rate (completed orders vs total carts)
      const totalFunnels = activeCarts + totalOrdersPlaced;
      const conversionRate =
        totalFunnels > 0 ? Math.round((completedOrders / totalFunnels) * 100 * 10) / 10 : 0;

      // Abandonment calculation
      const abandonmentRate =
        totalFunnels > 0 ? Math.round((activeCarts / totalFunnels) * 100 * 10) / 10 : 0;

      // Affiliate marketing stats
      const affiliateStats = await RedirectService.getReferralAnalytics();

      res.status(200).json({
        success: true,
        metrics: {
          activeShoppingCartsCount: activeCarts,
          totalOrdersPlacedCount: totalOrdersPlaced,
          completedOrdersCount: completedOrders,
          conversionRatePercentage: conversionRate,
          abandonmentRatePercentage: abandonmentRate,
          affiliateClicksCount: affiliateStats.totalClicks,
          affiliateRevenueEarned: affiliateStats.totalRevenue,
          affiliateMarketplaceBreakdown: affiliateStats.breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default AnalyticsController;
