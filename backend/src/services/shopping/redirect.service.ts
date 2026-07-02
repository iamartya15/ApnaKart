import { RedirectLog } from '../../models/redirect-log.model';

export class RedirectService {
  /**
   * Generates a tracked affiliate redirection link for a target product.
   * Logs details inside RedirectLog for funnel analysis.
   */
  static async generateAndLogRedirect(
    userId: string | undefined,
    productId: string,
    marketplace: string,
    originalUrl: string,
  ): Promise<string> {
    console.log(
      `[Redirect Service] Building affiliate redirection link for product ID: "${productId}" on [${marketplace}]`,
    );

    // Append standard affiliate subid trackers
    const urlObj = new URL(originalUrl || 'https://www.amazon.in');

    if (marketplace.toLowerCase() === 'amazon') {
      urlObj.searchParams.set('tag', 'apnakart-21');
    } else if (marketplace.toLowerCase() === 'flipkart') {
      urlObj.searchParams.set('affid', 'apnakart_aff');
    } else {
      urlObj.searchParams.set('utm_source', 'apnakart');
      urlObj.searchParams.set('utm_medium', 'affiliate');
    }

    const affiliateLink = urlObj.toString();

    // Log the click for analytics (simulating a referral commission revenue: ₹5 to ₹50)
    const mockRevenue = Math.round(5 + Math.random() * 45);

    try {
      await RedirectLog.create({
        user: userId || undefined,
        productId,
        marketplace,
        affiliateLink,
        clickRevenue: mockRevenue,
      });
    } catch (err) {
      console.warn('Failed to log affiliate click:', err);
    }

    return affiliateLink;
  }

  /**
   * Aggregate click stats for analytics funnel reviews.
   */
  static async getReferralAnalytics(): Promise<{
    totalClicks: number;
    totalRevenue: number;
    breakdown: Record<string, number>;
  }> {
    const logs = await RedirectLog.find({});
    const totalClicks = logs.length;
    let totalRevenue = 0;
    const breakdown: Record<string, number> = {};

    logs.forEach((log) => {
      totalRevenue += log.clickRevenue;
      breakdown[log.marketplace] = (breakdown[log.marketplace] || 0) + 1;
    });

    return {
      totalClicks,
      totalRevenue,
      breakdown,
    };
  }
}
export default RedirectService;
