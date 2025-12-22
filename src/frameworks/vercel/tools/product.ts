import { tool } from "ai";
import { z } from "zod";
import { getProductById as byId, getProductDetails as details, searchProducts as search } from "@/db/products";
import { Product, productsSchema } from "@/db/schema";


const getByIdInputSchema = z.object({
    id: z.number().describe("The ID of the product"),
})

export const getProductById = tool({
    description: "Get a product by its ID",
    inputSchema: getByIdInputSchema,
    outputSchema: productsSchema,
    execute: async ({ id }: z.infer<typeof getByIdInputSchema>) => {
        const product: Product | null = await byId(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return product;
    },
})

export const getProductDetails = tool({
    description: "Get a product details by its ID",
    inputSchema: getByIdInputSchema,
    outputSchema: productsSchema,
    execute: async ({ id }: z.infer<typeof getByIdInputSchema>) => {
        const product: Product | null = await details(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return product;
    },
})


export const searchProducts = tool({
    description: "Search products by name",
    inputSchema: z.object({
        query: z.string().describe("The search query"),
    }),
    outputSchema: z.array(productsSchema),
    execute: async ({ query }: { query: string }) => {
        const products: Product[] = await search(query);
        return products;
    },
})
