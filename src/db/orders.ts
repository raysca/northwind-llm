
import { getDb } from './client';
import type { Order, OrderDetail } from './schema';

export function getOrderById(id: number): Order | null {
    const db = getDb();
    return db.query('SELECT * FROM Orders WHERE orderId = ?').get(id) as Order | null;
}

export function searchOrders(query: string): Order[] {
    const db = getDb();
    const wildcard = `%${query}%`;
    return db.query(`
    SELECT * FROM Orders 
    WHERE shipName LIKE ? OR shipCity LIKE ?
  `).all(wildcard, wildcard) as Order[];
}

export interface OrderWithDetails extends Order {
    customerName?: string;
    employeeName?: string;
    items: Array<OrderDetail & { productName: string }>;
}

export function getOrderWithDetails(id: number): OrderWithDetails | null {
    const db = getDb();

    // Get the main order info with customer and employee names
    const order = db.query(`
    SELECT 
      o.*,
      c.companyName as customerName,
      e.firstName || ' ' || e.lastName as employeeName
    FROM Orders o
    LEFT JOIN Customers c ON o.customerId = c.customerId
    LEFT JOIN Employees e ON o.employeeId = e.employeeId
    WHERE o.orderId = ?
  `).get(id) as OrderWithDetails | null;

    if (!order) return null;

    // Get the line items
    const items = db.query(`
    SELECT 
      od.*,
      p.productName
    FROM "Order Details" od
    LEFT JOIN Products p ON od.productId = p.productId
    WHERE od.orderId = ?
  `).all(id) as Array<OrderDetail & { productName: string }>;

    order.items = items;
    return order;
}
