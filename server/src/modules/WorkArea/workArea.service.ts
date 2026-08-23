import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { TCreateWorkAreaInput, TUpdateWorkAreaInput } from './workArea.interface';

const createWorkArea = async (traderId: string, payload: TCreateWorkAreaInput) => {
  const workArea = await prisma.workArea.create({
    data: {
      traderId,
      areaName: payload.areaName,
      postcode: payload.postcode || null,
      date: new Date(payload.date),
    },
  });

  return workArea;
};

const getAllWorkAreas = async (traderId: string) => {
  const workAreas = await prisma.workArea.findMany({
    where: { traderId },
    orderBy: { date: 'asc' },
  });

  return workAreas;
};

const getWorkAreaById = async (traderId: string, id: string) => {
  const workArea = await prisma.workArea.findUnique({
    where: { id },
  });

  if (!workArea) {
    throw new AppError(status.NOT_FOUND, 'Work area not found');
  }

  if (workArea.traderId !== traderId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this work area');
  }

  return workArea;
};

const updateWorkArea = async (traderId: string, id: string, payload: TUpdateWorkAreaInput) => {
  // Check existence and ownership
  await getWorkAreaById(traderId, id);

  const updateData: any = {};
  if (payload.areaName !== undefined) updateData.areaName = payload.areaName;
  if (payload.postcode !== undefined) updateData.postcode = payload.postcode || null;
  if (payload.date !== undefined) updateData.date = new Date(payload.date);

  const updatedWorkArea = await prisma.workArea.update({
    where: { id },
    data: updateData,
  });

  return updatedWorkArea;
};

const deleteWorkArea = async (traderId: string, id: string) => {
  // Check existence and ownership
  await getWorkAreaById(traderId, id);

  await prisma.workArea.delete({
    where: { id },
  });

  return { id };
};

const getWorkAreaByDate = async (traderId: string, dateStr: string) => {
  const startOfDay = new Date(dateStr);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const workArea = await prisma.workArea.findFirst({
    where: {
      traderId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (!workArea) {
    throw new AppError(status.NOT_FOUND, `Work area not found for date ${dateStr}`);
  }

  return workArea;
};

const updateWorkAreaByDate = async (traderId: string, dateStr: string, payload: TUpdateWorkAreaInput) => {
  const workArea = await getWorkAreaByDate(traderId, dateStr);

  const updateData: any = {};
  if (payload.areaName !== undefined) updateData.areaName = payload.areaName;
  if (payload.postcode !== undefined) updateData.postcode = payload.postcode || null;
  if (payload.date !== undefined) updateData.date = new Date(payload.date);

  const updatedWorkArea = await prisma.workArea.update({
    where: { id: workArea.id },
    data: updateData,
  });

  return updatedWorkArea;
};

export const WorkAreaService = {
  createWorkArea,
  getAllWorkAreas,
  getWorkAreaById,
  updateWorkArea,
  deleteWorkArea,
  getWorkAreaByDate,
  updateWorkAreaByDate,
};

