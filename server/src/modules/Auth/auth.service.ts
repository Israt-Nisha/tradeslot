import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import config from '../../config';
import { TTraderRegisterInput, TTraderLoginInput, TLoginResponse } from './auth.interface';

const registerTrader = async (payload: TTraderRegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(status.CONFLICT, 'A trader with this email already exists');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(payload.password, saltRounds);

  // Create user with TRADER role and its TraderProfile in a transaction
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      role: 'TRADER',
      phone: payload.phone || null,
      traderProfile: {
        create: {
          phone: payload.phone || null,
        },
      },
    },
    include: {
      traderProfile: true,
    },
  });

  if (!user.traderProfile) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to create trader profile');
  }

  return {
    id: user.traderProfile.id,
    name: user.name,
    email: user.email,
    phone: user.traderProfile.phone,
    stripeAccountId: user.traderProfile.stripeAccountId,
    stripeOnboarded: user.traderProfile.stripeOnboarded,
  };
};

const loginTrader = async (payload: TTraderLoginInput): Promise<TLoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      traderProfile: true,
    },
  });

  if (!user || user.role !== 'TRADER') {
    throw new AppError(status.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!user.password) {
    throw new AppError(status.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(status.UNAUTHORIZED, 'Invalid email or password');
  }

  let traderProfile = user.traderProfile;
  if (!traderProfile) {
    traderProfile = await prisma.traderProfile.create({
      data: {
        userId: user.id,
        phone: user.phone,
      },
    });
  }

  const jwtPayload = {
    id: traderProfile.id,
    email: user.email,
  };

  const token = jwt.sign(jwtPayload, config.jwt_access_secret as jwt.Secret, {
    expiresIn: config.jwt_access_expires_in,
  } as jwt.SignOptions);

  return {
    token,
    trader: {
      id: traderProfile.id,
      name: user.name || '',
      email: user.email || '',
      phone: traderProfile.phone,
      stripeAccountId: traderProfile.stripeAccountId,
      stripeOnboarded: traderProfile.stripeOnboarded,
    },
  };
};

const getTraderSession = async (traderProfileId: string) => {
  const traderProfile = await prisma.traderProfile.findUnique({
    where: { id: traderProfileId },
    include: {
      user: true,
    },
  });

  if (!traderProfile) {
    throw new AppError(status.NOT_FOUND, 'Trader profile not found');
  }

  return {
    id: traderProfile.id,
    userId: traderProfile.userId,
    name: traderProfile.user.name || '',
    email: traderProfile.user.email || '',
    phone: traderProfile.phone,
    businessName: traderProfile.businessName,
    stripeAccountId: traderProfile.stripeAccountId,
    stripeOnboarded: traderProfile.stripeOnboarded,
    defaultBookingFee: traderProfile.defaultBookingFee,
    defaultJobDurationMinutes: traderProfile.defaultJobDurationMinutes,
    defaultTravelBufferMinutes: traderProfile.defaultTravelBufferMinutes,
    isActive: traderProfile.isActive,
    createdAt: traderProfile.createdAt,
    updatedAt: traderProfile.updatedAt,
  };
};

const getAllTraders = async () => {
  const traders = await prisma.traderProfile.findMany({
    where: { isActive: true },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return traders.map((trader) => ({
    id: trader.id,
    businessName: trader.businessName || 'Independent Trader',
    name: trader.user.name || '',
    email: trader.user.email || '',
    phone: trader.phone,
    stripeAccountId: trader.stripeAccountId,
    stripeOnboarded: trader.stripeOnboarded,
  }));
};

export const AuthService = {
  registerTrader,
  loginTrader,
  getTraderSession,
  getAllTraders,
};