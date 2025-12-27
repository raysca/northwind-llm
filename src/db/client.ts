
import { Database } from 'bun:sqlite';

let dbInstance: Database | null = null;

export const getDb = () => {
    if (!dbInstance) {
        dbInstance = new Database('databases/northwind.sqlite');
    }
    return dbInstance;
};

export const getSchema = () => {
    const db = getDb();
    const query = db.query("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL");
    const results = query.all() as { sql: string }[];
    return results.map(row => row.sql).join('\n\n');
};
