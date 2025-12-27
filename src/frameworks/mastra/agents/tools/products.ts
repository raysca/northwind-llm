import { createTool } from "@mastra/core/tools";
import { listProductsSchema } from "@/frameworks/schema";
import { productsSchema } from "@/db/schema";
import { getProductById, getProductDetails, getProducts, searchProducts, countProducts, countProductsByCategory, getDiscontinuedProducts, getProductsByCategory } from "@/db/products";
import z from "zod";

export type ListProductsParameters = z.infer<typeof listProductsSchema>;

export const listProductsTool = createTool({
    id: "listProducts",
    description: "List all products",
    inputSchema: listProductsSchema,
    outputSchema: z.array(productsSchema),
    execute: async (args: ListProductsParameters) => {
        return getProducts(args);
    },
});

export const getProductsByCategoryTool = createTool({
    id: "getProductsByCategory",
    description: "Get products by category",
    inputSchema: z.object({
        categoryId: z.number(),
    }),
    outputSchema: z.array(productsSchema),
    execute: async (args: { categoryId: number }) => {
        return getProductsByCategory(args.categoryId);
    },
});

export const getProductByIdTool = createTool({
    id: "getProductById",
    description: "Get a product by id",
    inputSchema: z.object({
        id: z.number(),
    }),
    outputSchema: productsSchema,
    execute: async (args: { id: number }) => {
        const product = await getProductById(args.id);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    },
});

export const getProductDetailsTool = createTool({
    id: "getProductDetails",
    description: "Get product details",
    inputSchema: z.object({
        id: z.number(),
    }),
    outputSchema: productsSchema,
    execute: async (args: { id: number }) => {
        const product = await getProductDetails(args.id);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    },
});

export const searchProductsTool = createTool({
    id: "searchProducts",
    description: "Search products",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: z.array(productsSchema),
    execute: async (args: { query: string }) => {
        return searchProducts(args.query);
    },
});

export const countProductsTool = createTool({
    id: "countProducts",
    description: "Count products",
    outputSchema: z.number(),
    execute: async () => {
        return countProducts();
    },
});

export const countProductsByCategoryTool = createTool({
    id: "countProductsByCategory",
    description: "Count products by category",
    inputSchema: z.object({
        categoryId: z.number(),
    }),
    outputSchema: z.number(),
    execute: async (args: { categoryId: number }) => {
        return countProductsByCategory(args.categoryId);
    },
});

export const getDiscontinuedProductsTool = createTool({
    id: "getDiscontinuedProducts",
    description: "Get discontinued products",
    outputSchema: z.array(productsSchema),
    execute: async () => {
        return getDiscontinuedProducts();
    },
});

