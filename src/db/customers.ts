
import { getDb } from './client';
import type { Customer, Order } from './schema';

export function getCustomerById(id: string): Customer | null {
    const db = getDb();
    return db.query('SELECT * FROM Customers WHERE customerId = ?').get(id) as Customer | null;
}

export function searchCustomers(query: string): Customer[] {
    const db = getDb();
    const wildcard = `%${query}%`;
    return db.query(`
    SELECT * FROM Customers 
    WHERE companyName LIKE ? OR contactName LIKE ?
  `).all(wildcard, wildcard) as Customer[];
}

export function getCustomerOrders(customerId: string): Order[] {
    const db = getDb();
    return db.query('SELECT * FROM Orders WHERE customerId = ?').all(customerId) as Order[];
}
