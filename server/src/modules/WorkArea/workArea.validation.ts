import { z } from 'zod';

const createWorkAreaValidationSchema = z.object({
  body: z.object({
    areaName: z.string().min(1, 'Area name is required'),
    postcode: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format. Must be a valid date string',
    }),
  }),
});

const updateWorkAreaValidationSchema = z.object({
  body: z.object({
    areaName: z.string().min(1, 'Area name cannot be empty').optional(),
    postcode: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format. Must be a valid date string',
    }).optional(),
  }),
});

export const workAreaValidationSchema = {
  createWorkAreaValidationSchema,
  updateWorkAreaValidationSchema,
};
