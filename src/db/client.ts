
import { Database } from 'bun:sqlite';

let dbInstance: Database | null = null;

export const getDb = () => {
    if (!dbInstance) {
        dbInstance = new Database('databases/northwind.sqlite');
    }
    return dbInstance;
};
