
import { getDb } from './client';
import type { Order, OrderDetail } from './schema';

export function getOrderById(id: number): Order | null {
  const db = getDb();
  return db.query(`
        SELECT 
            Id as orderId,
            CustomerId as customerId,
            EmployeeId as employeeId,
            OrderDate as orderDate,
            RequiredDate as requiredDate,
            ShippedDate as shippedDate,
            ShipVia as shipVia,
            Freight as freight,
            ShipName as shipName,
            ShipAddress as shipAddress,
            ShipCity as shipCity,
            ShipRegion as shipRegion,
            ShipPostalCode as shipPostalCode,
            ShipCountry as shipCountry
        FROM "Order" 
        WHERE Id = ?
    `).get(id) as Order | null;
}

export function searchOrders(query: string): Order[] {
  const db = getDb();
  const wildcard = `%${query}%`;
  return db.query(`
        SELECT 
            Id as orderId,
            CustomerId as customerId,
            EmployeeId as employeeId,
            OrderDate as orderDate,
            RequiredDate as requiredDate,
            ShippedDate as shippedDate,
            ShipVia as shipVia,
            Freight as freight,
            ShipName as shipName,
            ShipAddress as shipAddress,
            ShipCity as shipCity,
            ShipRegion as shipRegion,
            ShipPostalCode as shipPostalCode,
            ShipCountry as shipCountry
        FROM "Order" 
        WHERE ShipName LIKE ? OR ShipCity LIKE ?
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
      o.Id as orderId,
      o.CustomerId as customerId,
      o.EmployeeId as employeeId,
      o.OrderDate as orderDate,
      o.RequiredDate as requiredDate,
      o.ShippedDate as shippedDate,
      o.ShipVia as shipVia,
      o.Freight as freight,
      o.ShipName as shipName,
      o.ShipAddress as shipAddress,
      o.ShipCity as shipCity,
      o.ShipRegion as shipRegion,
      o.ShipPostalCode as shipPostalCode,
      o.ShipCountry as shipCountry,
      c.CompanyName as customerName,
      e.FirstName || ' ' || e.LastName as employeeName
    FROM "Order" o
    LEFT JOIN Customer c ON o.CustomerId = c.Id
    LEFT JOIN Employee e ON o.EmployeeId = e.Id
    WHERE o.Id = ?
  `).get(id) as OrderWithDetails | null;

  if (!order) return null;

  // Get the line items
  const items = db.query(`
    SELECT 
      od.OrderId as orderId,
      od.ProductId as productId,
      od.UnitPrice as unitPrice,
      od.Quantity as quantity,
      od.Discount as discount,
      p.ProductName as productName
    FROM OrderDetail od
    LEFT JOIN Product p ON od.ProductId = p.Id
    WHERE od.OrderId = ?
  `).all(id) as Array<OrderDetail & { productName: string }>;


  order.items = items;
  return order;
}

export function countOrders(): number {
  const db = getDb();
  const result = db.query('SELECT COUNT(*) as count FROM "Order"').get() as { count: number };
  return result.count;
}

export function getOrdersByCustomer(customerId: string): Order[] {
  const db = getDb();
  return db.query('SELECT * FROM "Order" WHERE CustomerId = ?').all(customerId) as Order[];
}

export function getTotalSales(): number {
  const db = getDb();
  // Calculate total sales from OrderDetails (UnitPrice * Quantity * (1 - Discount))
  // We need to sum this up for all order details.
  const result = db.query(`
        SELECT SUM(UnitPrice * Quantity * (1 - Discount)) as total 
        FROM OrderDetail
    `).get() as { total: number };
  return result.total || 0;
}

export interface GetOrdersOptions {
  minFreight?: number;
  maxFreight?: number;
  customerId?: string;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'freight' | 'shipName';
  sortOrder?: 'asc' | 'desc';
}

export function getOrders(options: GetOrdersOptions = {}): Order[] {
  const db = getDb();
  let sql = 'SELECT * FROM "Order" WHERE 1=1';
  const params: any[] = [];

  if (options.minFreight !== undefined) {
    sql += ' AND Freight >= ?';
    params.push(options.minFreight);
  }

  if (options.maxFreight !== undefined) {
    sql += ' AND Freight <= ?';
    params.push(options.maxFreight);
  }

  if (options.customerId !== undefined) {
    sql += ' AND CustomerId = ?';
    params.push(options.customerId);
  }

  if (options.employeeId !== undefined) {
    sql += ' AND EmployeeId = ?';
    params.push(options.employeeId);
  }

  if (options.startDate !== undefined) {
    sql += ' AND OrderDate >= ?';
    params.push(options.startDate);
  }

  if (options.endDate !== undefined) {
    sql += ' AND OrderDate <= ?';
    params.push(options.endDate);
  }

  if (options.sortBy) {
    let sortColumn = 'OrderDate';
    switch (options.sortBy) {
      case 'freight':
        sortColumn = 'Freight';
        break;
      case 'shipName':
        sortColumn = 'ShipName';
        break;
      case 'date':
      default:
        sortColumn = 'OrderDate';
    }
    const order = options.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortColumn} ${order}`;
  }

  return db.query(sql).all(...params) as Order[];
}

export function getRecentOrders(limit: number): Order[] {
  const db = getDb();
  return db.query(`
        SELECT * FROM "Order" 
        ORDER BY OrderDate DESC 
        LIMIT ?
    `).all(limit) as Order[];
}
