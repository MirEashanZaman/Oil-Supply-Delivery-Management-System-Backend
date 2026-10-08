import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class XssSanitizerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      try {
        this.sanitizeInPlace(req.body);
      } catch {}
    }
    if (req.query && typeof req.query === 'object') {
      try {
        this.sanitizeInPlace(req.query);
      } catch {}
    }
    if (req.params && typeof req.params === 'object') {
      try {
        this.sanitizeInPlace(req.params);
      } catch {}
    }
    next();
  }

  private sanitizeInPlace(obj: any): void {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase().includes('password')) continue;
      const val = obj[key];
      if (typeof val === 'string') {
        const sanitizer = (sanitizeHtml as any).default || sanitizeHtml;
        if (typeof sanitizer === 'function') {
          obj[key] = sanitizer(val, { allowedTags: [], allowedAttributes: {} });
        }
      } else if (typeof val === 'object' && val !== null) {
        this.sanitizeInPlace(val);
      }
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      const sanitizer = (sanitizeHtml as any).default || sanitizeHtml;
      return typeof sanitizer === 'function'
        ? sanitizer(obj, {
            allowedTags: [],
            allowedAttributes: {},
          })
        : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const cleaned: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        if (key.toLowerCase().includes('password')) {
          cleaned[key] = val;
        } else {
          cleaned[key] = this.sanitizeObject(val);
        }
      }
      return cleaned;
    }

    return obj;
  }
}
