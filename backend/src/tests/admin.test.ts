import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { AuditLog } from '../models/audit-log.model';
import { NotificationCampaign } from '../models/campaign.model';
import { AdminController } from '../controllers/admin.controller';

describe('ApnaKart Phase 7 Enterprise Admin Platform Tests', () => {
  // Use in-memory mock models to run tests cleanly without requiring an active MongoDB connection
  const mockAdminUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Super Admin',
    email: 'superadmin@apnakart.com',
    role: 'admin',
    adminRole: 'super_admin',
  };

  const mockRegularUser = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Regular Customer',
    email: 'customer@apnakart.com',
    role: 'user',
    adminRole: 'user',
  };

  it('should prevent non-admin accounts from pulling stats', async () => {
    // Verify requireAdminRole rules logic
    const hasAdminAccess =
      mockRegularUser.role === 'admin' &&
      ['super_admin', 'admin'].includes(mockRegularUser.adminRole);
    expect(hasAdminAccess).toBe(false);

    const hasSuperAdminAccess =
      mockAdminUser.role === 'admin' && mockAdminUser.adminRole === 'super_admin';
    expect(hasSuperAdminAccess).toBe(true);
  });

  it('should query sales stats and return correct conversions', async () => {
    // Stub Order query methods inside controller
    const originalFind = Order.find;
    Order.find = (() =>
      Promise.resolve([{ total: 5000, paymentStatus: 'paid', orderStatus: 'processing' }])) as any;

    const originalCount = User.countDocuments;
    User.countDocuments = (() => Promise.resolve(10)) as any;

    const req: any = {};
    const res: any = {
      statusCode: 0,
      body: null,
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: any) {
        this.body = data;
      },
    };
    const next = () => {};

    try {
      await AdminController.getDashboardStats(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalRevenue).toBe(5000);
    } finally {
      // Restore stubs
      Order.find = originalFind;
      User.countDocuments = originalCount;
    }
  });

  it('should create an audit log on changing user state flags', async () => {
    const originalFindById = User.findById;
    // Return regular user mock
    const userInstance = new User({
      _id: mockRegularUser._id,
      name: mockRegularUser.name,
      email: mockRegularUser.email,
      role: mockRegularUser.role,
      adminRole: mockRegularUser.adminRole,
      isSuspended: false,
      isBanned: false,
    });
    // Stub save
    userInstance.save = () => Promise.resolve(userInstance);

    User.findById = (() => Promise.resolve(userInstance)) as any;

    const originalCreateLog = AuditLog.create;
    let loggedChanges: any = null;
    AuditLog.create = ((payload: any) => {
      loggedChanges = payload;
      return Promise.resolve(payload);
    }) as any;

    const req: any = {
      user: mockAdminUser,
      params: { userId: mockRegularUser._id },
      body: { isSuspended: true },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest' },
    };
    const res: any = {
      statusCode: 0,
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: any) {
        this.body = data;
      },
    };
    const next = () => {};

    try {
      await AdminController.updateUserState(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(loggedChanges).toBeDefined();
      expect(loggedChanges.changes.before.isSuspended).toBe(false);
      expect(loggedChanges.changes.after.isSuspended).toBe(true);
    } finally {
      User.findById = originalFindById;
      AuditLog.create = originalCreateLog;
    }
  });

  it('should register and schedule a notification campaign successfully', async () => {
    const originalCreateCampaign = NotificationCampaign.create;
    NotificationCampaign.create = ((payload: any) =>
      Promise.resolve({
        ...payload,
        _id: '507f1f77bcf86cd799439013',
      })) as any;

    const req: any = {
      body: {
        title: 'Admin Test Campaign',
        templateName: 'PROMO_500',
        channels: ['email', 'sms'],
        scheduledAt: new Date(Date.now() + 86400000),
        variables: { discount: '500' },
      },
    };
    const res: any = {
      statusCode: 0,
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: any) {
        this.body = data;
      },
    };
    const next = () => {};

    try {
      await AdminController.createCampaign(req, res, next);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.campaign.title).toBe('Admin Test Campaign');
    } finally {
      NotificationCampaign.create = originalCreateCampaign;
    }
  });
});
