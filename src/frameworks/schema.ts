
import { z } from "zod";

export const getByIdSchema = z.object({
    id: z.number().describe("The ID of the item"),
});

export const searchSchema = z.object({
    query: z.string().describe("The search query"),
});

export const listProductsSchema = z.object({
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minStock: z.number().optional(),
    categoryId: z.number().optional(),
    supplierId: z.number().optional(),
    sortBy: z.enum(['price', 'name', 'stock']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const listProductsByCategorySchema = z.object({
    categoryId: z.number().describe("The ID of the category"),
});

export const listOrdersSchema = z.object({
    minFreight: z.number().optional(),
    maxFreight: z.number().optional(),
    customerId: z.string().optional(),
    employeeId: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['date', 'freight', 'shipName']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const listOrdersByCustomerSchema = z.object({
    customerId: z.string().describe("The ID of the customer"),
});

export const listRecentOrdersSchema = z.object({
    limit: z.number().describe("The number of orders to return"),
});
