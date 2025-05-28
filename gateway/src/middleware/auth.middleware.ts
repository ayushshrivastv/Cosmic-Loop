import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, API_KEYS } from '../config';
import logger from '../utils/logger';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        role: string;
      };
      clientId?: string;
    }
  }
}

/**
 * Middleware to authenticate requests using API keys
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get API key from header
  const apiKey = req.header('X-API-Key');
  
  // Check if API key is provided
  if (!apiKey) {
    logger.warn('API key missing in request', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ 
      error: 'API key is required',
      message: 'Please provide a valid API key in the X-API-Key header'
    });
  }
  
  // Validate API key
  if (!API_KEYS.includes(apiKey)) {
    logger.warn('Invalid API key used', { 
      ip: req.ip, 
      path: req.path,
      partialKey: apiKey.substring(0, 4) + '...' 
    });
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  // Store client ID for logging/tracking
  req.clientId = apiKey.substring(0, 8); // Use part of the API key as a client identifier
  
  logger.debug('Request authenticated with API key', { 
    clientId: req.clientId,
    path: req.path
  });
  
  next();
};

/**
 * Middleware to authenticate requests using JWT
 */
export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Check if token is provided
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication token is required',
      message: 'Please provide a valid JWT token in the Authorization header'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user to request
    req.user = decoded as { id: string; name: string; role: string };
    
    next();
  } catch (error) {
    logger.warn('Invalid JWT token', { 
      ip: req.ip, 
      path: req.path,
      error: (error as Error).message
    });
    
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'The provided authentication token is not valid or has expired'
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param roles Array of allowed roles
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', { 
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'You do not have the required permissions to access this resource'
      });
    }
    
    next();
  };
};
