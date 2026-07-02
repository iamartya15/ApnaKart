import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User, IUser } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authorization token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User session no longer valid' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token',
      error: error.message,
    });
  }
};

export const requireRole = (roles: Array<'user' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this action',
      });
      return;
    }

    next();
  };
};

export const requireAdminRole = (adminRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(401).json({ success: false, message: 'Admin authentication required.' });
      return;
    }
    const userRole = req.user.adminRole || 'user';
    if (!adminRoles.includes(userRole) && userRole !== 'super_admin') {
      res
        .status(403)
        .json({ success: false, message: 'Forbidden: Insufficient admin privileges.' });
      return;
    }
    next();
  };
};
