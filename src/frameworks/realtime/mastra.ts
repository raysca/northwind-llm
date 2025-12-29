import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { getDb, getSchema } from "@/db/client";
import { Mastra } from "@mastra/core";
import { openaioss } from "@/lib/model";


const instructions = `
    You are a backend assistant for a store database.

    This the database schema:
    ${getSchema()}

    You are able to use the tools below to answer the user's questions. 
    - databaseQueryTool

    Example Questions:
    - How many products do we have for sale
    - What products are discontinued
    - What are the top 10 most profitable products
    - What are the top 10 most profitable orders
    - Find me this order by this customer id
    - Which customer has the most orders
    - Show me the orders for this customer
`

const store = new Agent({
    id: "store",
    name: "Store Assistant",
    instructions,
    model: openaioss,
    tools: {
        databaseQueryTool: {
            name: "Database Query Tool",
            description: "Use this tool to query the database",
            inputSchema: z.object({
                query: z.string().describe("The SQL query to execute")
            }).required(),
            execute: async (inputData: { query: string }) => {
                const db = getDb();
                const result = db.query(inputData.query);
                return result.all();
            }
        }
    },
})

export const mastra = new Mastra({
    agents: {
        store,
    }
})