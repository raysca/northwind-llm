import { ToolLoopAgent } from "ai";
import { getProductById, getProductDetails, searchProducts } from "@/frameworks/vercel/tools/product";
import { model } from "@/lib/model";

const instructions = await Bun.file("./src/instructions/store-assistant.md").text();

export const storeAssistantAgent = new ToolLoopAgent({
    instructions,
    tools: {
        getProductById,
        getProductDetails,
        searchProducts,
    },
    model,
});