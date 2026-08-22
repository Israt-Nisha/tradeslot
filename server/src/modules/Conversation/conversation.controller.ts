import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { ConversationService } from './conversation.service';

const createOrGetConversation = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  if (req.user) {
    payload.traderId = req.user.id;
  }

  const result = await ConversationService.createOrGetConversation(payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Conversation initialized successfully',
    data: result,
  });
});

const getAllConversations = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await ConversationService.getAllConversations(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Conversations retrieved successfully',
    data: result,
  });
});

const getConversationById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await ConversationService.getConversationById(req.user.id, req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Conversation retrieved successfully',
    data: result,
  });
});

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const traderId = req.user?.id;
  const result = await ConversationService.createMessage(
    traderId,
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getConversationMessages = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await ConversationService.getConversationMessages(
    req.user.id,
    req.params.id as string
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Message history retrieved successfully',
    data: result,
  });
});

export const ConversationController = {
  createOrGetConversation,
  getAllConversations,
  getConversationById,
  createMessage,
  getConversationMessages,
};
