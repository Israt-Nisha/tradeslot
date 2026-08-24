var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express10 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// src/middlewares/notFound.ts
import httpStatus from "http-status";
var notFound = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found",
    error: {
      path: req.originalUrl,
      message: "API not found",
      statusCode: httpStatus.NOT_FOUND
    }
  });
};
var notFound_default = notFound;

// src/middlewares/globalErrorHandler.ts
import status3 from "http-status";
import z from "zod";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "supersecretkey123",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "30d",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_compilation",
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy_key_for_compilation",
  whatsapp_access_token: process.env.WHATSAPP_ACCESS_TOKEN || "",
  whatsapp_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  whatsapp_verify_token: process.env.WHATSAPP_VERIFY_TOKEN || "tradeslot_verify_token_123"
};

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/errors/handleZodError.ts
import status from "http-status";
var handleZodError = (err) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  TRADER\n  CUSTOMER\n  ADMIN\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nenum Channel {\n  WEB_CHAT\n  WHATSAPP\n}\n\nenum MessageDirection {\n  INBOUND\n  OUTBOUND\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCEEDED\n  FAILED\n  REFUNDED\n}\n\nmodel User {\n  id        String   @id @default(uuid())\n  name      String?\n  email     String?  @unique\n  phone     String?  @unique\n  password  String?\n  role      Role     @default(CUSTOMER)\n  isActive  Boolean  @default(true)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  traderProfile   TraderProfile?\n  customerProfile CustomerProfile?\n\n  @@map("users")\n}\n\nmodel TraderProfile {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone        String?\n  businessName String?\n\n  stripeAccountId String? @unique\n  stripeOnboarded Boolean @default(false)\n\n  defaultBookingFee          Decimal @default(50.00) @db.Decimal(10, 2)\n  defaultJobDurationMinutes  Int     @default(60)\n  defaultTravelBufferMinutes Int     @default(30)\n\n  isActive Boolean @default(true)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  workAreas     WorkArea[]\n  bookings      Booking[]\n  conversations Conversation[]\n  messages      Message[]\n\n  @@map("trader_profiles")\n}\n\nmodel CustomerProfile {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  name  String?\n  phone String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  bookings      Booking[]\n  conversations Conversation[]\n  messages      Message[]\n\n  @@map("customer_profiles")\n}\n\nmodel WorkArea {\n  id       String @id @default(uuid())\n  traderId String\n\n  areaName String\n  postcode String?\n  date     DateTime\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  trader   TraderProfile @relation(fields: [traderId], references: [id], onDelete: Cascade)\n  bookings Booking[]\n\n  @@index([traderId, date])\n  @@map("work_areas")\n}\n\nmodel Conversation {\n  id String @id @default(uuid())\n\n  channel    Channel\n  externalId String?\n\n  traderId   String\n  customerId String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  trader   TraderProfile    @relation(fields: [traderId], references: [id], onDelete: Restrict)\n  customer CustomerProfile? @relation(fields: [customerId], references: [id], onDelete: SetNull)\n\n  messages Message[]\n  bookings Booking[]\n\n  @@unique([traderId, channel, externalId])\n  @@index([traderId])\n  @@index([customerId])\n  @@index([channel])\n  @@map("conversations")\n}\n\nmodel Message {\n  id String @id @default(uuid())\n\n  conversationId String\n  bookingId      String?\n  traderId       String?\n  customerId     String?\n\n  channel   Channel\n  direction MessageDirection\n\n  senderId   String\n  content    String\n  sentAt     DateTime @default(now())\n  externalId String?  @unique\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  conversation Conversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n  booking      Booking?         @relation(fields: [bookingId], references: [id], onDelete: SetNull)\n  trader       TraderProfile?   @relation(fields: [traderId], references: [id], onDelete: SetNull)\n  customer     CustomerProfile? @relation(fields: [customerId], references: [id], onDelete: SetNull)\n\n  @@index([conversationId])\n  @@index([bookingId])\n  @@index([channel, senderId])\n  @@map("messages")\n}\n\nmodel Booking {\n  id String @id @default(uuid())\n\n  traderId       String\n  customerId     String?\n  workAreaId     String?\n  conversationId String?\n\n  scheduledStart DateTime\n  scheduledEnd   DateTime\n\n  status BookingStatus @default(PENDING)\n\n  jobAddress    String?\n  notes         String?\n  customerName  String?\n  customerPhone String?\n  customerEmail String?\n\n  jobDurationMinutes  Int @default(60)\n  travelBufferMinutes Int @default(30)\n\n  bookingFee Decimal @default(50.00) @db.Decimal(10, 2)\n  currency   String  @default("GBP")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  trader       TraderProfile    @relation(fields: [traderId], references: [id], onDelete: Restrict)\n  customer     CustomerProfile? @relation(fields: [customerId], references: [id], onDelete: SetNull)\n  workArea     WorkArea?        @relation(fields: [workAreaId], references: [id], onDelete: SetNull)\n  conversation Conversation?    @relation(fields: [conversationId], references: [id], onDelete: SetNull)\n\n  messages Message[]\n  payment  Payment?\n\n  @@index([traderId, scheduledStart])\n  @@index([traderId, scheduledEnd])\n  @@index([customerId])\n  @@index([conversationId])\n  @@map("bookings")\n}\n\nmodel Payment {\n  id String @id @default(uuid())\n\n  bookingId String @unique\n\n  amount         Decimal @db.Decimal(10, 2)\n  applicationFee Decimal @db.Decimal(10, 2)\n  currency       String  @default("GBP")\n\n  status PaymentStatus @default(PENDING)\n\n  stripePaymentIntentId String? @unique\n  stripeChargeId        String? @unique\n  stripeTransferId      String? @unique\n\n  paidAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n\n  @@index([status])\n  @@map("payments")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"traderProfile","kind":"object","type":"TraderProfile","relationName":"TraderProfileToUser"},{"name":"customerProfile","kind":"object","type":"CustomerProfile","relationName":"CustomerProfileToUser"}],"dbName":"users"},"TraderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"businessName","kind":"scalar","type":"String"},{"name":"stripeAccountId","kind":"scalar","type":"String"},{"name":"stripeOnboarded","kind":"scalar","type":"Boolean"},{"name":"defaultBookingFee","kind":"scalar","type":"Decimal"},{"name":"defaultJobDurationMinutes","kind":"scalar","type":"Int"},{"name":"defaultTravelBufferMinutes","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"TraderProfileToUser"},{"name":"workAreas","kind":"object","type":"WorkArea","relationName":"TraderProfileToWorkArea"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTraderProfile"},{"name":"conversations","kind":"object","type":"Conversation","relationName":"ConversationToTraderProfile"},{"name":"messages","kind":"object","type":"Message","relationName":"MessageToTraderProfile"}],"dbName":"trader_profiles"},"CustomerProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"CustomerProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCustomerProfile"},{"name":"conversations","kind":"object","type":"Conversation","relationName":"ConversationToCustomerProfile"},{"name":"messages","kind":"object","type":"Message","relationName":"CustomerProfileToMessage"}],"dbName":"customer_profiles"},"WorkArea":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"traderId","kind":"scalar","type":"String"},{"name":"areaName","kind":"scalar","type":"String"},{"name":"postcode","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"trader","kind":"object","type":"TraderProfile","relationName":"TraderProfileToWorkArea"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToWorkArea"}],"dbName":"work_areas"},"Conversation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"channel","kind":"enum","type":"Channel"},{"name":"externalId","kind":"scalar","type":"String"},{"name":"traderId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"trader","kind":"object","type":"TraderProfile","relationName":"ConversationToTraderProfile"},{"name":"customer","kind":"object","type":"CustomerProfile","relationName":"ConversationToCustomerProfile"},{"name":"messages","kind":"object","type":"Message","relationName":"ConversationToMessage"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToConversation"}],"dbName":"conversations"},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"traderId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"channel","kind":"enum","type":"Channel"},{"name":"direction","kind":"enum","type":"MessageDirection"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"sentAt","kind":"scalar","type":"DateTime"},{"name":"externalId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"conversation","kind":"object","type":"Conversation","relationName":"ConversationToMessage"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToMessage"},{"name":"trader","kind":"object","type":"TraderProfile","relationName":"MessageToTraderProfile"},{"name":"customer","kind":"object","type":"CustomerProfile","relationName":"CustomerProfileToMessage"}],"dbName":"messages"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"traderId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"workAreaId","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"scheduledStart","kind":"scalar","type":"DateTime"},{"name":"scheduledEnd","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"jobAddress","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"customerName","kind":"scalar","type":"String"},{"name":"customerPhone","kind":"scalar","type":"String"},{"name":"customerEmail","kind":"scalar","type":"String"},{"name":"jobDurationMinutes","kind":"scalar","type":"Int"},{"name":"travelBufferMinutes","kind":"scalar","type":"Int"},{"name":"bookingFee","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"trader","kind":"object","type":"TraderProfile","relationName":"BookingToTraderProfile"},{"name":"customer","kind":"object","type":"CustomerProfile","relationName":"BookingToCustomerProfile"},{"name":"workArea","kind":"object","type":"WorkArea","relationName":"BookingToWorkArea"},{"name":"conversation","kind":"object","type":"Conversation","relationName":"BookingToConversation"},{"name":"messages","kind":"object","type":"Message","relationName":"BookingToMessage"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingToPayment"}],"dbName":"bookings"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"applicationFee","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeChargeId","kind":"scalar","type":"String"},{"name":"stripeTransferId","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToPayment"}],"dbName":"payments"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","user","orderBy","cursor","trader","bookings","customer","conversation","booking","messages","_count","conversations","workArea","payment","workAreas","traderProfile","customerProfile","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","TraderProfile.findUnique","TraderProfile.findUniqueOrThrow","TraderProfile.findFirst","TraderProfile.findFirstOrThrow","TraderProfile.findMany","TraderProfile.createOne","TraderProfile.createMany","TraderProfile.createManyAndReturn","TraderProfile.updateOne","TraderProfile.updateMany","TraderProfile.updateManyAndReturn","TraderProfile.upsertOne","TraderProfile.deleteOne","TraderProfile.deleteMany","_avg","_sum","TraderProfile.groupBy","TraderProfile.aggregate","CustomerProfile.findUnique","CustomerProfile.findUniqueOrThrow","CustomerProfile.findFirst","CustomerProfile.findFirstOrThrow","CustomerProfile.findMany","CustomerProfile.createOne","CustomerProfile.createMany","CustomerProfile.createManyAndReturn","CustomerProfile.updateOne","CustomerProfile.updateMany","CustomerProfile.updateManyAndReturn","CustomerProfile.upsertOne","CustomerProfile.deleteOne","CustomerProfile.deleteMany","CustomerProfile.groupBy","CustomerProfile.aggregate","WorkArea.findUnique","WorkArea.findUniqueOrThrow","WorkArea.findFirst","WorkArea.findFirstOrThrow","WorkArea.findMany","WorkArea.createOne","WorkArea.createMany","WorkArea.createManyAndReturn","WorkArea.updateOne","WorkArea.updateMany","WorkArea.updateManyAndReturn","WorkArea.upsertOne","WorkArea.deleteOne","WorkArea.deleteMany","WorkArea.groupBy","WorkArea.aggregate","Conversation.findUnique","Conversation.findUniqueOrThrow","Conversation.findFirst","Conversation.findFirstOrThrow","Conversation.findMany","Conversation.createOne","Conversation.createMany","Conversation.createManyAndReturn","Conversation.updateOne","Conversation.updateMany","Conversation.updateManyAndReturn","Conversation.upsertOne","Conversation.deleteOne","Conversation.deleteMany","Conversation.groupBy","Conversation.aggregate","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","Message.upsertOne","Message.deleteOne","Message.deleteMany","Message.groupBy","Message.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","Booking.groupBy","Booking.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","AND","OR","NOT","id","bookingId","amount","applicationFee","currency","PaymentStatus","status","stripePaymentIntentId","stripeChargeId","stripeTransferId","paidAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","traderId","customerId","workAreaId","conversationId","scheduledStart","scheduledEnd","BookingStatus","jobAddress","notes","customerName","customerPhone","customerEmail","jobDurationMinutes","travelBufferMinutes","bookingFee","Channel","channel","MessageDirection","direction","senderId","content","sentAt","externalId","areaName","postcode","date","userId","name","phone","every","some","none","businessName","stripeAccountId","stripeOnboarded","defaultBookingFee","defaultJobDurationMinutes","defaultTravelBufferMinutes","isActive","email","password","Role","role","traderId_channel_externalId","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "hAVMgAEODwAAuAIAIBAAALkCACCZAQAAtgIAMJoBAAAzABCbAQAAtgIAMJwBAQAAAAGnAUAAkQIAIagBQACRAgAhzwEBAKUCACHQAQEAAAAB2gEgAK8CACHbAQEAAAAB3AEBAKUCACHeAQAAtwLeASIBAAAAAQAgFAEAAKYCACAFAACnAgAgCQAAqQIAIAsAAKgCACAOAACxAgAgmQEAAK4CADCaAQAAAwAQmwEAAK4CADCcAQEAjgIAIacBQACRAgAhqAFAAJECACHOAQEAjgIAIdABAQClAgAh1AEBAKUCACHVAQEApQIAIdYBIACvAgAh1wEQAI0CACHYAQIAsAIAIdkBAgCwAgAh2gEgAK8CACEBAAAAAwAgDAQAAMECACAFAACnAgAgmQEAAMcCADCaAQAABQAQmwEAAMcCADCcAQEAjgIAIacBQACRAgAhqAFAAJECACG0AQEAjgIAIcsBAQCOAgAhzAEBAKUCACHNAUAAkQIAIQMEAACvBAAgBQAA4gMAIMwBAADIAgAgDAQAAMECACAFAACnAgAgmQEAAMcCADCaAQAABQAQmwEAAMcCADCcAQEAAAABpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhywEBAI4CACHMAQEApQIAIc0BQACRAgAhAwAAAAUAIAIAAAYAMAMAAAcAIBwEAADBAgAgBgAAuQIAIAcAAMUCACAJAACpAgAgDAAAxAIAIA0AAMYCACCZAQAAwgIAMJoBAAAJABCbAQAAwgIAMJwBAQCOAgAhoAEBAI4CACGiAQAAwwK7ASKnAUAAkQIAIagBQACRAgAhtAEBAI4CACG1AQEApQIAIbYBAQClAgAhtwEBAKUCACG4AUAAkQIAIbkBQACRAgAhuwEBAKUCACG8AQEApQIAIb0BAQClAgAhvgEBAKUCACG_AQEApQIAIcABAgCwAgAhwQECALACACHCARAAjQIAIQ4EAACvBAAgBgAAsAQAIAcAALEEACAJAADkAwAgDAAAsgQAIA0AALMEACC1AQAAyAIAILYBAADIAgAgtwEAAMgCACC7AQAAyAIAILwBAADIAgAgvQEAAMgCACC-AQAAyAIAIL8BAADIAgAgHAQAAMECACAGAAC5AgAgBwAAxQIAIAkAAKkCACAMAADEAgAgDQAAxgIAIJkBAADCAgAwmgEAAAkAEJsBAADCAgAwnAEBAAAAAaABAQCOAgAhogEAAMMCuwEipwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACG2AQEApQIAIbcBAQClAgAhuAFAAJECACG5AUAAkQIAIbsBAQClAgAhvAEBAKUCACG9AQEApQIAIb4BAQClAgAhvwEBAKUCACHAAQIAsAIAIcEBAgCwAgAhwgEQAI0CACEDAAAACQAgAgAACgAwAwAACwAgDQEAAKYCACAFAACnAgAgCQAAqQIAIAsAAKgCACCZAQAApAIAMJoBAAANABCbAQAApAIAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIc4BAQCOAgAhzwEBAKUCACHQAQEApQIAIQEAAAANACADAAAACQAgAgAACgAwAwAACwAgDgQAAMECACAFAACnAgAgBgAAuQIAIAkAAKkCACCZAQAAwAIAMJoBAAAQABCbAQAAwAIAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACHEAQAAuwLEASLKAQEApQIAIQYEAACvBAAgBQAA4gMAIAYAALAEACAJAADkAwAgtQEAAMgCACDKAQAAyAIAIA8EAADBAgAgBQAApwIAIAYAALkCACAJAACpAgAgmQEAAMACADCaAQAAEAAQmwEAAMACADCcAQEAAAABpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACHEAQAAuwLEASLKAQEApQIAId8BAAC_AgAgAwAAABAAIAIAABEAMAMAABIAIAEAAAANACAUBAAAuAIAIAYAALkCACAHAAC9AgAgCAAAvgIAIJkBAAC6AgAwmgEAABUAEJsBAAC6AgAwnAEBAI4CACGdAQEApQIAIacBQACRAgAhqAFAAJECACG0AQEApQIAIbUBAQClAgAhtwEBAI4CACHEAQAAuwLEASLGAQAAvALGASLHAQEAjgIAIcgBAQCOAgAhyQFAAJECACHKAQEApQIAIQgEAACvBAAgBgAAsAQAIAcAALEEACAIAADWAgAgnQEAAMgCACC0AQAAyAIAILUBAADIAgAgygEAAMgCACAUBAAAuAIAIAYAALkCACAHAAC9AgAgCAAAvgIAIJkBAAC6AgAwmgEAABUAEJsBAAC6AgAwnAEBAAAAAZ0BAQClAgAhpwFAAJECACGoAUAAkQIAIbQBAQClAgAhtQEBAKUCACG3AQEAjgIAIcQBAAC7AsQBIsYBAAC8AsYBIscBAQCOAgAhyAEBAI4CACHJAUAAkQIAIcoBAQAAAAEDAAAAFQAgAgAAFgAwAwAAFwAgAQAAAAkAIAEAAAADACABAAAADQAgAwAAAAkAIAIAAAoAMAMAAAsAIAEAAAAVACABAAAACQAgAwAAABUAIAIAABYAMAMAABcAIAEAAAAJACABAAAAEAAgAQAAABUAIAEAAAAFACABAAAAEAAgAwAAABUAIAIAABYAMAMAABcAIBAIAACSAgAgmQEAAIwCADCaAQAAJgAQmwEAAIwCADCcAQEAjgIAIZ0BAQCOAgAhngEQAI0CACGfARAAjQIAIaABAQCOAgAhogEAAI8CogEiowEBAKUCACGkAQEApQIAIaUBAQClAgAhpgFAAJACACGnAUAAkQIAIagBQACRAgAhAQAAACYAIAEAAAAVACABAAAACQAgAwAAAAkAIAIAAAoAMAMAAAsAIAMAAAAQACACAAARADADAAASACADAAAAFQAgAgAAFgAwAwAAFwAgAQAAAAUAIAEAAAAJACABAAAAEAAgAQAAABUAIAEAAAANACABAAAAAQAgDg8AALgCACAQAAC5AgAgmQEAALYCADCaAQAAMwAQmwEAALYCADCcAQEAjgIAIacBQACRAgAhqAFAAJECACHPAQEApQIAIdABAQClAgAh2gEgAK8CACHbAQEApQIAIdwBAQClAgAh3gEAALcC3gEiBg8AAK8EACAQAACwBAAgzwEAAMgCACDQAQAAyAIAINsBAADIAgAg3AEAAMgCACADAAAAMwAgAgAANAAwAwAAAQAgAwAAADMAIAIAADQAMAMAAAEAIAMAAAAzACACAAA0ADADAAABACALDwAArQQAIBAAAK4EACCcAQEAAAABpwFAAAAAAagBQAAAAAHPAQEAAAAB0AEBAAAAAdoBIAAAAAHbAQEAAAAB3AEBAAAAAd4BAAAA3gECARYAADgAIAmcAQEAAAABpwFAAAAAAagBQAAAAAHPAQEAAAAB0AEBAAAAAdoBIAAAAAHbAQEAAAAB3AEBAAAAAd4BAAAA3gECARYAADoAMAEWAAA6ADALDwAAoQQAIBAAAKIEACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHPAQEA0QIAIdABAQDRAgAh2gEgAOoDACHbAQEA0QIAIdwBAQDRAgAh3gEAAKAE3gEiAgAAAAEAIBYAAD0AIAmcAQEAzgIAIacBQADTAgAhqAFAANMCACHPAQEA0QIAIdABAQDRAgAh2gEgAOoDACHbAQEA0QIAIdwBAQDRAgAh3gEAAKAE3gEiAgAAADMAIBYAAD8AIAIAAAAzACAWAAA_ACADAAAAAQAgHQAAOAAgHgAAPQAgAQAAAAEAIAEAAAAzACAHCgAAnQQAICMAAJ8EACAkAACeBAAgzwEAAMgCACDQAQAAyAIAINsBAADIAgAg3AEAAMgCACAMmQEAALICADCaAQAARgAQmwEAALICADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACHPAQEA-wEAIdABAQD7AQAh2gEgAKsCACHbAQEA-wEAIdwBAQD7AQAh3gEAALMC3gEiAwAAADMAIAIAAEUAMCIAAEYAIAMAAAAzACACAAA0ADADAAABACAUAQAApgIAIAUAAKcCACAJAACpAgAgCwAAqAIAIA4AALECACCZAQAArgIAMJoBAAADABCbAQAArgIAMJwBAQAAAAGnAUAAkQIAIagBQACRAgAhzgEBAAAAAdABAQClAgAh1AEBAKUCACHVAQEAAAAB1gEgAK8CACHXARAAjQIAIdgBAgCwAgAh2QECALACACHaASAArwIAIQEAAABJACABAAAASQAgCAEAAOEDACAFAADiAwAgCQAA5AMAIAsAAOMDACAOAACcBAAg0AEAAMgCACDUAQAAyAIAINUBAADIAgAgAwAAAAMAIAIAAEwAMAMAAEkAIAMAAAADACACAABMADADAABJACADAAAAAwAgAgAATAAwAwAASQAgEQEAAJcEACAFAACZBAAgCQAAmwQAIAsAAJoEACAOAACYBAAgnAEBAAAAAacBQAAAAAGoAUAAAAABzgEBAAAAAdABAQAAAAHUAQEAAAAB1QEBAAAAAdYBIAAAAAHXARAAAAAB2AECAAAAAdkBAgAAAAHaASAAAAABARYAAFAAIAycAQEAAAABpwFAAAAAAagBQAAAAAHOAQEAAAAB0AEBAAAAAdQBAQAAAAHVAQEAAAAB1gEgAAAAAdcBEAAAAAHYAQIAAAAB2QECAAAAAdoBIAAAAAEBFgAAUgAwARYAAFIAMBEBAADrAwAgBQAA7QMAIAkAAO8DACALAADuAwAgDgAA7AMAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIc4BAQDOAgAh0AEBANECACHUAQEA0QIAIdUBAQDRAgAh1gEgAOoDACHXARAAzwIAIdgBAgDdAgAh2QECAN0CACHaASAA6gMAIQIAAABJACAWAABVACAMnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHQAQEA0QIAIdQBAQDRAgAh1QEBANECACHWASAA6gMAIdcBEADPAgAh2AECAN0CACHZAQIA3QIAIdoBIADqAwAhAgAAAAMAIBYAAFcAIAIAAAADACAWAABXACADAAAASQAgHQAAUAAgHgAAVQAgAQAAAEkAIAEAAAADACAICgAA5QMAICMAAOgDACAkAADnAwAgNQAA5gMAIDYAAOkDACDQAQAAyAIAINQBAADIAgAg1QEAAMgCACAPmQEAAKoCADCaAQAAXgAQmwEAAKoCADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACHOAQEA-AEAIdABAQD7AQAh1AEBAPsBACHVAQEA-wEAIdYBIACrAgAh1wEQAPkBACHYAQIAlQIAIdkBAgCVAgAh2gEgAKsCACEDAAAAAwAgAgAAXQAwIgAAXgAgAwAAAAMAIAIAAEwAMAMAAEkAIA0BAACmAgAgBQAApwIAIAkAAKkCACALAACoAgAgmQEAAKQCADCaAQAADQAQmwEAAKQCADCcAQEAAAABpwFAAJECACGoAUAAkQIAIc4BAQAAAAHPAQEApQIAIdABAQClAgAhAQAAAGEAIAEAAABhACAGAQAA4QMAIAUAAOIDACAJAADkAwAgCwAA4wMAIM8BAADIAgAg0AEAAMgCACADAAAADQAgAgAAZAAwAwAAYQAgAwAAAA0AIAIAAGQAMAMAAGEAIAMAAAANACACAABkADADAABhACAKAQAA3QMAIAUAAN4DACAJAADgAwAgCwAA3wMAIJwBAQAAAAGnAUAAAAABqAFAAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAQEWAABoACAGnAEBAAAAAacBQAAAAAGoAUAAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAABARYAAGoAMAEWAABqADAKAQAAuwMAIAUAALwDACAJAAC-AwAgCwAAvQMAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIc4BAQDOAgAhzwEBANECACHQAQEA0QIAIQIAAABhACAWAABtACAGnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHPAQEA0QIAIdABAQDRAgAhAgAAAA0AIBYAAG8AIAIAAAANACAWAABvACADAAAAYQAgHQAAaAAgHgAAbQAgAQAAAGEAIAEAAAANACAFCgAAuAMAICMAALoDACAkAAC5AwAgzwEAAMgCACDQAQAAyAIAIAmZAQAAowIAMJoBAAB2ABCbAQAAowIAMJwBAQD4AQAhpwFAAP0BACGoAUAA_QEAIc4BAQD4AQAhzwEBAPsBACHQAQEA-wEAIQMAAAANACACAAB1ADAiAAB2ACADAAAADQAgAgAAZAAwAwAAYQAgAQAAAAcAIAEAAAAHACADAAAABQAgAgAABgAwAwAABwAgAwAAAAUAIAIAAAYAMAMAAAcAIAMAAAAFACACAAAGADADAAAHACAJBAAAtgMAIAUAALcDACCcAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABywEBAAAAAcwBAQAAAAHNAUAAAAABARYAAH4AIAecAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABywEBAAAAAcwBAQAAAAHNAUAAAAABARYAAIABADABFgAAgAEAMAkEAACrAwAgBQAArAMAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIbQBAQDOAgAhywEBAM4CACHMAQEA0QIAIc0BQADTAgAhAgAAAAcAIBYAAIMBACAHnAEBAM4CACGnAUAA0wIAIagBQADTAgAhtAEBAM4CACHLAQEAzgIAIcwBAQDRAgAhzQFAANMCACECAAAABQAgFgAAhQEAIAIAAAAFACAWAACFAQAgAwAAAAcAIB0AAH4AIB4AAIMBACABAAAABwAgAQAAAAUAIAQKAACoAwAgIwAAqgMAICQAAKkDACDMAQAAyAIAIAqZAQAAogIAMJoBAACMAQAQmwEAAKICADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACG0AQEA-AEAIcsBAQD4AQAhzAEBAPsBACHNAUAA_QEAIQMAAAAFACACAACLAQAwIgAAjAEAIAMAAAAFACACAAAGADADAAAHACABAAAAEgAgAQAAABIAIAMAAAAQACACAAARADADAAASACADAAAAEAAgAgAAEQAwAwAAEgAgAwAAABAAIAIAABEAMAMAABIAIAsEAACkAwAgBQAApwMAIAYAAKUDACAJAACmAwAgnAEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAHEAQAAAMQBAsoBAQAAAAEBFgAAlAEAIAecAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABtQEBAAAAAcQBAAAAxAECygEBAAAAAQEWAACWAQAwARYAAJYBADABAAAADQAgCwQAAIsDACAFAACOAwAgBgAAjAMAIAkAAI0DACCcAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhxAEAAPMCxAEiygEBANECACECAAAAEgAgFgAAmgEAIAecAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhxAEAAPMCxAEiygEBANECACECAAAAEAAgFgAAnAEAIAIAAAAQACAWAACcAQAgAQAAAA0AIAMAAAASACAdAACUAQAgHgAAmgEAIAEAAAASACABAAAAEAAgBQoAAIgDACAjAACKAwAgJAAAiQMAILUBAADIAgAgygEAAMgCACAKmQEAAKECADCaAQAApAEAEJsBAAChAgAwnAEBAPgBACGnAUAA_QEAIagBQAD9AQAhtAEBAPgBACG1AQEA-wEAIcQBAACbAsQBIsoBAQD7AQAhAwAAABAAIAIAAKMBADAiAACkAQAgAwAAABAAIAIAABEAMAMAABIAIAEAAAAXACABAAAAFwAgAwAAABUAIAIAABYAMAMAABcAIAMAAAAVACACAAAWADADAAAXACADAAAAFQAgAgAAFgAwAwAAFwAgEQQAAPsCACAGAAD8AgAgBwAA-gIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG3AQEAAAABxAEAAADEAQLGAQAAAMYBAscBAQAAAAHIAQEAAAAByQFAAAAAAcoBAQAAAAEBFgAArAEAIA2cAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG3AQEAAAABxAEAAADEAQLGAQAAAMYBAscBAQAAAAHIAQEAAAAByQFAAAAAAcoBAQAAAAEBFgAArgEAMAEWAACuAQAwAQAAAAkAIAEAAAADACABAAAADQAgEQQAAPcCACAGAAD4AgAgBwAA9gIAIAgAAIYDACCcAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbQBAQDRAgAhtQEBANECACG3AQEAzgIAIcQBAADzAsQBIsYBAAD0AsYBIscBAQDOAgAhyAEBAM4CACHJAUAA0wIAIcoBAQDRAgAhAgAAABcAIBYAALQBACANnAEBAM4CACGdAQEA0QIAIacBQADTAgAhqAFAANMCACG0AQEA0QIAIbUBAQDRAgAhtwEBAM4CACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQIAAAAVACAWAAC2AQAgAgAAABUAIBYAALYBACABAAAACQAgAQAAAAMAIAEAAAANACADAAAAFwAgHQAArAEAIB4AALQBACABAAAAFwAgAQAAABUAIAcKAACDAwAgIwAAhQMAICQAAIQDACCdAQAAyAIAILQBAADIAgAgtQEAAMgCACDKAQAAyAIAIBCZAQAAmgIAMJoBAADAAQAQmwEAAJoCADCcAQEA-AEAIZ0BAQD7AQAhpwFAAP0BACGoAUAA_QEAIbQBAQD7AQAhtQEBAPsBACG3AQEA-AEAIcQBAACbAsQBIsYBAACcAsYBIscBAQD4AQAhyAEBAPgBACHJAUAA_QEAIcoBAQD7AQAhAwAAABUAIAIAAL8BADAiAADAAQAgAwAAABUAIAIAABYAMAMAABcAIAEAAAALACABAAAACwAgAwAAAAkAIAIAAAoAMAMAAAsAIAMAAAAJACACAAAKADADAAALACADAAAACQAgAgAACgAwAwAACwAgGQQAAP0CACAGAAD-AgAgBwAAgAMAIAkAAIEDACAMAAD_AgAgDQAAggMAIJwBAQAAAAGgAQEAAAABogEAAAC7AQKnAUAAAAABqAFAAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AUAAAAABuQFAAAAAAbsBAQAAAAG8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAECAAAAAcEBAgAAAAHCARAAAAABARYAAMgBACATnAEBAAAAAaABAQAAAAGiAQAAALsBAqcBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBQAAAAAG5AUAAAAABuwEBAAAAAbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQIAAAABwQECAAAAAcIBEAAAAAEBFgAAygEAMAEWAADKAQAwAQAAAA0AIAEAAAAFACABAAAAEAAgGQQAAN4CACAGAADfAgAgBwAA4QIAIAkAAOICACAMAADgAgAgDQAA4wIAIJwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIQIAAAALACAWAADQAQAgE5wBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIQIAAAAJACAWAADSAQAgAgAAAAkAIBYAANIBACABAAAADQAgAQAAAAUAIAEAAAAQACADAAAACwAgHQAAyAEAIB4AANABACABAAAACwAgAQAAAAkAIA0KAADXAgAgIwAA2gIAICQAANkCACA1AADYAgAgNgAA2wIAILUBAADIAgAgtgEAAMgCACC3AQAAyAIAILsBAADIAgAgvAEAAMgCACC9AQAAyAIAIL4BAADIAgAgvwEAAMgCACAWmQEAAJMCADCaAQAA3AEAEJsBAACTAgAwnAEBAPgBACGgAQEA-AEAIaIBAACUArsBIqcBQAD9AQAhqAFAAP0BACG0AQEA-AEAIbUBAQD7AQAhtgEBAPsBACG3AQEA-wEAIbgBQAD9AQAhuQFAAP0BACG7AQEA-wEAIbwBAQD7AQAhvQEBAPsBACG-AQEA-wEAIb8BAQD7AQAhwAECAJUCACHBAQIAlQIAIcIBEAD5AQAhAwAAAAkAIAIAANsBADAiAADcAQAgAwAAAAkAIAIAAAoAMAMAAAsAIBAIAACSAgAgmQEAAIwCADCaAQAAJgAQmwEAAIwCADCcAQEAAAABnQEBAAAAAZ4BEACNAgAhnwEQAI0CACGgAQEAjgIAIaIBAACPAqIBIqMBAQAAAAGkAQEAAAABpQEBAAAAAaYBQACQAgAhpwFAAJECACGoAUAAkQIAIQEAAADfAQAgAQAAAN8BACAFCAAA1gIAIKMBAADIAgAgpAEAAMgCACClAQAAyAIAIKYBAADIAgAgAwAAACYAIAIAAOIBADADAADfAQAgAwAAACYAIAIAAOIBADADAADfAQAgAwAAACYAIAIAAOIBADADAADfAQAgDQgAANUCACCcAQEAAAABnQEBAAAAAZ4BEAAAAAGfARAAAAABoAEBAAAAAaIBAAAAogECowEBAAAAAaQBAQAAAAGlAQEAAAABpgFAAAAAAacBQAAAAAGoAUAAAAABARYAAOYBACAMnAEBAAAAAZ0BAQAAAAGeARAAAAABnwEQAAAAAaABAQAAAAGiAQAAAKIBAqMBAQAAAAGkAQEAAAABpQEBAAAAAaYBQAAAAAGnAUAAAAABqAFAAAAAAQEWAADoAQAwARYAAOgBADANCAAA1AIAIJwBAQDOAgAhnQEBAM4CACGeARAAzwIAIZ8BEADPAgAhoAEBAM4CACGiAQAA0AKiASKjAQEA0QIAIaQBAQDRAgAhpQEBANECACGmAUAA0gIAIacBQADTAgAhqAFAANMCACECAAAA3wEAIBYAAOsBACAMnAEBAM4CACGdAQEAzgIAIZ4BEADPAgAhnwEQAM8CACGgAQEAzgIAIaIBAADQAqIBIqMBAQDRAgAhpAEBANECACGlAQEA0QIAIaYBQADSAgAhpwFAANMCACGoAUAA0wIAIQIAAAAmACAWAADtAQAgAgAAACYAIBYAAO0BACADAAAA3wEAIB0AAOYBACAeAADrAQAgAQAAAN8BACABAAAAJgAgCQoAAMkCACAjAADMAgAgJAAAywIAIDUAAMoCACA2AADNAgAgowEAAMgCACCkAQAAyAIAIKUBAADIAgAgpgEAAMgCACAPmQEAAPcBADCaAQAA9AEAEJsBAAD3AQAwnAEBAPgBACGdAQEA-AEAIZ4BEAD5AQAhnwEQAPkBACGgAQEA-AEAIaIBAAD6AaIBIqMBAQD7AQAhpAEBAPsBACGlAQEA-wEAIaYBQAD8AQAhpwFAAP0BACGoAUAA_QEAIQMAAAAmACACAADzAQAwIgAA9AEAIAMAAAAmACACAADiAQAwAwAA3wEAIA-ZAQAA9wEAMJoBAAD0AQAQmwEAAPcBADCcAQEA-AEAIZ0BAQD4AQAhngEQAPkBACGfARAA-QEAIaABAQD4AQAhogEAAPoBogEiowEBAPsBACGkAQEA-wEAIaUBAQD7AQAhpgFAAPwBACGnAUAA_QEAIagBQAD9AQAhDgoAAP8BACAjAACLAgAgJAAAiwIAIKkBAQAAAAGqAQEAAAAEqwEBAAAABKwBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAigIAIbEBAQAAAAGyAQEAAAABswEBAAAAAQ0KAAD_AQAgIwAAiQIAICQAAIkCACA1AACJAgAgNgAAiQIAIKkBEAAAAAGqARAAAAAEqwEQAAAABKwBEAAAAAGtARAAAAABrgEQAAAAAa8BEAAAAAGwARAAiAIAIQcKAAD_AQAgIwAAhwIAICQAAIcCACCpAQAAAKIBAqoBAAAAogEIqwEAAACiAQiwAQAAhgKiASIOCgAAggIAICMAAIUCACAkAACFAgAgqQEBAAAAAaoBAQAAAAWrAQEAAAAFrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAAAAAbABAQCEAgAhsQEBAAAAAbIBAQAAAAGzAQEAAAABCwoAAIICACAjAACDAgAgJAAAgwIAIKkBQAAAAAGqAUAAAAAFqwFAAAAABawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQAAAAAGwAUAAgQIAIQsKAAD_AQAgIwAAgAIAICQAAIACACCpAUAAAAABqgFAAAAABKsBQAAAAASsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAAAABsAFAAP4BACELCgAA_wEAICMAAIACACAkAACAAgAgqQFAAAAAAaoBQAAAAASrAUAAAAAErAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAAAAAbABQAD-AQAhCKkBAgAAAAGqAQIAAAAEqwECAAAABKwBAgAAAAGtAQIAAAABrgECAAAAAa8BAgAAAAGwAQIA_wEAIQipAUAAAAABqgFAAAAABKsBQAAAAASsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAAAABsAFAAIACACELCgAAggIAICMAAIMCACAkAACDAgAgqQFAAAAAAaoBQAAAAAWrAUAAAAAFrAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAAAAAbABQACBAgAhCKkBAgAAAAGqAQIAAAAFqwECAAAABawBAgAAAAGtAQIAAAABrgECAAAAAa8BAgAAAAGwAQIAggIAIQipAUAAAAABqgFAAAAABasBQAAAAAWsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAAAABsAFAAIMCACEOCgAAggIAICMAAIUCACAkAACFAgAgqQEBAAAAAaoBAQAAAAWrAQEAAAAFrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAAAAAbABAQCEAgAhsQEBAAAAAbIBAQAAAAGzAQEAAAABC6kBAQAAAAGqAQEAAAAFqwEBAAAABawBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAhQIAIbEBAQAAAAGyAQEAAAABswEBAAAAAQcKAAD_AQAgIwAAhwIAICQAAIcCACCpAQAAAKIBAqoBAAAAogEIqwEAAACiAQiwAQAAhgKiASIEqQEAAACiAQKqAQAAAKIBCKsBAAAAogEIsAEAAIcCogEiDQoAAP8BACAjAACJAgAgJAAAiQIAIDUAAIkCACA2AACJAgAgqQEQAAAAAaoBEAAAAASrARAAAAAErAEQAAAAAa0BEAAAAAGuARAAAAABrwEQAAAAAbABEACIAgAhCKkBEAAAAAGqARAAAAAEqwEQAAAABKwBEAAAAAGtARAAAAABrgEQAAAAAa8BEAAAAAGwARAAiQIAIQ4KAAD_AQAgIwAAiwIAICQAAIsCACCpAQEAAAABqgEBAAAABKsBAQAAAASsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEAAAABsAEBAIoCACGxAQEAAAABsgEBAAAAAbMBAQAAAAELqQEBAAAAAaoBAQAAAASrAQEAAAAErAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAAAAAbABAQCLAgAhsQEBAAAAAbIBAQAAAAGzAQEAAAABEAgAAJICACCZAQAAjAIAMJoBAAAmABCbAQAAjAIAMJwBAQCOAgAhnQEBAI4CACGeARAAjQIAIZ8BEACNAgAhoAEBAI4CACGiAQAAjwKiASKjAQEApQIAIaQBAQClAgAhpQEBAKUCACGmAUAAkAIAIacBQACRAgAhqAFAAJECACEIqQEQAAAAAaoBEAAAAASrARAAAAAErAEQAAAAAa0BEAAAAAGuARAAAAABrwEQAAAAAbABEACJAgAhC6kBAQAAAAGqAQEAAAAEqwEBAAAABKwBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAiwIAIbEBAQAAAAGyAQEAAAABswEBAAAAAQSpAQAAAKIBAqoBAAAAogEIqwEAAACiAQiwAQAAhwKiASIIqQFAAAAAAaoBQAAAAAWrAUAAAAAFrAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAAAAAbABQACDAgAhCKkBQAAAAAGqAUAAAAAEqwFAAAAABKwBQAAAAAGtAUAAAAABrgFAAAAAAa8BQAAAAAGwAUAAgAIAIR4EAADBAgAgBgAAuQIAIAcAAMUCACAJAACpAgAgDAAAxAIAIA0AAMYCACCZAQAAwgIAMJoBAAAJABCbAQAAwgIAMJwBAQCOAgAhoAEBAI4CACGiAQAAwwK7ASKnAUAAkQIAIagBQACRAgAhtAEBAI4CACG1AQEApQIAIbYBAQClAgAhtwEBAKUCACG4AUAAkQIAIbkBQACRAgAhuwEBAKUCACG8AQEApQIAIb0BAQClAgAhvgEBAKUCACG_AQEApQIAIcABAgCwAgAhwQECALACACHCARAAjQIAIeABAAAJACDhAQAACQAgFpkBAACTAgAwmgEAANwBABCbAQAAkwIAMJwBAQD4AQAhoAEBAPgBACGiAQAAlAK7ASKnAUAA_QEAIagBQAD9AQAhtAEBAPgBACG1AQEA-wEAIbYBAQD7AQAhtwEBAPsBACG4AUAA_QEAIbkBQAD9AQAhuwEBAPsBACG8AQEA-wEAIb0BAQD7AQAhvgEBAPsBACG_AQEA-wEAIcABAgCVAgAhwQECAJUCACHCARAA-QEAIQcKAAD_AQAgIwAAmQIAICQAAJkCACCpAQAAALsBAqoBAAAAuwEIqwEAAAC7AQiwAQAAmAK7ASINCgAA_wEAICMAAP8BACAkAAD_AQAgNQAAlwIAIDYAAP8BACCpAQIAAAABqgECAAAABKsBAgAAAASsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIAAAABsAECAJYCACENCgAA_wEAICMAAP8BACAkAAD_AQAgNQAAlwIAIDYAAP8BACCpAQIAAAABqgECAAAABKsBAgAAAASsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIAAAABsAECAJYCACEIqQEIAAAAAaoBCAAAAASrAQgAAAAErAEIAAAAAa0BCAAAAAGuAQgAAAABrwEIAAAAAbABCACXAgAhBwoAAP8BACAjAACZAgAgJAAAmQIAIKkBAAAAuwECqgEAAAC7AQirAQAAALsBCLABAACYArsBIgSpAQAAALsBAqoBAAAAuwEIqwEAAAC7AQiwAQAAmQK7ASIQmQEAAJoCADCaAQAAwAEAEJsBAACaAgAwnAEBAPgBACGdAQEA-wEAIacBQAD9AQAhqAFAAP0BACG0AQEA-wEAIbUBAQD7AQAhtwEBAPgBACHEAQAAmwLEASLGAQAAnALGASLHAQEA-AEAIcgBAQD4AQAhyQFAAP0BACHKAQEA-wEAIQcKAAD_AQAgIwAAoAIAICQAAKACACCpAQAAAMQBAqoBAAAAxAEIqwEAAADEAQiwAQAAnwLEASIHCgAA_wEAICMAAJ4CACAkAACeAgAgqQEAAADGAQKqAQAAAMYBCKsBAAAAxgEIsAEAAJ0CxgEiBwoAAP8BACAjAACeAgAgJAAAngIAIKkBAAAAxgECqgEAAADGAQirAQAAAMYBCLABAACdAsYBIgSpAQAAAMYBAqoBAAAAxgEIqwEAAADGAQiwAQAAngLGASIHCgAA_wEAICMAAKACACAkAACgAgAgqQEAAADEAQKqAQAAAMQBCKsBAAAAxAEIsAEAAJ8CxAEiBKkBAAAAxAECqgEAAADEAQirAQAAAMQBCLABAACgAsQBIgqZAQAAoQIAMJoBAACkAQAQmwEAAKECADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACG0AQEA-AEAIbUBAQD7AQAhxAEAAJsCxAEiygEBAPsBACEKmQEAAKICADCaAQAAjAEAEJsBAACiAgAwnAEBAPgBACGnAUAA_QEAIagBQAD9AQAhtAEBAPgBACHLAQEA-AEAIcwBAQD7AQAhzQFAAP0BACEJmQEAAKMCADCaAQAAdgAQmwEAAKMCADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACHOAQEA-AEAIc8BAQD7AQAh0AEBAPsBACENAQAApgIAIAUAAKcCACAJAACpAgAgCwAAqAIAIJkBAACkAgAwmgEAAA0AEJsBAACkAgAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhzgEBAI4CACHPAQEApQIAIdABAQClAgAhC6kBAQAAAAGqAQEAAAAFqwEBAAAABawBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAhQIAIbEBAQAAAAGyAQEAAAABswEBAAAAARAPAAC4AgAgEAAAuQIAIJkBAAC2AgAwmgEAADMAEJsBAAC2AgAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhzwEBAKUCACHQAQEApQIAIdoBIACvAgAh2wEBAKUCACHcAQEApQIAId4BAAC3At4BIuABAAAzACDhAQAAMwAgA9EBAAAJACDSAQAACQAg0wEAAAkAIAPRAQAAEAAg0gEAABAAINMBAAAQACAD0QEAABUAINIBAAAVACDTAQAAFQAgD5kBAACqAgAwmgEAAF4AEJsBAACqAgAwnAEBAPgBACGnAUAA_QEAIagBQAD9AQAhzgEBAPgBACHQAQEA-wEAIdQBAQD7AQAh1QEBAPsBACHWASAAqwIAIdcBEAD5AQAh2AECAJUCACHZAQIAlQIAIdoBIACrAgAhBQoAAP8BACAjAACtAgAgJAAArQIAIKkBIAAAAAGwASAArAIAIQUKAAD_AQAgIwAArQIAICQAAK0CACCpASAAAAABsAEgAKwCACECqQEgAAAAAbABIACtAgAhFAEAAKYCACAFAACnAgAgCQAAqQIAIAsAAKgCACAOAACxAgAgmQEAAK4CADCaAQAAAwAQmwEAAK4CADCcAQEAjgIAIacBQACRAgAhqAFAAJECACHOAQEAjgIAIdABAQClAgAh1AEBAKUCACHVAQEApQIAIdYBIACvAgAh1wEQAI0CACHYAQIAsAIAIdkBAgCwAgAh2gEgAK8CACECqQEgAAAAAbABIACtAgAhCKkBAgAAAAGqAQIAAAAEqwECAAAABKwBAgAAAAGtAQIAAAABrgECAAAAAa8BAgAAAAGwAQIA_wEAIQPRAQAABQAg0gEAAAUAINMBAAAFACAMmQEAALICADCaAQAARgAQmwEAALICADCcAQEA-AEAIacBQAD9AQAhqAFAAP0BACHPAQEA-wEAIdABAQD7AQAh2gEgAKsCACHbAQEA-wEAIdwBAQD7AQAh3gEAALMC3gEiBwoAAP8BACAjAAC1AgAgJAAAtQIAIKkBAAAA3gECqgEAAADeAQirAQAAAN4BCLABAAC0At4BIgcKAAD_AQAgIwAAtQIAICQAALUCACCpAQAAAN4BAqoBAAAA3gEIqwEAAADeAQiwAQAAtALeASIEqQEAAADeAQKqAQAAAN4BCKsBAAAA3gEIsAEAALUC3gEiDg8AALgCACAQAAC5AgAgmQEAALYCADCaAQAAMwAQmwEAALYCADCcAQEAjgIAIacBQACRAgAhqAFAAJECACHPAQEApQIAIdABAQClAgAh2gEgAK8CACHbAQEApQIAIdwBAQClAgAh3gEAALcC3gEiBKkBAAAA3gECqgEAAADeAQirAQAAAN4BCLABAAC1At4BIhYBAACmAgAgBQAApwIAIAkAAKkCACALAACoAgAgDgAAsQIAIJkBAACuAgAwmgEAAAMAEJsBAACuAgAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhzgEBAI4CACHQAQEApQIAIdQBAQClAgAh1QEBAKUCACHWASAArwIAIdcBEACNAgAh2AECALACACHZAQIAsAIAIdoBIACvAgAh4AEAAAMAIOEBAAADACAPAQAApgIAIAUAAKcCACAJAACpAgAgCwAAqAIAIJkBAACkAgAwmgEAAA0AEJsBAACkAgAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhzgEBAI4CACHPAQEApQIAIdABAQClAgAh4AEAAA0AIOEBAAANACAUBAAAuAIAIAYAALkCACAHAAC9AgAgCAAAvgIAIJkBAAC6AgAwmgEAABUAEJsBAAC6AgAwnAEBAI4CACGdAQEApQIAIacBQACRAgAhqAFAAJECACG0AQEApQIAIbUBAQClAgAhtwEBAI4CACHEAQAAuwLEASLGAQAAvALGASLHAQEAjgIAIcgBAQCOAgAhyQFAAJECACHKAQEApQIAIQSpAQAAAMQBAqoBAAAAxAEIqwEAAADEAQiwAQAAoALEASIEqQEAAADGAQKqAQAAAMYBCKsBAAAAxgEIsAEAAJ4CxgEiEAQAAMECACAFAACnAgAgBgAAuQIAIAkAAKkCACCZAQAAwAIAMJoBAAAQABCbAQAAwAIAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACHEAQAAuwLEASLKAQEApQIAIeABAAAQACDhAQAAEAAgHgQAAMECACAGAAC5AgAgBwAAxQIAIAkAAKkCACAMAADEAgAgDQAAxgIAIJkBAADCAgAwmgEAAAkAEJsBAADCAgAwnAEBAI4CACGgAQEAjgIAIaIBAADDArsBIqcBQACRAgAhqAFAAJECACG0AQEAjgIAIbUBAQClAgAhtgEBAKUCACG3AQEApQIAIbgBQACRAgAhuQFAAJECACG7AQEApQIAIbwBAQClAgAhvQEBAKUCACG-AQEApQIAIb8BAQClAgAhwAECALACACHBAQIAsAIAIcIBEACNAgAh4AEAAAkAIOEBAAAJACADtAEBAAAAAcQBAAAAxAECygEBAAAAAQ4EAADBAgAgBQAApwIAIAYAALkCACAJAACpAgAgmQEAAMACADCaAQAAEAAQmwEAAMACADCcAQEAjgIAIacBQACRAgAhqAFAAJECACG0AQEAjgIAIbUBAQClAgAhxAEAALsCxAEiygEBAKUCACEWAQAApgIAIAUAAKcCACAJAACpAgAgCwAAqAIAIA4AALECACCZAQAArgIAMJoBAAADABCbAQAArgIAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIc4BAQCOAgAh0AEBAKUCACHUAQEApQIAIdUBAQClAgAh1gEgAK8CACHXARAAjQIAIdgBAgCwAgAh2QECALACACHaASAArwIAIeABAAADACDhAQAAAwAgHAQAAMECACAGAAC5AgAgBwAAxQIAIAkAAKkCACAMAADEAgAgDQAAxgIAIJkBAADCAgAwmgEAAAkAEJsBAADCAgAwnAEBAI4CACGgAQEAjgIAIaIBAADDArsBIqcBQACRAgAhqAFAAJECACG0AQEAjgIAIbUBAQClAgAhtgEBAKUCACG3AQEApQIAIbgBQACRAgAhuQFAAJECACG7AQEApQIAIbwBAQClAgAhvQEBAKUCACG-AQEApQIAIb8BAQClAgAhwAECALACACHBAQIAsAIAIcIBEACNAgAhBKkBAAAAuwECqgEAAAC7AQirAQAAALsBCLABAACZArsBIg4EAADBAgAgBQAApwIAIJkBAADHAgAwmgEAAAUAEJsBAADHAgAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhtAEBAI4CACHLAQEAjgIAIcwBAQClAgAhzQFAAJECACHgAQAABQAg4QEAAAUAIBAEAADBAgAgBQAApwIAIAYAALkCACAJAACpAgAgmQEAAMACADCaAQAAEAAQmwEAAMACADCcAQEAjgIAIacBQACRAgAhqAFAAJECACG0AQEAjgIAIbUBAQClAgAhxAEAALsCxAEiygEBAKUCACHgAQAAEAAg4QEAABAAIBIIAACSAgAgmQEAAIwCADCaAQAAJgAQmwEAAIwCADCcAQEAjgIAIZ0BAQCOAgAhngEQAI0CACGfARAAjQIAIaABAQCOAgAhogEAAI8CogEiowEBAKUCACGkAQEApQIAIaUBAQClAgAhpgFAAJACACGnAUAAkQIAIagBQACRAgAh4AEAACYAIOEBAAAmACAMBAAAwQIAIAUAAKcCACCZAQAAxwIAMJoBAAAFABCbAQAAxwIAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhywEBAI4CACHMAQEApQIAIc0BQACRAgAhAAAAAAAAAegBAQAAAAEF6AEQAAAAAesBEAAAAAHsARAAAAAB7QEQAAAAAe4BEAAAAAEB6AEAAACiAQIB6AEBAAAAAQHoAUAAAAABAegBQAAAAAEFHQAAgAUAIB4AAIMFACDiAQAAgQUAIOMBAACCBQAg5gEAAAsAIAMdAACABQAg4gEAAIEFACDmAQAACwAgDgQAAK8EACAGAACwBAAgBwAAsQQAIAkAAOQDACAMAACyBAAgDQAAswQAILUBAADIAgAgtgEAAMgCACC3AQAAyAIAILsBAADIAgAgvAEAAMgCACC9AQAAyAIAIL4BAADIAgAgvwEAAMgCACAAAAAAAAHoAQAAALsBAgXoAQIAAAAB6wECAAAAAewBAgAAAAHtAQIAAAAB7gECAAAAAQUdAADiBAAgHgAA_gQAIOIBAADjBAAg4wEAAP0EACDmAQAASQAgBx0AAOAEACAeAAD7BAAg4gEAAOEEACDjAQAA-gQAIOQBAAANACDlAQAADQAg5gEAAGEAIAcdAADeBAAgHgAA-AQAIOIBAADfBAAg4wEAAPcEACDkAQAABQAg5QEAAAUAIOYBAAAHACAHHQAA3AQAIB4AAPUEACDiAQAA3QQAIOMBAAD0BAAg5AEAABAAIOUBAAAQACDmAQAAEgAgCx0AAOkCADAeAADuAgAw4gEAAOoCADDjAQAA6wIAMOQBAADtAgAw5QEAAO0CADDmAQAA7QIAMOcBAADsAgAg6AEAAO0CADDpAQAA7wIAMOoBAADwAgAwBx0AAOQCACAeAADnAgAg4gEAAOUCACDjAQAA5gIAIOQBAAAmACDlAQAAJgAg5gEAAN8BACALnAEBAAAAAZ4BEAAAAAGfARAAAAABoAEBAAAAAaIBAAAAogECowEBAAAAAaQBAQAAAAGlAQEAAAABpgFAAAAAAacBQAAAAAGoAUAAAAABAgAAAN8BACAdAADkAgAgAwAAACYAIB0AAOQCACAeAADoAgAgDQAAACYAIBYAAOgCACCcAQEAzgIAIZ4BEADPAgAhnwEQAM8CACGgAQEAzgIAIaIBAADQAqIBIqMBAQDRAgAhpAEBANECACGlAQEA0QIAIaYBQADSAgAhpwFAANMCACGoAUAA0wIAIQucAQEAzgIAIZ4BEADPAgAhnwEQAM8CACGgAQEAzgIAIaIBAADQAqIBIqMBAQDRAgAhpAEBANECACGlAQEA0QIAIaYBQADSAgAhpwFAANMCACGoAUAA0wIAIQ8EAAD7AgAgBgAA_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_gIAIAkAAIEDACAMAAD_AgAgDQAAggMAIJwBAQAAAAGgAQEAAAABogEAAAC7AQKnAUAAAAABqAFAAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbgBQAAAAAG5AUAAAAABuwEBAAAAAbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQIAAAABwQECAAAAAcIBEAAAAAECAAAACwAgHQAAmgMAIAMAAAALACAdAACaAwAgHgAAmQMAIAEWAADQBAAwHAQAAMECACAGAAC5AgAgBwAAxQIAIAkAAKkCACAMAADEAgAgDQAAxgIAIJkBAADCAgAwmgEAAAkAEJsBAADCAgAwnAEBAAAAAaABAQCOAgAhogEAAMMCuwEipwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACG2AQEApQIAIbcBAQClAgAhuAFAAJECACG5AUAAkQIAIbsBAQClAgAhvAEBAKUCACG9AQEApQIAIb4BAQClAgAhvwEBAKUCACHAAQIAsAIAIcEBAgCwAgAhwgEQAI0CACECAAAACwAgFgAAmQMAIAIAAACXAwAgFgAAmAMAIBaZAQAAlgMAMJoBAACXAwAQmwEAAJYDADCcAQEAjgIAIaABAQCOAgAhogEAAMMCuwEipwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACG2AQEApQIAIbcBAQClAgAhuAFAAJECACG5AUAAkQIAIbsBAQClAgAhvAEBAKUCACG9AQEApQIAIb4BAQClAgAhvwEBAKUCACHAAQIAsAIAIcEBAgCwAgAhwgEQAI0CACEWmQEAAJYDADCaAQAAlwMAEJsBAACWAwAwnAEBAI4CACGgAQEAjgIAIaIBAADDArsBIqcBQACRAgAhqAFAAJECACG0AQEAjgIAIbUBAQClAgAhtgEBAKUCACG3AQEApQIAIbgBQACRAgAhuQFAAJECACG7AQEApQIAIbwBAQClAgAhvQEBAKUCACG-AQEApQIAIb8BAQClAgAhwAECALACACHBAQIAsAIAIcIBEACNAgAhEpwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbYBAQDRAgAhuAFAANMCACG5AUAA0wIAIbsBAQDRAgAhvAEBANECACG9AQEA0QIAIb4BAQDRAgAhvwEBANECACHAAQIA3QIAIcEBAgDdAgAhwgEQAM8CACEXBAAA3gIAIAYAAN8CACAJAADiAgAgDAAA4AIAIA0AAOMCACCcAQEAzgIAIaABAQDOAgAhogEAANwCuwEipwFAANMCACGoAUAA0wIAIbQBAQDOAgAhtQEBANECACG2AQEA0QIAIbgBQADTAgAhuQFAANMCACG7AQEA0QIAIbwBAQDRAgAhvQEBANECACG-AQEA0QIAIb8BAQDRAgAhwAECAN0CACHBAQIA3QIAIcIBEADPAgAhFwQAAP0CACAGAAD-AgAgCQAAgQMAIAwAAP8CACANAACCAwAgnAEBAAAAAaABAQAAAAGiAQAAALsBAqcBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG2AQEAAAABuAFAAAAAAbkBQAAAAAG7AQEAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAgAAAAHBAQIAAAABwgEQAAAAAQ8EAAD7AgAgBgAA_AIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQIAAAAXACAdAACjAwAgAwAAABcAIB0AAKMDACAeAACiAwAgARYAAM8EADACAAAAFwAgFgAAogMAIAIAAADxAgAgFgAAoQMAIAycAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbQBAQDRAgAhtQEBANECACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8EAAD3AgAgBgAA-AIAIAgAAIYDACCcAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbQBAQDRAgAhtQEBANECACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8EAAD7AgAgBgAA_AIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQMdAADNBAAg4gEAAM4EACDmAQAASQAgAx0AAMsEACDiAQAAzAQAIOYBAABhACAEHQAAmwMAMOIBAACcAwAw5gEAAO0CADDnAQAAngMAIAQdAACPAwAw4gEAAJADADDmAQAAkwMAMOcBAACSAwAgAAAABR0AAMUEACAeAADJBAAg4gEAAMYEACDjAQAAyAQAIOYBAABJACALHQAArQMAMB4AALEDADDiAQAArgMAMOMBAACvAwAw5AEAAJMDADDlAQAAkwMAMOYBAACTAwAw5wEAALADACDoAQAAkwMAMOkBAACyAwAw6gEAAJYDADAXBAAA_QIAIAYAAP4CACAHAACAAwAgCQAAgQMAIA0AAIIDACCcAQEAAAABoAEBAAAAAaIBAAAAuwECpwFAAAAAAagBQAAAAAG0AQEAAAABtQEBAAAAAbcBAQAAAAG4AUAAAAABuQFAAAAAAbsBAQAAAAG8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAECAAAAAcEBAgAAAAHCARAAAAABAgAAAAsAIB0AALUDACADAAAACwAgHQAAtQMAIB4AALQDACABFgAAxwQAMAIAAAALACAWAAC0AwAgAgAAAJcDACAWAACzAwAgEpwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbcBAQDRAgAhuAFAANMCACG5AUAA0wIAIbsBAQDRAgAhvAEBANECACG9AQEA0QIAIb4BAQDRAgAhvwEBANECACHAAQIA3QIAIcEBAgDdAgAhwgEQAM8CACEXBAAA3gIAIAYAAN8CACAHAADhAgAgCQAA4gIAIA0AAOMCACCcAQEAzgIAIaABAQDOAgAhogEAANwCuwEipwFAANMCACGoAUAA0wIAIbQBAQDOAgAhtQEBANECACG3AQEA0QIAIbgBQADTAgAhuQFAANMCACG7AQEA0QIAIbwBAQDRAgAhvQEBANECACG-AQEA0QIAIb8BAQDRAgAhwAECAN0CACHBAQIA3QIAIcIBEADPAgAhFwQAAP0CACAGAAD-AgAgBwAAgAMAIAkAAIEDACANAACCAwAgnAEBAAAAAaABAQAAAAGiAQAAALsBAqcBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG3AQEAAAABuAFAAAAAAbkBQAAAAAG7AQEAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAgAAAAHBAQIAAAABwgEQAAAAAQMdAADFBAAg4gEAAMYEACDmAQAASQAgBB0AAK0DADDiAQAArgMAMOYBAACTAwAw5wEAALADACAAAAAFHQAAvQQAIB4AAMMEACDiAQAAvgQAIOMBAADCBAAg5gEAAAEAIAsdAADUAwAwHgAA2AMAMOIBAADVAwAw4wEAANYDADDkAQAAkwMAMOUBAACTAwAw5gEAAJMDADDnAQAA1wMAIOgBAACTAwAw6QEAANkDADDqAQAAlgMAMAsdAADIAwAwHgAAzQMAMOIBAADJAwAw4wEAAMoDADDkAQAAzAMAMOUBAADMAwAw5gEAAMwDADDnAQAAywMAIOgBAADMAwAw6QEAAM4DADDqAQAAzwMAMAsdAAC_AwAwHgAAwwMAMOIBAADAAwAw4wEAAMEDADDkAQAA7QIAMOUBAADtAgAw5gEAAO0CADDnAQAAwgMAIOgBAADtAgAw6QEAAMQDADDqAQAA8AIAMA8EAAD7AgAgBwAA-gIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbcBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQIAAAAXACAdAADHAwAgAwAAABcAIB0AAMcDACAeAADGAwAgARYAAMEEADACAAAAFwAgFgAAxgMAIAIAAADxAgAgFgAAxQMAIAycAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbQBAQDRAgAhtwEBAM4CACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8EAAD3AgAgBwAA9gIAIAgAAIYDACCcAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbQBAQDRAgAhtwEBAM4CACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8EAAD7AgAgBwAA-gIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbcBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQkEAACkAwAgBQAApwMAIAkAAKYDACCcAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABxAEAAADEAQLKAQEAAAABAgAAABIAIB0AANMDACADAAAAEgAgHQAA0wMAIB4AANIDACABFgAAwAQAMA8EAADBAgAgBQAApwIAIAYAALkCACAJAACpAgAgmQEAAMACADCaAQAAEAAQmwEAAMACADCcAQEAAAABpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACHEAQAAuwLEASLKAQEApQIAId8BAAC_AgAgAgAAABIAIBYAANIDACACAAAA0AMAIBYAANEDACAKmQEAAM8DADCaAQAA0AMAEJsBAADPAwAwnAEBAI4CACGnAUAAkQIAIagBQACRAgAhtAEBAI4CACG1AQEApQIAIcQBAAC7AsQBIsoBAQClAgAhCpkBAADPAwAwmgEAANADABCbAQAAzwMAMJwBAQCOAgAhpwFAAJECACGoAUAAkQIAIbQBAQCOAgAhtQEBAKUCACHEAQAAuwLEASLKAQEApQIAIQacAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIcQBAADzAsQBIsoBAQDRAgAhCQQAAIsDACAFAACOAwAgCQAAjQMAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIbQBAQDOAgAhxAEAAPMCxAEiygEBANECACEJBAAApAMAIAUAAKcDACAJAACmAwAgnAEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAcQBAAAAxAECygEBAAAAARcEAAD9AgAgBwAAgAMAIAkAAIEDACAMAAD_AgAgDQAAggMAIJwBAQAAAAGgAQEAAAABogEAAAC7AQKnAUAAAAABqAFAAAAAAbQBAQAAAAG2AQEAAAABtwEBAAAAAbgBQAAAAAG5AUAAAAABuwEBAAAAAbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQIAAAABwQECAAAAAcIBEAAAAAECAAAACwAgHQAA3AMAIAMAAAALACAdAADcAwAgHgAA2wMAIAEWAAC_BAAwAgAAAAsAIBYAANsDACACAAAAlwMAIBYAANoDACASnAEBAM4CACGgAQEAzgIAIaIBAADcArsBIqcBQADTAgAhqAFAANMCACG0AQEAzgIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIRcEAADeAgAgBwAA4QIAIAkAAOICACAMAADgAgAgDQAA4wIAIJwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG2AQEA0QIAIbcBAQDRAgAhuAFAANMCACG5AUAA0wIAIbsBAQDRAgAhvAEBANECACG9AQEA0QIAIb4BAQDRAgAhvwEBANECACHAAQIA3QIAIcEBAgDdAgAhwgEQAM8CACEXBAAA_QIAIAcAAIADACAJAACBAwAgDAAA_wIAIA0AAIIDACCcAQEAAAABoAEBAAAAAaIBAAAAuwECpwFAAAAAAagBQAAAAAG0AQEAAAABtgEBAAAAAbcBAQAAAAG4AUAAAAABuQFAAAAAAbsBAQAAAAG8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAECAAAAAcEBAgAAAAHCARAAAAABAx0AAL0EACDiAQAAvgQAIOYBAAABACAEHQAA1AMAMOIBAADVAwAw5gEAAJMDADDnAQAA1wMAIAQdAADIAwAw4gEAAMkDADDmAQAAzAMAMOcBAADLAwAgBB0AAL8DADDiAQAAwAMAMOYBAADtAgAw5wEAAMIDACAGDwAArwQAIBAAALAEACDPAQAAyAIAINABAADIAgAg2wEAAMgCACDcAQAAyAIAIAAAAAAAAAAAAegBIAAAAAEFHQAAtAQAIB4AALsEACDiAQAAtQQAIOMBAAC6BAAg5gEAAAEAIAsdAACLBAAwHgAAkAQAMOIBAACMBAAw4wEAAI0EADDkAQAAjwQAMOUBAACPBAAw5gEAAI8EADDnAQAAjgQAIOgBAACPBAAw6QEAAJEEADDqAQAAkgQAMAsdAACCBAAwHgAAhgQAMOIBAACDBAAw4wEAAIQEADDkAQAAkwMAMOUBAACTAwAw5gEAAJMDADDnAQAAhQQAIOgBAACTAwAw6QEAAIcEADDqAQAAlgMAMAsdAAD5AwAwHgAA_QMAMOIBAAD6AwAw4wEAAPsDADDkAQAAzAMAMOUBAADMAwAw5gEAAMwDADDnAQAA_AMAIOgBAADMAwAw6QEAAP4DADDqAQAAzwMAMAsdAADwAwAwHgAA9AMAMOIBAADxAwAw4wEAAPIDADDkAQAA7QIAMOUBAADtAgAw5gEAAO0CADDnAQAA8wMAIOgBAADtAgAw6QEAAPUDADDqAQAA8AIAMA8GAAD8AgAgBwAA-gIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtQEBAAAAAbcBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQIAAAAXACAdAAD4AwAgAwAAABcAIB0AAPgDACAeAAD3AwAgARYAALkEADACAAAAFwAgFgAA9wMAIAIAAADxAgAgFgAA9gMAIAycAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbUBAQDRAgAhtwEBAM4CACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8GAAD4AgAgBwAA9gIAIAgAAIYDACCcAQEAzgIAIZ0BAQDRAgAhpwFAANMCACGoAUAA0wIAIbUBAQDRAgAhtwEBAM4CACHEAQAA8wLEASLGAQAA9ALGASLHAQEAzgIAIcgBAQDOAgAhyQFAANMCACHKAQEA0QIAIQ8GAAD8AgAgBwAA-gIAIAgAAIcDACCcAQEAAAABnQEBAAAAAacBQAAAAAGoAUAAAAABtQEBAAAAAbcBAQAAAAHEAQAAAMQBAsYBAAAAxgECxwEBAAAAAcgBAQAAAAHJAUAAAAABygEBAAAAAQkFAACnAwAgBgAApQMAIAkAAKYDACCcAQEAAAABpwFAAAAAAagBQAAAAAG1AQEAAAABxAEAAADEAQLKAQEAAAABAgAAABIAIB0AAIEEACADAAAAEgAgHQAAgQQAIB4AAIAEACABFgAAuAQAMAIAAAASACAWAACABAAgAgAAANADACAWAAD_AwAgBpwBAQDOAgAhpwFAANMCACGoAUAA0wIAIbUBAQDRAgAhxAEAAPMCxAEiygEBANECACEJBQAAjgMAIAYAAIwDACAJAACNAwAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhtQEBANECACHEAQAA8wLEASLKAQEA0QIAIQkFAACnAwAgBgAApQMAIAkAAKYDACCcAQEAAAABpwFAAAAAAagBQAAAAAG1AQEAAAABxAEAAADEAQLKAQEAAAABFwYAAP4CACAHAACAAwAgCQAAgQMAIAwAAP8CACANAACCAwAgnAEBAAAAAaABAQAAAAGiAQAAALsBAqcBQAAAAAGoAUAAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAFAAAAAAbkBQAAAAAG7AQEAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAgAAAAHBAQIAAAABwgEQAAAAAQIAAAALACAdAACKBAAgAwAAAAsAIB0AAIoEACAeAACJBAAgARYAALcEADACAAAACwAgFgAAiQQAIAIAAACXAwAgFgAAiAQAIBKcAQEAzgIAIaABAQDOAgAhogEAANwCuwEipwFAANMCACGoAUAA0wIAIbUBAQDRAgAhtgEBANECACG3AQEA0QIAIbgBQADTAgAhuQFAANMCACG7AQEA0QIAIbwBAQDRAgAhvQEBANECACG-AQEA0QIAIb8BAQDRAgAhwAECAN0CACHBAQIA3QIAIcIBEADPAgAhFwYAAN8CACAHAADhAgAgCQAA4gIAIAwAAOACACANAADjAgAgnAEBAM4CACGgAQEAzgIAIaIBAADcArsBIqcBQADTAgAhqAFAANMCACG1AQEA0QIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIRcGAAD-AgAgBwAAgAMAIAkAAIEDACAMAAD_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_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_AQEAAAABwAECAAAAAcEBAgAAAAHCARAAAAABAwAAAA0AIB0AAMsEACAeAADTBAAgCwAAAA0AIAEAALsDACAFAAC8AwAgCQAAvgMAIBYAANMEACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIc8BAQDRAgAh0AEBANECACEJAQAAuwMAIAUAALwDACAJAAC-AwAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHPAQEA0QIAIdABAQDRAgAhAwAAAAMAIB0AAM0EACAeAADWBAAgEgAAAAMAIAEAAOsDACAFAADtAwAgCQAA7wMAIA4AAOwDACAWAADWBAAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHQAQEA0QIAIdQBAQDRAgAh1QEBANECACHWASAA6gMAIdcBEADPAgAh2AECAN0CACHZAQIA3QIAIdoBIADqAwAhEAEAAOsDACAFAADtAwAgCQAA7wMAIA4AAOwDACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIdABAQDRAgAh1AEBANECACHVAQEA0QIAIdYBIADqAwAh1wEQAM8CACHYAQIA3QIAIdkBAgDdAgAh2gEgAOoDACEYBAAA_QIAIAYAAP4CACAHAACAAwAgDAAA_wIAIA0AAIIDACCcAQEAAAABoAEBAAAAAaIBAAAAuwECpwFAAAAAAagBQAAAAAG0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAFAAAAAAbkBQAAAAAG7AQEAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAgAAAAHBAQIAAAABwgEQAAAAAQIAAAALACAdAADXBAAgAwAAAAkAIB0AANcEACAeAADbBAAgGgAAAAkAIAQAAN4CACAGAADfAgAgBwAA4QIAIAwAAOACACANAADjAgAgFgAA2wQAIJwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIRgEAADeAgAgBgAA3wIAIAcAAOECACAMAADgAgAgDQAA4wIAIJwBAQDOAgAhoAEBAM4CACGiAQAA3AK7ASKnAUAA0wIAIagBQADTAgAhtAEBAM4CACG1AQEA0QIAIbYBAQDRAgAhtwEBANECACG4AUAA0wIAIbkBQADTAgAhuwEBANECACG8AQEA0QIAIb0BAQDRAgAhvgEBANECACG_AQEA0QIAIcABAgDdAgAhwQECAN0CACHCARAAzwIAIQoEAACkAwAgBgAApQMAIAkAAKYDACCcAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABtQEBAAAAAcQBAAAAxAECygEBAAAAAQIAAAASACAdAADcBAAgCAQAALYDACCcAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABywEBAAAAAcwBAQAAAAHNAUAAAAABAgAAAAcAIB0AAN4EACAJAQAA3QMAIAkAAOADACALAADfAwAgnAEBAAAAAacBQAAAAAGoAUAAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAABAgAAAGEAIB0AAOAEACAQAQAAlwQAIAkAAJsEACALAACaBAAgDgAAmAQAIJwBAQAAAAGnAUAAAAABqAFAAAAAAc4BAQAAAAHQAQEAAAAB1AEBAAAAAdUBAQAAAAHWASAAAAAB1wEQAAAAAdgBAgAAAAHZAQIAAAAB2gEgAAAAAQIAAABJACAdAADiBAAgCQEAAN0DACAFAADeAwAgCwAA3wMAIJwBAQAAAAGnAUAAAAABqAFAAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAQIAAABhACAdAADkBAAgEAEAAJcEACAFAACZBAAgCwAAmgQAIA4AAJgEACCcAQEAAAABpwFAAAAAAagBQAAAAAHOAQEAAAAB0AEBAAAAAdQBAQAAAAHVAQEAAAAB1gEgAAAAAdcBEAAAAAHYAQIAAAAB2QECAAAAAdoBIAAAAAECAAAASQAgHQAA5gQAIAoEAACkAwAgBQAApwMAIAYAAKUDACCcAQEAAAABpwFAAAAAAagBQAAAAAG0AQEAAAABtQEBAAAAAcQBAAAAxAECygEBAAAAAQIAAAASACAdAADoBAAgAwAAAA0AIB0AAOQEACAeAADsBAAgCwAAAA0AIAEAALsDACAFAAC8AwAgCwAAvQMAIBYAAOwEACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIc8BAQDRAgAh0AEBANECACEJAQAAuwMAIAUAALwDACALAAC9AwAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHPAQEA0QIAIdABAQDRAgAhAwAAAAMAIB0AAOYEACAeAADvBAAgEgAAAAMAIAEAAOsDACAFAADtAwAgCwAA7gMAIA4AAOwDACAWAADvBAAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhzgEBAM4CACHQAQEA0QIAIdQBAQDRAgAh1QEBANECACHWASAA6gMAIdcBEADPAgAh2AECAN0CACHZAQIA3QIAIdoBIADqAwAhEAEAAOsDACAFAADtAwAgCwAA7gMAIA4AAOwDACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIdABAQDRAgAh1AEBANECACHVAQEA0QIAIdYBIADqAwAh1wEQAM8CACHYAQIA3QIAIdkBAgDdAgAh2gEgAOoDACEDAAAAEAAgHQAA6AQAIB4AAPIEACAMAAAAEAAgBAAAiwMAIAUAAI4DACAGAACMAwAgFgAA8gQAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIbQBAQDOAgAhtQEBANECACHEAQAA8wLEASLKAQEA0QIAIQoEAACLAwAgBQAAjgMAIAYAAIwDACCcAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhxAEAAPMCxAEiygEBANECACEMnAEBAAAAAacBQAAAAAGoAUAAAAABtAEBAAAAAbUBAQAAAAG3AQEAAAABxAEAAADEAQLGAQAAAMYBAscBAQAAAAHIAQEAAAAByQFAAAAAAcoBAQAAAAEDAAAAEAAgHQAA3AQAIB4AAPYEACAMAAAAEAAgBAAAiwMAIAYAAIwDACAJAACNAwAgFgAA9gQAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIbQBAQDOAgAhtQEBANECACHEAQAA8wLEASLKAQEA0QIAIQoEAACLAwAgBgAAjAMAIAkAAI0DACCcAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhxAEAAPMCxAEiygEBANECACEDAAAABQAgHQAA3gQAIB4AAPkEACAKAAAABQAgBAAAqwMAIBYAAPkEACCcAQEAzgIAIacBQADTAgAhqAFAANMCACG0AQEAzgIAIcsBAQDOAgAhzAEBANECACHNAUAA0wIAIQgEAACrAwAgnAEBAM4CACGnAUAA0wIAIagBQADTAgAhtAEBAM4CACHLAQEAzgIAIcwBAQDRAgAhzQFAANMCACEDAAAADQAgHQAA4AQAIB4AAPwEACALAAAADQAgAQAAuwMAIAkAAL4DACALAAC9AwAgFgAA_AQAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIc4BAQDOAgAhzwEBANECACHQAQEA0QIAIQkBAAC7AwAgCQAAvgMAIAsAAL0DACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIc8BAQDRAgAh0AEBANECACEDAAAAAwAgHQAA4gQAIB4AAP8EACASAAAAAwAgAQAA6wMAIAkAAO8DACALAADuAwAgDgAA7AMAIBYAAP8EACCcAQEAzgIAIacBQADTAgAhqAFAANMCACHOAQEAzgIAIdABAQDRAgAh1AEBANECACHVAQEA0QIAIdYBIADqAwAh1wEQAM8CACHYAQIA3QIAIdkBAgDdAgAh2gEgAOoDACEQAQAA6wMAIAkAAO8DACALAADuAwAgDgAA7AMAIJwBAQDOAgAhpwFAANMCACGoAUAA0wIAIc4BAQDOAgAh0AEBANECACHUAQEA0QIAIdUBAQDRAgAh1gEgAOoDACHXARAAzwIAIdgBAgDdAgAh2QECAN0CACHaASAA6gMAIRgEAAD9AgAgBgAA_gIAIAcAAIADACAJAACBAwAgDAAA_wIAIJwBAQAAAAGgAQEAAAABogEAAAC7AQKnAUAAAAABqAFAAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AUAAAAABuQFAAAAAAbsBAQAAAAG8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAECAAAAAcEBAgAAAAHCARAAAAABAgAAAAsAIB0AAIAFACADAAAACQAgHQAAgAUAIB4AAIQFACAaAAAACQAgBAAA3gIAIAYAAN8CACAHAADhAgAgCQAA4gIAIAwAAOACACAWAACEBQAgnAEBAM4CACGgAQEAzgIAIaIBAADcArsBIqcBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhtgEBANECACG3AQEA0QIAIbgBQADTAgAhuQFAANMCACG7AQEA0QIAIbwBAQDRAgAhvQEBANECACG-AQEA0QIAIb8BAQDRAgAhwAECAN0CACHBAQIA3QIAIcIBEADPAgAhGAQAAN4CACAGAADfAgAgBwAA4QIAIAkAAOICACAMAADgAgAgnAEBAM4CACGgAQEAzgIAIaIBAADcArsBIqcBQADTAgAhqAFAANMCACG0AQEAzgIAIbUBAQDRAgAhtgEBANECACG3AQEA0QIAIbgBQADTAgAhuQFAANMCACG7AQEA0QIAIbwBAQDRAgAhvQEBANECACG-AQEA0QIAIb8BAQDRAgAhwAECAN0CACHBAQIA3QIAIcIBEADPAgAhAg8EAhAxBQYBAAEFKgQJLAcKAA0LKwYOCAMDBAACBQwECgAMBwQAAgYOBQckBgklBwoACwwjAw0nCgUBAAEFDwQJHwcKAAkLEwYFBAACBRwEBhQFCRgHCgAIBAQaAgYbBQcABggZBAIFHgAJHQADBSAACSIACyEAAQgABAEJKAABBSkABAUuAAkwAAsvAA4tAAAAAAMKABIjABMkABQAAAADCgASIwATJAAUAQEAAQEBAAEFCgAZIwAcJAAdNQAaNgAbAAAAAAAFCgAZIwAcJAAdNQAaNgAbAQEAAQEBAAEDCgAiIwAjJAAkAAAAAwoAIiMAIyQAJAEEAAIBBAACAwoAKSMAKiQAKwAAAAMKACkjACokACsCBAACBpkBBQIEAAIGnwEFAwoAMCMAMSQAMgAAAAMKADAjADEkADIEBLIBAgazAQUHAAYIsQEEBAS6AQIGuwEFBwAGCLkBBAMKADcjADgkADkAAAADCgA3IwA4JAA5BAQAAgbNAQUHzwEGDM4BAwQEAAIG1QEFB9cBBgzWAQMFCgA-IwBBJABCNQA_NgBAAAAAAAAFCgA-IwBBJABCNQA_NgBAAQgABAEIAAQFCgBHIwBKJABLNQBINgBJAAAAAAAFCgBHIwBKJABLNQBINgBJEQIBEjIBEzUBFDYBFTcBFzkBGDsOGTwPGj4BG0AOHEEQH0IBIEMBIUQOJUcRJkgVJ0oCKEsCKU0CKk4CK08CLFECLVMOLlQWL1YCMFgOMVkXMloCM1sCNFwON18YOGAeOWIFOmMFO2UFPGYFPWcFPmkFP2sOQGwfQW4FQnAOQ3EgRHIFRXMFRnQOR3chSHglSXkDSnoDS3sDTHwDTX0DTn8DT4EBDlCCASZRhAEDUoYBDlOHASdUiAEDVYkBA1aKAQ5XjQEoWI4BLFmPAQZakAEGW5EBBlySAQZdkwEGXpUBBl-XAQ5gmAEtYZsBBmKdAQ5jngEuZKABBmWhAQZmogEOZ6UBL2imATNppwEHaqgBB2upAQdsqgEHbasBB26tAQdvrwEOcLABNHG1AQdytwEOc7gBNXS8AQd1vQEHdr4BDnfBATZ4wgE6ecMBBHrEAQR7xQEEfMYBBH3HAQR-yQEEf8sBDoABzAE7gQHRAQSCAdMBDoMB1AE8hAHYAQSFAdkBBIYB2gEOhwHdAT2IAd4BQ4kB4AEKigHhAQqLAeMBCowB5AEKjQHlAQqOAecBCo8B6QEOkAHqAUSRAewBCpIB7gEOkwHvAUWUAfABCpUB8QEKlgHyAQ6XAfUBRpgB9gFM"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  ConversationScalarFieldEnum: () => ConversationScalarFieldEnum,
  CustomerProfileScalarFieldEnum: () => CustomerProfileScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MessageScalarFieldEnum: () => MessageScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TraderProfileScalarFieldEnum: () => TraderProfileScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  WorkAreaScalarFieldEnum: () => WorkAreaScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.9.1",
  engine: "e922089b7d7502aff4249d5da3420f6fa55fc6ad"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  TraderProfile: "TraderProfile",
  CustomerProfile: "CustomerProfile",
  WorkArea: "WorkArea",
  Conversation: "Conversation",
  Message: "Message",
  Booking: "Booking",
  Payment: "Payment"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  phone: "phone",
  password: "password",
  role: "role",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TraderProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  phone: "phone",
  businessName: "businessName",
  stripeAccountId: "stripeAccountId",
  stripeOnboarded: "stripeOnboarded",
  defaultBookingFee: "defaultBookingFee",
  defaultJobDurationMinutes: "defaultJobDurationMinutes",
  defaultTravelBufferMinutes: "defaultTravelBufferMinutes",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CustomerProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  name: "name",
  phone: "phone",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var WorkAreaScalarFieldEnum = {
  id: "id",
  traderId: "traderId",
  areaName: "areaName",
  postcode: "postcode",
  date: "date",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ConversationScalarFieldEnum = {
  id: "id",
  channel: "channel",
  externalId: "externalId",
  traderId: "traderId",
  customerId: "customerId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var MessageScalarFieldEnum = {
  id: "id",
  conversationId: "conversationId",
  bookingId: "bookingId",
  traderId: "traderId",
  customerId: "customerId",
  channel: "channel",
  direction: "direction",
  senderId: "senderId",
  content: "content",
  sentAt: "sentAt",
  externalId: "externalId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  traderId: "traderId",
  customerId: "customerId",
  workAreaId: "workAreaId",
  conversationId: "conversationId",
  scheduledStart: "scheduledStart",
  scheduledEnd: "scheduledEnd",
  status: "status",
  jobAddress: "jobAddress",
  notes: "notes",
  customerName: "customerName",
  customerPhone: "customerPhone",
  customerEmail: "customerEmail",
  jobDurationMinutes: "jobDurationMinutes",
  travelBufferMinutes: "travelBufferMinutes",
  bookingFee: "bookingFee",
  currency: "currency",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  amount: "amount",
  applicationFee: "applicationFee",
  currency: "currency",
  status: "status",
  stripePaymentIntentId: "stripePaymentIntentId",
  stripeChargeId: "stripeChargeId",
  stripeTransferId: "stripeTransferId",
  paidAt: "paidAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var Channel = {
  WEB_CHAT: "WEB_CHAT",
  WHATSAPP: "WHATSAPP"
};
var MessageDirection = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/errors/handlePrismaErrors.ts
import status2 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status2.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status2.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status2.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status2.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status2.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status2.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status2.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status2.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status2.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status2.INTERNAL_SERVER_ERROR;
  }
  return status2.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status2.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status2.SERVICE_UNAVAILABLE;
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status3.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status3.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: config_default.node_env === "development" ? err : void 0,
    stack: config_default.node_env === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/routes/index.ts
import express9 from "express";

// src/modules/Auth/auth.route.ts
import express from "express";

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
var validateRequest_default = validateRequest;

// src/middlewares/auth.ts
import jwt from "jsonwebtoken";
import status4 from "http-status";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = config_default.database_url;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/middlewares/auth.ts
var auth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError_default(status4.UNAUTHORIZED, "You are not authorized to access this resource");
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config_default.jwt_access_secret);
      const traderProfile = await prisma.traderProfile.findUnique({
        where: { id: decoded.id }
      });
      if (!traderProfile) {
        throw new AppError_default(status4.UNAUTHORIZED, "Trader profile not found");
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppError_default(status4.UNAUTHORIZED, "Invalid or expired token"));
    }
  };
};
var auth_default = auth;

// src/modules/Auth/auth.validation.ts
import { z as z2 } from "zod";
var registerValidationSchema = z2.object({
  body: z2.object({
    name: z2.string().min(1, "Name is required"),
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(6, "Password must be at least 6 characters long"),
    phone: z2.string().optional()
  })
});
var loginValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(1, "Password is required")
  })
});
var authValidationSchema = {
  registerValidationSchema,
  loginValidationSchema
};

// src/modules/Auth/auth.controller.ts
import status6 from "http-status";

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message || "Success",
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/Auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
import status5 from "http-status";
var registerTrader = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (existingUser) {
    throw new AppError_default(status5.CONFLICT, "A trader with this email already exists");
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(payload.password, saltRounds);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      role: "TRADER",
      phone: payload.phone || null,
      traderProfile: {
        create: {
          phone: payload.phone || null
        }
      }
    },
    include: {
      traderProfile: true
    }
  });
  if (!user.traderProfile) {
    throw new AppError_default(status5.INTERNAL_SERVER_ERROR, "Failed to create trader profile");
  }
  return {
    id: user.traderProfile.id,
    name: user.name,
    email: user.email,
    phone: user.traderProfile.phone,
    stripeAccountId: user.traderProfile.stripeAccountId,
    stripeOnboarded: user.traderProfile.stripeOnboarded
  };
};
var loginTrader = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      traderProfile: true
    }
  });
  if (!user || user.role !== "TRADER") {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid email or password");
  }
  if (!user.password) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid email or password");
  }
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid email or password");
  }
  let traderProfile = user.traderProfile;
  if (!traderProfile) {
    traderProfile = await prisma.traderProfile.create({
      data: {
        userId: user.id,
        phone: user.phone
      }
    });
  }
  const jwtPayload = {
    id: traderProfile.id,
    email: user.email
  };
  const token = jwt2.sign(jwtPayload, config_default.jwt_access_secret, {
    expiresIn: config_default.jwt_access_expires_in
  });
  return {
    token,
    trader: {
      id: traderProfile.id,
      name: user.name || "",
      email: user.email || "",
      phone: traderProfile.phone,
      stripeAccountId: traderProfile.stripeAccountId,
      stripeOnboarded: traderProfile.stripeOnboarded
    }
  };
};
var getTraderSession = async (traderProfileId) => {
  const traderProfile = await prisma.traderProfile.findUnique({
    where: { id: traderProfileId },
    include: {
      user: true
    }
  });
  if (!traderProfile) {
    throw new AppError_default(status5.NOT_FOUND, "Trader profile not found");
  }
  return {
    id: traderProfile.id,
    userId: traderProfile.userId,
    name: traderProfile.user.name || "",
    email: traderProfile.user.email || "",
    phone: traderProfile.phone,
    businessName: traderProfile.businessName,
    stripeAccountId: traderProfile.stripeAccountId,
    stripeOnboarded: traderProfile.stripeOnboarded,
    defaultBookingFee: traderProfile.defaultBookingFee,
    defaultJobDurationMinutes: traderProfile.defaultJobDurationMinutes,
    defaultTravelBufferMinutes: traderProfile.defaultTravelBufferMinutes,
    isActive: traderProfile.isActive,
    createdAt: traderProfile.createdAt,
    updatedAt: traderProfile.updatedAt
  };
};
var getAllTraders = async () => {
  const traders = await prisma.traderProfile.findMany({
    where: { isActive: true },
    include: {
      user: true
    },
    orderBy: { createdAt: "desc" }
  });
  return traders.map((trader) => ({
    id: trader.id,
    businessName: trader.businessName || "Independent Trader",
    name: trader.user.name || "",
    email: trader.user.email || "",
    phone: trader.phone,
    stripeAccountId: trader.stripeAccountId,
    stripeOnboarded: trader.stripeOnboarded
  }));
};
var AuthService = {
  registerTrader,
  loginTrader,
  getTraderSession,
  getAllTraders
};

// src/modules/Auth/auth.controller.ts
var registerTrader2 = catchAsync_default(async (req, res) => {
  const result = await AuthService.registerTrader(req.body);
  sendResponse_default(res, {
    statusCode: status6.CREATED,
    success: true,
    message: "Trader registered successfully",
    data: result
  });
});
var loginTrader2 = catchAsync_default(async (req, res) => {
  const result = await AuthService.loginTrader(req.body);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Trader logged in successfully",
    data: result
  });
});
var getSession = catchAsync_default(async (req, res) => {
  const result = await AuthService.getTraderSession(req.user.id);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Session retrieved successfully",
    data: result
  });
});
var getAllTraders2 = catchAsync_default(async (req, res) => {
  const result = await AuthService.getAllTraders();
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Traders list retrieved successfully",
    data: result
  });
});
var AuthController = {
  registerTrader: registerTrader2,
  loginTrader: loginTrader2,
  getSession,
  getAllTraders: getAllTraders2
};

// src/modules/Auth/auth.route.ts
var router = express.Router();
router.post(
  "/register",
  validateRequest_default(authValidationSchema.registerValidationSchema),
  AuthController.registerTrader
);
router.post(
  "/login",
  validateRequest_default(authValidationSchema.loginValidationSchema),
  AuthController.loginTrader
);
router.get(
  "/session",
  auth_default(),
  AuthController.getSession
);
router.get(
  "/traders",
  AuthController.getAllTraders
);
var AuthRoutes = router;

// src/modules/WorkArea/workArea.route.ts
import express2 from "express";

// src/modules/WorkArea/workArea.validation.ts
import { z as z3 } from "zod";
var createWorkAreaValidationSchema = z3.object({
  body: z3.object({
    areaName: z3.string().min(1, "Area name is required"),
    postcode: z3.string().optional(),
    date: z3.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Must be a valid date string"
    })
  })
});
var updateWorkAreaValidationSchema = z3.object({
  body: z3.object({
    areaName: z3.string().min(1, "Area name cannot be empty").optional(),
    postcode: z3.string().optional(),
    date: z3.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Must be a valid date string"
    }).optional()
  })
});
var workAreaValidationSchema = {
  createWorkAreaValidationSchema,
  updateWorkAreaValidationSchema
};

// src/modules/WorkArea/workArea.controller.ts
import status8 from "http-status";

// src/modules/WorkArea/workArea.service.ts
import status7 from "http-status";
var createWorkArea = async (traderId, payload) => {
  const workArea = await prisma.workArea.create({
    data: {
      traderId,
      areaName: payload.areaName,
      postcode: payload.postcode || null,
      date: new Date(payload.date)
    }
  });
  return workArea;
};
var getAllWorkAreas = async (traderId) => {
  const workAreas = await prisma.workArea.findMany({
    where: { traderId },
    orderBy: { date: "asc" }
  });
  return workAreas;
};
var getWorkAreaById = async (traderId, id) => {
  const workArea = await prisma.workArea.findUnique({
    where: { id }
  });
  if (!workArea) {
    throw new AppError_default(status7.NOT_FOUND, "Work area not found");
  }
  if (workArea.traderId !== traderId) {
    throw new AppError_default(status7.FORBIDDEN, "You do not have access to this work area");
  }
  return workArea;
};
var updateWorkArea = async (traderId, id, payload) => {
  await getWorkAreaById(traderId, id);
  const updateData = {};
  if (payload.areaName !== void 0) updateData.areaName = payload.areaName;
  if (payload.postcode !== void 0) updateData.postcode = payload.postcode || null;
  if (payload.date !== void 0) updateData.date = new Date(payload.date);
  const updatedWorkArea = await prisma.workArea.update({
    where: { id },
    data: updateData
  });
  return updatedWorkArea;
};
var deleteWorkArea = async (traderId, id) => {
  await getWorkAreaById(traderId, id);
  await prisma.workArea.delete({
    where: { id }
  });
  return { id };
};
var getWorkAreaByDate = async (traderId, dateStr) => {
  const startOfDay = new Date(dateStr);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setUTCHours(23, 59, 59, 999);
  const workArea = await prisma.workArea.findFirst({
    where: {
      traderId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  if (!workArea) {
    throw new AppError_default(status7.NOT_FOUND, `Work area not found for date ${dateStr}`);
  }
  return workArea;
};
var updateWorkAreaByDate = async (traderId, dateStr, payload) => {
  const workArea = await getWorkAreaByDate(traderId, dateStr);
  const updateData = {};
  if (payload.areaName !== void 0) updateData.areaName = payload.areaName;
  if (payload.postcode !== void 0) updateData.postcode = payload.postcode || null;
  if (payload.date !== void 0) updateData.date = new Date(payload.date);
  const updatedWorkArea = await prisma.workArea.update({
    where: { id: workArea.id },
    data: updateData
  });
  return updatedWorkArea;
};
var WorkAreaService = {
  createWorkArea,
  getAllWorkAreas,
  getWorkAreaById,
  updateWorkArea,
  deleteWorkArea,
  getWorkAreaByDate,
  updateWorkAreaByDate
};

// src/modules/WorkArea/workArea.controller.ts
var createWorkArea2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.createWorkArea(req.user.id, req.body);
  sendResponse_default(res, {
    statusCode: status8.CREATED,
    success: true,
    message: "Work area created successfully",
    data: result
  });
});
var getAllWorkAreas2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.getAllWorkAreas(req.user.id);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work areas retrieved successfully",
    data: result
  });
});
var getWorkAreaById2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.getWorkAreaById(req.user.id, req.params.id);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work area retrieved successfully",
    data: result
  });
});
var updateWorkArea2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.updateWorkArea(req.user.id, req.params.id, req.body);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work area updated successfully",
    data: result
  });
});
var deleteWorkArea2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.deleteWorkArea(req.user.id, req.params.id);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work area deleted successfully",
    data: result
  });
});
var getWorkAreaByDate2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.getWorkAreaByDate(req.user.id, req.params.date);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work area retrieved successfully",
    data: result
  });
});
var updateWorkAreaByDate2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status8.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await WorkAreaService.updateWorkAreaByDate(req.user.id, req.params.date, req.body);
  sendResponse_default(res, {
    statusCode: status8.OK,
    success: true,
    message: "Work area updated successfully",
    data: result
  });
});
var WorkAreaController = {
  createWorkArea: createWorkArea2,
  getAllWorkAreas: getAllWorkAreas2,
  getWorkAreaById: getWorkAreaById2,
  updateWorkArea: updateWorkArea2,
  deleteWorkArea: deleteWorkArea2,
  getWorkAreaByDate: getWorkAreaByDate2,
  updateWorkAreaByDate: updateWorkAreaByDate2
};

// src/modules/WorkArea/workArea.route.ts
var router2 = express2.Router();
router2.post(
  "/",
  auth_default(),
  validateRequest_default(workAreaValidationSchema.createWorkAreaValidationSchema),
  WorkAreaController.createWorkArea
);
router2.get(
  "/",
  auth_default(),
  WorkAreaController.getAllWorkAreas
);
router2.get(
  "/:id",
  auth_default(),
  WorkAreaController.getWorkAreaById
);
router2.patch(
  "/:id",
  auth_default(),
  validateRequest_default(workAreaValidationSchema.updateWorkAreaValidationSchema),
  WorkAreaController.updateWorkArea
);
router2.delete(
  "/:id",
  auth_default(),
  WorkAreaController.deleteWorkArea
);
var WorkAreaRoutes = router2;

// src/modules/Booking/booking.route.ts
import express3 from "express";

// src/modules/Booking/booking.validation.ts
import { z as z4 } from "zod";
var createBookingValidationSchema = z4.object({
  body: z4.object({
    traderId: z4.string().uuid("Invalid traderId format"),
    customerId: z4.string().uuid("Invalid customerId format").optional(),
    workAreaId: z4.string().uuid("Invalid workAreaId format").optional(),
    conversationId: z4.string().uuid("Invalid conversationId format").optional(),
    scheduledStart: z4.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid scheduledStart format. Must be a valid date string"
    }),
    jobDurationMinutes: z4.number().int().positive().optional(),
    travelBufferMinutes: z4.number().int().nonnegative().optional(),
    bookingFee: z4.number().positive().optional(),
    currency: z4.string().optional(),
    jobAddress: z4.string().optional(),
    notes: z4.string().optional(),
    customerName: z4.string().optional(),
    customerPhone: z4.string().optional(),
    customerEmail: z4.string().email("Invalid email address").optional().or(z4.literal(""))
  })
});
var updateBookingValidationSchema = z4.object({
  body: z4.object({
    scheduledStart: z4.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid scheduledStart format. Must be a valid date string"
    }).optional(),
    jobDurationMinutes: z4.number().int().positive().optional(),
    travelBufferMinutes: z4.number().int().nonnegative().optional(),
    status: z4.nativeEnum(BookingStatus).optional(),
    jobAddress: z4.string().optional(),
    notes: z4.string().optional(),
    customerName: z4.string().optional(),
    customerPhone: z4.string().optional(),
    customerEmail: z4.string().email("Invalid email address").optional().or(z4.literal(""))
  })
});
var bookingValidationSchema = {
  createBookingValidationSchema,
  updateBookingValidationSchema
};

// src/modules/Booking/booking.controller.ts
import status10 from "http-status";

// src/modules/Booking/booking.service.ts
import status9 from "http-status";
var createBooking = async (payload) => {
  const trader = await prisma.traderProfile.findUnique({
    where: { id: payload.traderId }
  });
  if (!trader) {
    throw new AppError_default(status9.NOT_FOUND, "Trader profile not found");
  }
  const duration = payload.jobDurationMinutes ?? trader.defaultJobDurationMinutes;
  const buffer = payload.travelBufferMinutes ?? trader.defaultTravelBufferMinutes;
  const fee = payload.bookingFee ?? Number(trader.defaultBookingFee);
  const currency = payload.currency ?? "GBP";
  const scheduledStart = new Date(payload.scheduledStart);
  const scheduledEnd = new Date(scheduledStart.getTime() + duration * 6e4);
  const minTime = new Date(scheduledStart.getTime() - 24 * 60 * 6e4);
  const maxTime = new Date(scheduledStart.getTime() + 24 * 60 * 6e4);
  const existingBookings = await prisma.booking.findMany({
    where: {
      traderId: payload.traderId,
      status: { not: BookingStatus.CANCELLED },
      scheduledStart: {
        gte: minTime,
        lte: maxTime
      }
    }
  });
  const proposedBlockEnd = new Date(scheduledEnd.getTime() + buffer * 6e4);
  for (const b of existingBookings) {
    const existingStart = b.scheduledStart;
    const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 6e4);
    if (scheduledStart < existingBlockEnd && existingStart < proposedBlockEnd) {
      throw new AppError_default(
        status9.CONFLICT,
        "The requested time slot is unavailable due to a scheduling conflict (including travel buffer)"
      );
    }
  }
  if (payload.workAreaId) {
    const workArea = await prisma.workArea.findUnique({
      where: { id: payload.workAreaId }
    });
    if (!workArea || workArea.traderId !== payload.traderId) {
      throw new AppError_default(status9.BAD_REQUEST, "Invalid workAreaId provided for this trader");
    }
  }
  const booking = await prisma.booking.create({
    data: {
      traderId: payload.traderId,
      customerId: payload.customerId || null,
      workAreaId: payload.workAreaId || null,
      conversationId: payload.conversationId || null,
      scheduledStart,
      scheduledEnd,
      status: BookingStatus.PENDING,
      jobAddress: payload.jobAddress || null,
      notes: payload.notes || null,
      customerName: payload.customerName || null,
      customerPhone: payload.customerPhone || null,
      customerEmail: payload.customerEmail || null,
      jobDurationMinutes: duration,
      travelBufferMinutes: buffer,
      bookingFee: fee,
      currency
    },
    include: {
      trader: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      workArea: true
    }
  });
  return booking;
};
var getAllBookings = async (traderId) => {
  const bookings = await prisma.booking.findMany({
    where: { traderId },
    include: {
      customer: true,
      workArea: true,
      payment: true
    },
    orderBy: { scheduledStart: "asc" }
  });
  return bookings;
};
var getBookingById = async (traderId, id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      workArea: true,
      conversation: true,
      payment: true
    }
  });
  if (!booking) {
    throw new AppError_default(status9.NOT_FOUND, "Booking not found");
  }
  if (booking.traderId !== traderId) {
    throw new AppError_default(status9.FORBIDDEN, "You do not have access to this booking");
  }
  return booking;
};
var updateBooking = async (traderId, id, payload) => {
  const existing = await getBookingById(traderId, id);
  const start = payload.scheduledStart ? new Date(payload.scheduledStart) : existing.scheduledStart;
  const duration = payload.jobDurationMinutes ?? existing.jobDurationMinutes;
  const buffer = payload.travelBufferMinutes ?? existing.travelBufferMinutes;
  const end = new Date(start.getTime() + duration * 6e4);
  if (payload.scheduledStart || payload.jobDurationMinutes || payload.travelBufferMinutes) {
    const minTime = new Date(start.getTime() - 24 * 60 * 6e4);
    const maxTime = new Date(start.getTime() + 24 * 60 * 6e4);
    const otherBookings = await prisma.booking.findMany({
      where: {
        traderId,
        id: { not: id },
        status: { not: BookingStatus.CANCELLED },
        scheduledStart: {
          gte: minTime,
          lte: maxTime
        }
      }
    });
    const proposedBlockEnd = new Date(end.getTime() + buffer * 6e4);
    for (const b of otherBookings) {
      const existingStart = b.scheduledStart;
      const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 6e4);
      if (start < existingBlockEnd && existingStart < proposedBlockEnd) {
        throw new AppError_default(
          status9.CONFLICT,
          "The requested time slot is unavailable due to a scheduling conflict (including travel buffer)"
        );
      }
    }
  }
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      scheduledStart: start,
      scheduledEnd: end,
      jobDurationMinutes: duration,
      travelBufferMinutes: buffer,
      status: payload.status,
      jobAddress: payload.jobAddress,
      notes: payload.notes,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail
    },
    include: {
      customer: true,
      workArea: true
    }
  });
  return updatedBooking;
};
var deleteBooking = async (traderId, id) => {
  await getBookingById(traderId, id);
  const cancelledBooking = await prisma.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED }
  });
  return cancelledBooking;
};
var getPublicBookingById = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      trader: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  if (!booking) {
    throw new AppError_default(status9.NOT_FOUND, "Booking not found");
  }
  return {
    id: booking.id,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    customerName: booking.customerName,
    traderName: booking.trader.user?.name || booking.trader.businessName || "Trader",
    status: booking.status
  };
};
var BookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getPublicBookingById
};

// src/modules/Booking/booking.controller.ts
var createBooking2 = catchAsync_default(async (req, res) => {
  const payload = { ...req.body };
  if (req.user) {
    payload.traderId = req.user.id;
  }
  const result = await BookingService.createBooking(payload);
  sendResponse_default(res, {
    statusCode: status10.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result
  });
});
var getAllBookings2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status10.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await BookingService.getAllBookings(req.user.id);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result
  });
});
var getBookingById2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status10.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await BookingService.getBookingById(req.user.id, req.params.id);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result
  });
});
var updateBooking2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status10.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await BookingService.updateBooking(req.user.id, req.params.id, req.body);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Booking updated successfully",
    data: result
  });
});
var deleteBooking2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status10.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await BookingService.deleteBooking(req.user.id, req.params.id);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var getPublicBookingById2 = catchAsync_default(async (req, res) => {
  const result = await BookingService.getPublicBookingById(req.params.id);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Public booking retrieved successfully",
    data: result
  });
});
var BookingController = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getBookingById: getBookingById2,
  updateBooking: updateBooking2,
  deleteBooking: deleteBooking2,
  getPublicBookingById: getPublicBookingById2
};

// src/modules/Booking/booking.route.ts
var router3 = express3.Router();
var optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return auth_default()(req, res, next);
  }
  next();
};
router3.post(
  "/",
  optionalAuth,
  validateRequest_default(bookingValidationSchema.createBookingValidationSchema),
  BookingController.createBooking
);
router3.get(
  "/",
  auth_default(),
  BookingController.getAllBookings
);
router3.get(
  "/:id",
  auth_default(),
  BookingController.getBookingById
);
router3.patch(
  "/:id",
  auth_default(),
  validateRequest_default(bookingValidationSchema.updateBookingValidationSchema),
  BookingController.updateBooking
);
router3.delete(
  "/:id",
  auth_default(),
  BookingController.deleteBooking
);
router3.get(
  "/public/:id",
  BookingController.getPublicBookingById
);
var BookingRoutes = router3;

// src/modules/Conversation/conversation.route.ts
import express4 from "express";

// src/modules/Conversation/conversation.validation.ts
import { z as z5 } from "zod";
var createConversationValidationSchema = z5.object({
  body: z5.object({
    channel: z5.nativeEnum(Channel),
    externalId: z5.string().optional(),
    traderId: z5.string().uuid("Invalid traderId format"),
    customerId: z5.string().uuid("Invalid customerId format").optional()
  })
});
var createMessageValidationSchema = z5.object({
  body: z5.object({
    direction: z5.nativeEnum(MessageDirection),
    senderId: z5.string().min(1, "Sender ID is required"),
    content: z5.string().min(1, "Content is required"),
    externalId: z5.string().optional(),
    bookingId: z5.string().uuid("Invalid bookingId format").optional()
  })
});
var conversationValidationSchema = {
  createConversationValidationSchema,
  createMessageValidationSchema
};

// src/modules/Conversation/conversation.controller.ts
import status12 from "http-status";

// src/modules/Conversation/conversation.service.ts
import status11 from "http-status";
var createOrGetConversation = async (payload) => {
  const trader = await prisma.traderProfile.findUnique({
    where: { id: payload.traderId }
  });
  if (!trader) {
    throw new AppError_default(status11.NOT_FOUND, "Trader profile not found");
  }
  if (payload.externalId) {
    const existing = await prisma.conversation.findUnique({
      where: {
        traderId_channel_externalId: {
          traderId: payload.traderId,
          channel: payload.channel,
          externalId: payload.externalId
        }
      },
      include: {
        customer: true
      }
    });
    if (existing) {
      return existing;
    }
  }
  const conversation = await prisma.conversation.create({
    data: {
      traderId: payload.traderId,
      channel: payload.channel,
      externalId: payload.externalId || null,
      customerId: payload.customerId || null
    },
    include: {
      customer: true
    }
  });
  return conversation;
};
var getAllConversations = async (traderId) => {
  const conversations = await prisma.conversation.findMany({
    where: { traderId },
    include: {
      customer: true
    },
    orderBy: { updatedAt: "desc" }
  });
  return conversations;
};
var getConversationById = async (traderId, id) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: true
    }
  });
  if (!conversation) {
    throw new AppError_default(status11.NOT_FOUND, "Conversation not found");
  }
  if (conversation.traderId !== traderId) {
    throw new AppError_default(status11.FORBIDDEN, "You do not have access to this conversation");
  }
  return conversation;
};
var createMessage = async (traderId, conversationId, payload) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });
  if (!conversation) {
    throw new AppError_default(status11.NOT_FOUND, "Conversation not found");
  }
  if (traderId && conversation.traderId !== traderId) {
    throw new AppError_default(status11.FORBIDDEN, "You do not have access to this conversation");
  }
  let customerId = conversation.customerId;
  if (payload.direction === MessageDirection.INBOUND && !customerId) {
    let customerProfile = await prisma.customerProfile.findFirst({
      where: { phone: payload.senderId }
    });
    if (!customerProfile) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: payload.senderId },
        include: { customerProfile: true }
      });
      if (existingUser) {
        if (existingUser.customerProfile) {
          customerProfile = existingUser.customerProfile;
        } else {
          customerProfile = await prisma.customerProfile.create({
            data: {
              userId: existingUser.id,
              name: existingUser.name || `Customer ${payload.senderId}`,
              phone: payload.senderId
            }
          });
        }
      } else {
        const user = await prisma.user.create({
          data: {
            name: `Customer ${payload.senderId}`,
            phone: payload.senderId,
            role: "CUSTOMER",
            customerProfile: {
              create: {
                name: `Customer ${payload.senderId}`,
                phone: payload.senderId
              }
            }
          },
          include: {
            customerProfile: true
          }
        });
        customerProfile = user.customerProfile;
      }
    }
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { customerId: customerProfile.id }
    });
    customerId = customerProfile.id;
  }
  const message = await prisma.message.create({
    data: {
      conversationId,
      bookingId: payload.bookingId || null,
      traderId: payload.direction === MessageDirection.OUTBOUND ? conversation.traderId : null,
      customerId: payload.direction === MessageDirection.INBOUND ? customerId : null,
      channel: conversation.channel,
      direction: payload.direction,
      senderId: payload.senderId,
      content: payload.content,
      externalId: payload.externalId || null
    }
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: /* @__PURE__ */ new Date() }
  });
  return message;
};
var getConversationMessages = async (traderId, conversationId) => {
  await getConversationById(traderId, conversationId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: "asc" }
  });
  return messages;
};
var ConversationService = {
  createOrGetConversation,
  getAllConversations,
  getConversationById,
  createMessage,
  getConversationMessages
};

// src/modules/Conversation/conversation.controller.ts
var createOrGetConversation2 = catchAsync_default(async (req, res) => {
  const payload = { ...req.body };
  if (req.user) {
    payload.traderId = req.user.id;
  }
  const result = await ConversationService.createOrGetConversation(payload);
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Conversation initialized successfully",
    data: result
  });
});
var getAllConversations2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status12.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await ConversationService.getAllConversations(req.user.id);
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result
  });
});
var getConversationById2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status12.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await ConversationService.getConversationById(req.user.id, req.params.id);
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Conversation retrieved successfully",
    data: result
  });
});
var createMessage2 = catchAsync_default(async (req, res) => {
  const traderId = req.user?.id;
  const result = await ConversationService.createMessage(
    traderId,
    req.params.id,
    req.body
  );
  sendResponse_default(res, {
    statusCode: status12.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result
  });
});
var getConversationMessages2 = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status12.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const result = await ConversationService.getConversationMessages(
    req.user.id,
    req.params.id
  );
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Message history retrieved successfully",
    data: result
  });
});
var ConversationController = {
  createOrGetConversation: createOrGetConversation2,
  getAllConversations: getAllConversations2,
  getConversationById: getConversationById2,
  createMessage: createMessage2,
  getConversationMessages: getConversationMessages2
};

// src/modules/Conversation/conversation.route.ts
var router4 = express4.Router();
var optionalAuth2 = (req, res, next) => {
  if (req.headers.authorization) {
    return auth_default()(req, res, next);
  }
  next();
};
router4.post(
  "/",
  optionalAuth2,
  validateRequest_default(conversationValidationSchema.createConversationValidationSchema),
  ConversationController.createOrGetConversation
);
router4.get(
  "/",
  auth_default(),
  ConversationController.getAllConversations
);
router4.get(
  "/:id",
  auth_default(),
  ConversationController.getConversationById
);
router4.post(
  "/:id/messages",
  optionalAuth2,
  validateRequest_default(conversationValidationSchema.createMessageValidationSchema),
  ConversationController.createMessage
);
router4.get(
  "/:id/messages",
  auth_default(),
  ConversationController.getConversationMessages
);
var ConversationRoutes = router4;

// src/modules/Payment/payment.route.ts
import express5 from "express";

// src/modules/Payment/payment.validation.ts
import { z as z6 } from "zod";
var createCheckoutSessionValidationSchema = z6.object({
  body: z6.object({
    bookingId: z6.string().uuid("Invalid bookingId format")
  })
});
var paymentValidationSchema = {
  createCheckoutSessionValidationSchema
};

// src/modules/Payment/payment.controller.ts
import status14 from "http-status";

// src/modules/Payment/payment.service.ts
import status13 from "http-status";

// src/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe_secret_key);

// src/modules/Payment/payment.service.ts
var initiateStripeConnect = async (traderId, origin) => {
  const trader = await prisma.traderProfile.findUnique({
    where: { id: traderId }
  });
  if (!trader) {
    throw new AppError_default(status13.NOT_FOUND, "Trader profile not found");
  }
  let stripeAccountId = trader.stripeAccountId;
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });
    stripeAccountId = account.id;
    await prisma.traderProfile.update({
      where: { id: traderId },
      data: { stripeAccountId }
    });
  }
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/api/v1/payments/onboard-refresh?accountId=${stripeAccountId}&traderId=${traderId}`,
    return_url: `${origin}/api/v1/payments/onboard-return?accountId=${stripeAccountId}&traderId=${traderId}`,
    type: "account_onboarding"
  });
  return accountLink.url;
};
var completeOnboarding = async (accountId, traderId) => {
  const account = await stripe.accounts.retrieve(accountId);
  if (account.details_submitted) {
    await prisma.traderProfile.update({
      where: { id: traderId },
      data: { stripeOnboarded: true }
    });
    return true;
  }
  return false;
};
var createCheckoutSession = async (bookingId, origin) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trader: true
    }
  });
  if (!booking) {
    throw new AppError_default(status13.NOT_FOUND, "Booking not found");
  }
  const trader = booking.trader;
  if (!trader.stripeAccountId || !trader.stripeOnboarded) {
    throw new AppError_default(
      status13.BAD_REQUEST,
      "Trader has not set up or completed Stripe Connect onboarding"
    );
  }
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId }
  });
  if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
    throw new AppError_default(status13.BAD_REQUEST, "This booking has already been paid");
  }
  const amountInCents = Math.round(Number(booking.bookingFee) * 100);
  const PLATFORM_FLAT_FEE = 5;
  const applicationFeeInCents = Math.min(
    amountInCents,
    Math.round(PLATFORM_FLAT_FEE * 100)
  );
  const applicationFeeDecimal = applicationFeeInCents / 100;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: booking.currency.toLowerCase(),
          product_data: {
            name: `Booking Flat Fee`,
            description: `Booking ID: ${booking.id}`
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }
    ],
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: applicationFeeInCents,
      transfer_data: {
        destination: trader.stripeAccountId
      },
      metadata: {
        bookingId: booking.id
      }
    },
    success_url: `${origin}/api/v1/payments/success?bookingId=${booking.id}`,
    cancel_url: `${origin}/api/v1/payments/cancel?bookingId=${booking.id}`
  });
  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount: booking.bookingFee,
      applicationFee: applicationFeeDecimal,
      currency: booking.currency,
      status: PaymentStatus.PENDING
    },
    update: {
      amount: booking.bookingFee,
      applicationFee: applicationFeeDecimal,
      currency: booking.currency,
      status: PaymentStatus.PENDING
    }
  });
  return session.url;
};
var handleWebhook = async (sig, rawBody, webhookSecret) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    throw new AppError_default(status13.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent;
    if (bookingId) {
      await processSuccessfulPayment(bookingId, paymentIntentId);
    }
  } else if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata?.bookingId;
    const paymentIntentId = paymentIntent.id;
    const latestChargeId = paymentIntent.latest_charge;
    if (bookingId) {
      await processSuccessfulPayment(bookingId, paymentIntentId, latestChargeId);
    }
  }
};
var processSuccessfulPayment = async (bookingId, paymentIntentId, chargeId) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId }
  });
  if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
    await prisma.$transaction([
      prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: 50,
          // Fallback
          applicationFee: 5,
          currency: "GBP",
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId,
          paidAt: /* @__PURE__ */ new Date()
        },
        update: {
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId,
          paidAt: /* @__PURE__ */ new Date()
        }
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED
        }
      })
    ]);
  }
};
var PaymentService = {
  initiateStripeConnect,
  completeOnboarding,
  createCheckoutSession,
  handleWebhook
};

// src/modules/Payment/payment.controller.ts
var connectSetup = catchAsync_default(async (req, res) => {
  if (!req.user) {
    throw new AppError_default(status14.UNAUTHORIZED, "You are not authorized to access this resource");
  }
  const origin = `${req.protocol}://${req.get("host")}`;
  const url = await PaymentService.initiateStripeConnect(req.user.id, origin);
  sendResponse_default(res, {
    statusCode: status14.OK,
    success: true,
    message: "Stripe onboarding URL generated successfully",
    data: { url }
  });
});
var onboardReturn = catchAsync_default(async (req, res) => {
  const { accountId, traderId } = req.query;
  if (!accountId || !traderId) {
    throw new AppError_default(status14.BAD_REQUEST, "Missing accountId or traderId");
  }
  const completed = await PaymentService.completeOnboarding(
    accountId,
    traderId
  );
  if (completed) {
    res.send(`
      <html>
        <head>
          <title>Stripe Onboarding</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f5f6; }
            .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #30c275; margin-bottom: 10px; font-size: 24px; }
            p { color: #555; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Onboarding Completed!</h1>
            <p>Your Stripe Connect account has been successfully linked to TradeSlot.</p>
            <p>You can now close this tab and return to the application.</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head>
          <title>Stripe Onboarding</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f5f6; }
            .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #e15241; margin-bottom: 10px; font-size: 24px; }
            p { color: #555; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Onboarding Incomplete</h1>
            <p>It seems some details are still missing. Please try again or complete the setup inside your Stripe Dashboard.</p>
          </div>
        </body>
      </html>
    `);
  }
});
var onboardRefresh = catchAsync_default(async (req, res) => {
  const { accountId, traderId } = req.query;
  if (!accountId || !traderId) {
    throw new AppError_default(status14.BAD_REQUEST, "Missing accountId or traderId");
  }
  const origin = `${req.protocol}://${req.get("host")}`;
  const url = await PaymentService.initiateStripeConnect(traderId, origin);
  res.redirect(url);
});
var createCheckoutSession2 = catchAsync_default(async (req, res) => {
  const { bookingId } = req.body;
  const origin = `${req.protocol}://${req.get("host")}`;
  const url = await PaymentService.createCheckoutSession(bookingId, origin);
  sendResponse_default(res, {
    statusCode: status14.OK,
    success: true,
    message: "Stripe Checkout Session URL generated successfully",
    data: { url }
  });
});
var handleWebhook2 = catchAsync_default(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = config_default.stripe_webhook_secret;
  if (!sig || !webhookSecret) {
    throw new AppError_default(status14.BAD_REQUEST, "Missing stripe-signature or webhook secret configuration");
  }
  await PaymentService.handleWebhook(sig, req.body, webhookSecret);
  res.status(status14.OK).json({ received: true });
});
var successRedirect = catchAsync_default(async (req, res) => {
  const { bookingId } = req.query;
  res.redirect(`http://localhost:3000/payment/success?bookingId=${bookingId}`);
});
var cancelRedirect = catchAsync_default(async (req, res) => {
  const { bookingId } = req.query;
  res.redirect(`http://localhost:3000/payment/cancel?bookingId=${bookingId}`);
});
var PaymentController = {
  connectSetup,
  onboardReturn,
  onboardRefresh,
  createCheckoutSession: createCheckoutSession2,
  handleWebhook: handleWebhook2,
  successRedirect,
  cancelRedirect
};

// src/modules/Payment/payment.route.ts
var router5 = express5.Router();
router5.post(
  "/connect-setup",
  auth_default(),
  PaymentController.connectSetup
);
router5.get(
  "/onboard-return",
  PaymentController.onboardReturn
);
router5.get(
  "/onboard-refresh",
  PaymentController.onboardRefresh
);
router5.post(
  "/checkout-session",
  validateRequest_default(paymentValidationSchema.createCheckoutSessionValidationSchema),
  PaymentController.createCheckoutSession
);
router5.get(
  "/success",
  PaymentController.successRedirect
);
router5.get(
  "/cancel",
  PaymentController.cancelRedirect
);
var PaymentRoutes = router5;

// src/modules/Trader/trader.route.ts
import express6 from "express";
var router6 = express6.Router();
router6.post(
  "/work-area",
  auth_default(),
  validateRequest_default(workAreaValidationSchema.createWorkAreaValidationSchema),
  WorkAreaController.createWorkArea
);
router6.get(
  "/work-area/:date",
  auth_default(),
  WorkAreaController.getWorkAreaByDate
);
router6.put(
  "/work-area/:date",
  auth_default(),
  validateRequest_default(workAreaValidationSchema.updateWorkAreaValidationSchema),
  WorkAreaController.updateWorkAreaByDate
);
var TraderRoutes = router6;

// src/modules/Webhook/webhook.route.ts
import express7 from "express";

// src/modules/Webhook/webhook.controller.ts
import status15 from "http-status";
var sendWhatsAppMessage = async (to, text) => {
  const token = config_default.whatsapp_access_token;
  const phoneNumberId = config_default.whatsapp_phone_number_id;
  if (!token || !phoneNumberId) {
    console.log(`[MOCK WHATSAPP OUTBOUND] To: ${to}, Message: ${text}`);
    return;
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
      })
    });
    const resData = await response.json();
    console.log("[WHATSAPP API RESPONSE]", resData);
  } catch (error) {
    console.error("Failed to send WhatsApp message", error);
  }
};
var whatsappVerify = catchAsync_default(async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === config_default.whatsapp_verify_token) {
    res.status(status15.OK).send(challenge);
  } else {
    res.sendStatus(status15.FORBIDDEN);
  }
});
var whatsappMessage = catchAsync_default(async (req, res) => {
  const { body: reqBody } = req;
  if (!reqBody.object || reqBody.object !== "whatsapp_business_account") {
    res.sendStatus(status15.BAD_REQUEST);
    return;
  }
  const entry = reqBody.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message) {
    res.sendStatus(status15.OK);
    return;
  }
  const from = message.from;
  const msgId = message.id;
  const textBody = message.text?.body;
  if (!textBody) {
    res.sendStatus(status15.OK);
    return;
  }
  let conversation = await prisma.conversation.findFirst({
    where: {
      channel: "WHATSAPP",
      externalId: from
    },
    include: {
      messages: {
        orderBy: { sentAt: "asc" }
      }
    }
  });
  if (!conversation) {
    const trader = await prisma.traderProfile.findFirst({
      where: { isActive: true }
    });
    if (!trader) {
      res.sendStatus(status15.OK);
      return;
    }
    conversation = await prisma.conversation.create({
      data: {
        channel: "WHATSAPP",
        externalId: from,
        traderId: trader.id
      },
      include: {
        messages: {
          orderBy: { sentAt: "asc" }
        }
      }
    });
  }
  await ConversationService.createMessage(void 0, conversation.id, {
    direction: "INBOUND",
    senderId: from,
    content: textBody,
    externalId: msgId
  });
  const conversationMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { sentAt: "asc" }
  });
  const botMessages = conversationMessages.filter((m) => m.direction === "OUTBOUND");
  const clientMessages = conversationMessages.filter((m) => m.direction === "INBOUND");
  let replyText = "";
  if (botMessages.length === 0) {
    replyText = "Hi! Thank you for contacting TradeSlot. When would you like to schedule your booking? Please reply with date & time (e.g. 2026-08-24 10:00).";
  } else {
    const lastBotMessage = botMessages[botMessages.length - 1].content;
    if (lastBotMessage.includes("Please reply with date & time")) {
      const parsedDate = new Date(textBody);
      if (isNaN(parsedDate.getTime())) {
        replyText = "I couldn't understand that date & time. Please reply in format YYYY-MM-DD HH:MM (e.g. 2026-08-24 10:00).";
      } else {
        const traderId = conversation.traderId;
        const minTime = new Date(parsedDate.getTime() - 24 * 60 * 6e4);
        const maxTime = new Date(parsedDate.getTime() + 24 * 60 * 6e4);
        const existingBookings = await prisma.booking.findMany({
          where: {
            traderId,
            status: { not: "CANCELLED" },
            scheduledStart: { gte: minTime, lte: maxTime }
          }
        });
        const duration = 60;
        const buffer = 30;
        const scheduledEnd = new Date(parsedDate.getTime() + duration * 6e4);
        const proposedBlockEnd = new Date(scheduledEnd.getTime() + buffer * 6e4);
        let conflict = false;
        for (const b of existingBookings) {
          const existingStart = b.scheduledStart;
          const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 6e4);
          if (parsedDate < existingBlockEnd && existingStart < proposedBlockEnd) {
            conflict = true;
            break;
          }
        }
        if (conflict) {
          replyText = "Sorry, that time slot is unavailable due to scheduling conflicts. Please choose another date & time.";
        } else {
          replyText = `Great, ${parsedDate.toLocaleString()} is available! What is your full name?`;
        }
      }
    } else if (lastBotMessage.includes("What is your full name?")) {
      replyText = "Thank you! What is your email address?";
    } else if (lastBotMessage.includes("What is your email address?")) {
      replyText = "Got it! What is your phone number?";
    } else if (lastBotMessage.includes("What is your phone number?")) {
      replyText = "Thanks! Please send your job site address.";
    } else if (lastBotMessage.includes("Please send your job site address.")) {
      replyText = "Perfect! Would you like to confirm the booking? Reply 'YES' to confirm.";
    } else if (lastBotMessage.includes("Reply 'YES' to confirm.")) {
      if (textBody.trim().toUpperCase() === "YES") {
        const len = clientMessages.length;
        if (len >= 6) {
          const dateStr = clientMessages[len - 6].content;
          const customerName = clientMessages[len - 5].content;
          const customerEmail = clientMessages[len - 4].content;
          const customerPhone = clientMessages[len - 3].content;
          const jobAddress = clientMessages[len - 2].content;
          try {
            const booking = await BookingService.createBooking({
              traderId: conversation.traderId,
              scheduledStart: new Date(dateStr).toISOString(),
              customerName,
              customerEmail,
              customerPhone,
              jobAddress,
              conversationId: conversation.id
            });
            const origin = `${req.protocol}://${req.get("host")}`;
            const checkoutUrl = await PaymentService.createCheckoutSession(booking.id, origin);
            replyText = `Booking created successfully! To confirm the booking and secure the slot, please complete the flat fee payment of \xA3${booking.bookingFee} here: ${checkoutUrl}`;
          } catch (err) {
            replyText = `Failed to create booking: ${err.message || "Unknown error"}. Please start over by replying with date & time.`;
          }
        } else {
          replyText = "Something went wrong tracking your responses. Please start over by replying with date & time.";
        }
      } else {
        replyText = "Booking cancelled. Reply with date & time to start over.";
      }
    } else {
      replyText = "Hi! Please reply with date & time (e.g. 2026-08-24 10:00) to start a new booking request.";
    }
  }
  await ConversationService.createMessage(void 0, conversation.id, {
    direction: "OUTBOUND",
    senderId: "whatsapp_agent_bot",
    content: replyText,
    externalId: `reply_${Date.now()}`
  });
  await sendWhatsAppMessage(from, replyText);
  res.sendStatus(status15.OK);
});
var stripeWebhook = PaymentController.handleWebhook;
var WebhookController = {
  whatsappVerify,
  whatsappMessage,
  stripeWebhook
};

// src/modules/Webhook/webhook.route.ts
var router7 = express7.Router();
router7.get("/whatsapp", WebhookController.whatsappVerify);
router7.post("/whatsapp", WebhookController.whatsappMessage);
router7.post(
  "/stripe",
  express7.raw({ type: "application/json" }),
  WebhookController.stripeWebhook
);
var WebhookRoutes = router7;

// src/modules/Chat/chat.route.ts
import express8 from "express";

// src/modules/Chat/chat.controller.ts
import status16 from "http-status";
var processChatMessage = catchAsync_default(async (req, res) => {
  const { traderId, message, conversationId } = req.body;
  if (!traderId || !message) {
    res.status(status16.BAD_REQUEST).json({
      success: false,
      message: "traderId and message are required"
    });
    return;
  }
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" }
        }
      }
    });
  }
  if (!conversation) {
    const trader = await prisma.traderProfile.findUnique({
      where: { id: traderId }
    });
    if (!trader) {
      res.status(status16.NOT_FOUND).json({
        success: false,
        message: "Trader not found"
      });
      return;
    }
    conversation = await prisma.conversation.create({
      data: {
        channel: "WEB_CHAT",
        traderId,
        externalId: `web_chat_${Date.now()}`
      },
      include: {
        messages: {
          orderBy: { sentAt: "asc" }
        }
      }
    });
  }
  await ConversationService.createMessage(void 0, conversation.id, {
    direction: "INBOUND",
    senderId: "customer_web_chat",
    content: message
  });
  const conversationMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { sentAt: "asc" }
  });
  const botMessages = conversationMessages.filter((m) => m.direction === "OUTBOUND");
  const clientMessages = conversationMessages.filter((m) => m.direction === "INBOUND");
  let replyText = "";
  let checkoutUrl = null;
  let isActionable = false;
  if (botMessages.length === 0) {
    replyText = "Hi! Thank you for contacting TradeSlot Booking Assistant. When would you like to schedule your booking? Please reply with date & time (e.g. 2026-08-24 10:00).";
  } else {
    const lastBotMessage = botMessages[botMessages.length - 1].content;
    if (lastBotMessage.includes("Please reply with date & time")) {
      const parsedDate = new Date(message);
      if (isNaN(parsedDate.getTime())) {
        replyText = "I couldn't understand that date & time. Please reply in format YYYY-MM-DD HH:MM (e.g. 2026-08-24 10:00).";
      } else {
        const minTime = new Date(parsedDate.getTime() - 24 * 60 * 6e4);
        const maxTime = new Date(parsedDate.getTime() + 24 * 60 * 6e4);
        const existingBookings = await prisma.booking.findMany({
          where: {
            traderId,
            status: { not: "CANCELLED" },
            scheduledStart: { gte: minTime, lte: maxTime }
          }
        });
        const duration = 60;
        const buffer = 30;
        const scheduledEnd = new Date(parsedDate.getTime() + duration * 6e4);
        const proposedBlockEnd = new Date(scheduledEnd.getTime() + buffer * 6e4);
        let conflict = false;
        for (const b of existingBookings) {
          const existingStart = b.scheduledStart;
          const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 6e4);
          if (parsedDate < existingBlockEnd && existingStart < proposedBlockEnd) {
            conflict = true;
            break;
          }
        }
        if (conflict) {
          replyText = "Sorry, that time slot is unavailable due to scheduling conflicts. Please choose another date & time.";
        } else {
          replyText = `Great, ${parsedDate.toLocaleString()} is available! What is your full name?`;
        }
      }
    } else if (lastBotMessage.includes("What is your full name?")) {
      replyText = "Thank you! What is your email address?";
    } else if (lastBotMessage.includes("What is your email address?")) {
      replyText = "Got it! What is your phone number?";
    } else if (lastBotMessage.includes("What is your phone number?")) {
      replyText = "Thanks! Please send your job site address.";
    } else if (lastBotMessage.includes("Please send your job site address.")) {
      replyText = "Perfect! Would you like to confirm the booking? Reply 'YES' to confirm.";
      isActionable = true;
    } else if (lastBotMessage.includes("Reply 'YES' to confirm.")) {
      if (message.trim().toUpperCase() === "YES") {
        const len = clientMessages.length;
        if (len >= 6) {
          const dateStr = clientMessages[len - 6].content;
          const customerName = clientMessages[len - 5].content;
          const customerEmail = clientMessages[len - 3].content;
          const customerPhone = clientMessages[len - 2].content;
          const jobAddress = clientMessages[len - 1].content;
          try {
            const booking = await BookingService.createBooking({
              traderId,
              scheduledStart: new Date(dateStr).toISOString(),
              customerName,
              customerEmail,
              customerPhone,
              jobAddress,
              conversationId: conversation.id
            });
            const origin = `${req.protocol}://${req.get("host")}`;
            checkoutUrl = await PaymentService.createCheckoutSession(booking.id, origin);
            replyText = `Booking created successfully! To confirm the booking and secure the slot, please complete the flat fee payment of \xA3${booking.bookingFee} here.`;
          } catch (err) {
            replyText = `Failed to create booking: ${err.message || "Unknown error"}. Please start over by replying with date & time.`;
          }
        } else {
          replyText = "Something went wrong tracking your responses. Please start over by replying with date & time.";
        }
      } else {
        replyText = "Booking cancelled. Reply with date & time to start over.";
      }
    } else {
      replyText = "Hi! Please reply with date & time (e.g. 2026-08-24 10:00) to start a new booking request.";
    }
  }
  await ConversationService.createMessage(void 0, conversation.id, {
    direction: "OUTBOUND",
    senderId: "chatbot_system",
    content: replyText
  });
  res.status(status16.OK).json({
    success: true,
    data: {
      conversationId: conversation.id,
      reply: replyText,
      isActionable,
      checkoutUrl
    }
  });
});
var ChatController = {
  processChatMessage
};

// src/modules/Chat/chat.route.ts
var router8 = express8.Router();
router8.post("/messages", ChatController.processChatMessage);
var ChatRoutes = router8;

// src/routes/index.ts
var router9 = express9.Router();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/work-areas",
    route: WorkAreaRoutes
  },
  {
    path: "/bookings",
    route: BookingRoutes
  },
  {
    path: "/conversations",
    route: ConversationRoutes
  },
  {
    path: "/payments",
    route: PaymentRoutes
  },
  {
    path: "/trader",
    route: TraderRoutes
  },
  {
    path: "/webhooks",
    route: WebhookRoutes
  },
  {
    path: "/chat",
    route: ChatRoutes
  }
];
moduleRoutes.forEach((route) => router9.use(route.path, route.route));
var routes_default = router9;

// src/app.ts
var app = express10();
app.use(express10.json());
app.post(
  "/webhook",
  express10.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);
app.use(cors());
app.use(cookieParser());
app.use("/api/v1", routes_default);
app.get("/", (req, res) => {
  res.send("Hello from TradeSlot Application World!");
});
app.use(notFound_default);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
async function main() {
  try {
    app_default.listen(config_default.port, () => {
      console.log(`Server is listening on: http://localhost:${config_default.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
main();
