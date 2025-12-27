import { createTool } from "@mastra/core/tools";
import { ordersSchema } from "@/db/schema";
import { getOrders, getOrderById, getOrdersByCustomer, countOrders, getTotalSales, getRecentOrders, searchOrders, getOrderWithDetails } from "@/db/orders";
import z from "zod";

export const listOrdersTool = createTool({
    id: "listOrders",
    description: "List all orders",
    outputSchema: z.array(ordersSchema),
    execute: async () => {
        return getOrders();
    },
});

export const getOrderByIdTool = createTool({
    id: "getOrderById",
    description: "Get an order by id",
    inputSchema: z.object({
        id: z.number(),
    }),
    outputSchema: ordersSchema,
    execute: async (args: { id: number }) => {
        const order = await getOrderById(args.id);
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    },
});

export const getOrdersByCustomerIdTool = createTool({
    id: "getOrdersByCustomerId",
    description: "Get orders by customer id",
    inputSchema: z.object({
        customerId: z.string(),
    }),
    outputSchema: z.array(ordersSchema),
    execute: async (args: { customerId: string }) => {
        return getOrdersByCustomer(args.customerId);
    },
});

export const countOrdersTool = createTool({
    id: "countOrders",
    description: "Count orders",
    outputSchema: z.number(),
    execute: async () => {
        return countOrders();
    },
});

export const getTotalSalesTool = createTool({
    id: "getTotalSales",
    description: "Get total sales",
    outputSchema: z.number(),
    execute: async () => {
        return getTotalSales();
    },
});

export const getRecentOrdersTool = createTool({
    id: "getRecentOrders",
    description: "Get recent orders",
    outputSchema: z.array(ordersSchema),
    inputSchema: z.object({
        limit: z.number().optional().default(10),
    }),
    execute: async (args: { limit: number }) => {
        return getRecentOrders(args.limit);
    },
});

export const searchOrdersTool = createTool({
    id: "searchOrders",
    description: "Search orders",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: z.array(ordersSchema),
    execute: async (args: { query: string }) => {
        return searchOrders(args.query);
    },
});

export const getOrderWithDetailsTool = createTool({
    id: "getOrderWithDetails",
    description: "Get order with details",
    inputSchema: z.object({
        id: z.number(),
    }),
    outputSchema: ordersSchema,
    execute: async (args: { id: number }) => {
        const order = await getOrderWithDetails(args.id);
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    },
});
