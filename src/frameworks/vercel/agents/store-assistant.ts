import { ToolLoopAgent } from "ai";
import { getProductById, getProductDetails, searchProducts } from "@/frameworks/vercel/tools/product";
import { getOrderById, searchOrders, getOrderWithDetails } from "@/frameworks/vercel/tools/order";
import { model } from "@/lib/model";

const instructions = await Bun.file("./src/instructions/store-assistant.md").text();

export const storeAssistantAgent = new ToolLoopAgent({
    instructions,
    tools: {
        getProductById,
        getProductDetails,
        searchProducts,
        getOrderById,
        searchOrders,
        getOrderWithDetails,
    },
    model,
});