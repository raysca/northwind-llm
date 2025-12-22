import { tool } from "ai";
import { z } from "zod";
import { getOrderById as byId, searchOrders as search, getOrderWithDetails as withDetails } from "@/db/orders";
import { ordersSchema, orderDetailsSchema } from "@/db/schema";


const getByIdInputSchema = z.object({
    id: z.number().describe("The ID of the order"),
});

export const getOrderById = tool({
    description: "Get an order by its ID",
    inputSchema: getByIdInputSchema,
    outputSchema: ordersSchema,
    execute: async ({ id }: z.infer<typeof getByIdInputSchema>) => {
        const order = await byId(id);
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return order;
    },
});

export const searchOrders = tool({
    description: "Search orders by ship name or city",
    inputSchema: z.object({
        query: z.string().describe("The search query"),
    }),
    outputSchema: z.array(ordersSchema),
    execute: async ({ query }: { query: string }) => {
        const orders = await search(query);
        return orders;
    },
});

export const getOrderWithDetails = tool({
    description: "Get an order with its details (line items) by ID",
    inputSchema: getByIdInputSchema,
    outputSchema: ordersSchema.extend({
        customerName: z.string().optional(),
        employeeName: z.string().optional(),
        items: z.array(orderDetailsSchema.extend({
            productName: z.string(),
        })),
    }),
    execute: async ({ id }: z.infer<typeof getByIdInputSchema>) => {
        const order = await withDetails(id);
        if (!order) {
            throw new Error(`Order with ID ${id} not found`);
        }
        return order;
    },
});
