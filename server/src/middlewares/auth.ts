import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import status from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';
import { prisma } from '../lib/prisma';

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload & { id: string; email: string };

      // Check if trader exists
      const traderProfile = await prisma.traderProfile.findUnique({
        where: { id: decoded.id },
      });

      if (!traderProfile) {
        throw new AppError(status.UNAUTHORIZED, 'Trader profile not found');
      }

      // Attach user/trader info to request object
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppError(status.UNAUTHORIZED, 'Invalid or expired token'));
    }
  };
};

export default auth;
