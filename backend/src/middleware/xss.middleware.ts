import { Request, Response, NextFunction } from 'express';

// Simple XSS sanitizer replacing <script> tags or converting brackets
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove scripts
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .trim();
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

export const xssClean = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

export default xssClean;
