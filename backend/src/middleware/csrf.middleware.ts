import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const method = req.method;

  // Safe methods do not require CSRF validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    // Generate a new CSRF token and set it in a cookie
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Accessible by frontend to attach to headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    next();
    return;
  }

  // Validate CSRF token for state-changing requests
  const csrfHeader = req.headers['x-xsrf-token'];
  const csrfCookie = req.cookies ? req.cookies['XSRF-TOKEN'] : null;

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    res.status(403).json({
      success: false,
      message: 'CSRF token validation failed. Unauthorized request.',
    });
    return;
  }

  next();
};

export default csrfProtection;
