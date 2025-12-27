import { getDb } from "@/db/client";
import { Type, FunctionDeclaration } from "@google/genai";

export const databaseQueryToolDeclaration: FunctionDeclaration = {
    name: 'database_query',
    description: 'Query the database for information.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING, description: 'The query to execute.' },
        },
        required: ['query'],
    },
};

export const databaseQueryToolExecutor = ({ query }: { query: string }) => {
    console.log('Executing database query:', query);
    const db = getDb();
    const result = db.query(query);
    const all = result.all();
    return all;
};
