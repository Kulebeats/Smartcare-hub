import { Request, Response, NextFunction } from 'express';
import escapeHtml from 'escape-html';

interface CleanableObject {
  [key: string]: any;
}

export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  
  // Remove HTML tags and escape special characters
  return escapeHtml(str.replace(/<[^>]*>?/gm, '').trim());
};

export const sanitizeObject = (obj: CleanableObject): CleanableObject => {
  const cleaned: CleanableObject = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = Array.isArray(value) 
        ? value.map(item => typeof item === 'string' ? sanitizeString(item) : item)
        : sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

export const xssClean = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as CleanableObject);
    }
    
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  };
};