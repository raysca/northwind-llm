import { tool } from "ai";
import { z } from "zod";
import * as db from "@/db/products";
import { Product, productsSchema } from "@/db/schema";



import { getByIdSchema, searchSchema, listProductsSchema, listProductsByCategorySchema } from "@/frameworks/schema";

export const getProductById = tool({
    description: "Get a product by its ID",
    inputSchema: getByIdSchema,
    outputSchema: productsSchema,
    execute: async ({ id }: z.infer<typeof getByIdSchema>) => {
        const product: Product | null = await db.getProductById(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return product;
    },
})

export const getProductDetails = tool({
    description: "Get a product details by its ID",
    inputSchema: getByIdSchema,
    outputSchema: productsSchema,
    execute: async ({ id }: z.infer<typeof getByIdSchema>) => {
        const product: Product | null = await db.getProductDetails(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return product;
    },
})


export const searchProducts = tool({
    description: "Search products by name",
    inputSchema: searchSchema,
    outputSchema: z.array(productsSchema),
    execute: async ({ query }: z.infer<typeof searchSchema>) => {
        const products: Product[] = await db.searchProducts(query);
        return products;
    },
})

export const listProducts = tool({
    description: "List products with filtering and sorting options",
    inputSchema: listProductsSchema,
    outputSchema: z.array(productsSchema),
    execute: async (options) => {
        return await db.getProducts(options);
    },
})

export const countProducts = tool({
    description: "Get the total number of products",
    inputSchema: z.object({}),
    outputSchema: z.object({ count: z.number() }),
    execute: async () => {
        const count = await db.countProducts();
        return { count };
    },
})

export const listProductsByCategory = tool({
    description: "List products for a specific category",
    inputSchema: listProductsByCategorySchema,
    outputSchema: z.array(productsSchema),
    execute: async ({ categoryId }) => {
        return await db.getProductsByCategory(categoryId);
    },
})

export const countProductsByCategory = tool({
    description: "Get the number of products in a specific category",
    inputSchema: listProductsByCategorySchema,
    outputSchema: z.object({ count: z.number() }),
    execute: async ({ categoryId }) => {
        const count = await db.countProductsByCategory(categoryId);
        return { count };
    },
})

export const listDiscontinuedProducts = tool({
    description: "List all discontinued products",
    inputSchema: z.object({}),
    outputSchema: z.array(productsSchema),
    execute: async () => {
        return await db.getDiscontinuedProducts();
    },
})
