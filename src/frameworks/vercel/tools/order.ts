import { tool } from "ai";
import { z } from "zod";
import * as db from "@/db/orders";
import { ordersSchema, orderDetailsSchema } from "@/db/schema";



import { getByIdSchema, searchSchema, listOrdersSchema, listOrdersByCustomerSchema, listRecentOrdersSchema } from "@/frameworks/schema";

export const getOrderById = tool({
    description: "Get an order by its ID",
    inputSchema: getByIdSchema,
    outputSchema: ordersSchema,
    execute: async ({ id }: z.infer<typeof getByIdSchema>) => {
        const order = await db.getOrderById(id);
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return order;
    },
});

export const searchOrders = tool({
    description: "Search orders by ship name or city",
    inputSchema: searchSchema,
    outputSchema: z.array(ordersSchema),
    execute: async ({ query }: z.infer<typeof searchSchema>) => {
        const orders = await db.searchOrders(query);
        return orders;
    },
});

export const getOrderWithDetails = tool({
    description: "Get an order with its details (line items) by ID",
    inputSchema: getByIdSchema,
    outputSchema: ordersSchema.extend({
        customerName: z.string().optional(),
        employeeName: z.string().optional(),
        items: z.array(orderDetailsSchema.extend({
            productName: z.string(),
        })),
    }),
    execute: async ({ id }: z.infer<typeof getByIdSchema>) => {
        const order = await db.getOrderWithDetails(id);
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return order;
    },
});

export const listOrders = tool({
    description: "List orders with filtering and sorting options",
    inputSchema: listOrdersSchema,
    outputSchema: z.array(ordersSchema),
    execute: async (options) => {
        return await db.getOrders(options);
    },
})

export const countOrders = tool({
    description: "Get the total number of orders",
    inputSchema: z.object({}),
    outputSchema: z.object({ count: z.number() }),
    execute: async () => {
        const count = await db.countOrders();
        return { count };
    },
})

export const listOrdersByCustomer = tool({
    description: "List orders for a specific customer",
    inputSchema: listOrdersByCustomerSchema,
    outputSchema: z.array(ordersSchema),
    execute: async ({ customerId }) => {
        return await db.getOrdersByCustomer(customerId);
    },
})

export const getTotalSales = tool({
    description: "Get the total sales revenue",
    inputSchema: z.object({}),
    outputSchema: z.object({ total: z.number() }),
    execute: async () => {
        const total = await db.getTotalSales();
        return { total };
    },
})

export const listRecentOrders = tool({
    description: "Get the most recent orders",
    inputSchema: listRecentOrdersSchema,
    outputSchema: z.array(ordersSchema),
    execute: async ({ limit }) => {
        return await db.getRecentOrders(limit);
    },
})
