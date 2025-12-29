
import { customersSchema, employeesSchema, ordersSchema, productsSchema } from "@/db/schema";
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

export const StoreResponseSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("product"),
        product: productsSchema.nullable(),
    }),
    z.object({
        type: z.literal("products"),
        products: productsSchema.array().nullable(),
    }),
    z.object({
        type: z.literal("order"),
        order: ordersSchema.nullable(),
    }),
    z.object({
        type: z.literal("orders"),
        orders: ordersSchema.array().nullable(),
    }),
    z.object({
        type: z.literal("employee"),
        employee: employeesSchema.nullable(),
    }),
    z.object({
        type: z.literal("employees"),
        employees: employeesSchema.array().nullable(),
    }),
    z.object({
        type: z.literal("customer"),
        customer: customersSchema.nullable(),
    }),
    z.object({
        type: z.literal("customers"),
        customers: customersSchema.array().nullable(),
    }),
    z.object({
        type: z.literal("text_response"),
        content: z.string().nullable(),
    }),
]);