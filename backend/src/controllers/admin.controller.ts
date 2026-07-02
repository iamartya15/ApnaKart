import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { AuditLog } from '../models/audit-log.model';
import { NotificationCampaign } from '../models/campaign.model';
import { redisClient } from '../config/redis';

export class AdminController {
  /**
   * Aggregates real-time business and system metrics.
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalUsers = await User.countDocuments({});
      const activeUsers = await User.countDocuments({ isBanned: false, isSuspended: false });

      const orders = await Order.find({});
      const totalOrders = orders.length;

      const totalRevenue = orders
        .filter((o) => o.orderStatus !== 'cancelled' && o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0);

      const conversionRate =
        totalUsers > 0 ? Math.round((totalOrders / totalUsers) * 100 * 10) / 10 : 0;

      // Mock analytics feeds
      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalRevenue,
          totalOrders,
          conversionRate,
          marketplaceClicksCount: 3820,
          aiRequestsCount: 1540,
          tokenUsageCount: 428900,
          paymentSuccessRatePercentage: 94.2,
          failedPaymentsCount: 12,
          refundsCount: 4,
          notificationsSentCount: 928,
          affiliateEarningsAmount: 18450,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves list of platform accounts.
   */
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Modifies account privileges or bans states, writing to AuditLog.
   */
  static async updateUserState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { role, adminRole, isSuspended, isBanned } = req.body;
      const adminEmail = (req as any).user?.email || 'admin@apnakart.com';

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const beforeState = {
        role: user.role,
        adminRole: user.adminRole,
        isSuspended: user.isSuspended,
        isBanned: user.isBanned,
      };

      if (role !== undefined) user.role = role;
      if (adminRole !== undefined) user.adminRole = adminRole;
      if (isSuspended !== undefined) user.isSuspended = isSuspended;
      if (isBanned !== undefined) user.isBanned = isBanned;

      await user.save();

      // Write Audit Log
      await AuditLog.create({
        adminEmail,
        action: `Modified user states for ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        changes: {
          before: beforeState,
          after: {
            role: user.role,
            adminRole: user.adminRole,
            isSuspended: user.isSuspended,
            isBanned: user.isBanned,
          },
        },
      });

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches admin actions log registry.
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
      res.status(200).json({ success: true, logs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves active server diagnostics for CPU, Memory, DB status.
   */
  static async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memory = process.memoryUsage();
      res.status(200).json({
        success: true,
        health: {
          mongodb: mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected',
          redis: redisClient.isOpen ? 'healthy' : 'unavailable',
          uptime: process.uptime(),
          memoryUsageMB: Math.round(memory.rss / 1024 / 1024),
          heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
          cpuUsageUser: process.cpuUsage().user,
          cpuUsageSystem: process.cpuUsage().system,
          bullMQStatus: 'healthy',
          socketConnectionsCount: 15, // mock tracking connections count
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns list of notification campaigns.
   */
  static async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await NotificationCampaign.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, campaigns });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates or schedules a notification campaign.
   */
  static async createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, templateName, channels, scheduledAt, variables } = req.body;
      const campaign = await NotificationCampaign.create({
        title,
        templateName,
        channels,
        scheduledAt,
        variables,
        status: 'scheduled',
      });
      res.status(201).json({ success: true, campaign });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Daily / Weekly sales summary CSV reports.
   */
  static async exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query; // 'daily', 'weekly', 'monthly'

      const orders = await Order.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 });

      let csv = 'OrderID,Customer,Amount,Status,Date\n';
      orders.forEach((o) => {
        csv += `${o._id},${o.user},${o.total},${o.orderStatus},${o.createdAt.toISOString()}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=apnakart_${type || 'sales'}_report.csv`,
      );
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}
export default AdminController;
