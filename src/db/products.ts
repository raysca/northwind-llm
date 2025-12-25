
import { getDb } from '@/db/client';
import type { Product } from '@/db/schema';

export function getProductById(id: number): Product | null {
  const db = getDb();
  return db.query('SELECT * FROM Product WHERE productId = ?').get(id) as Product | null;
}

export function searchProducts(query: string): Product[] {
  const db = getDb();
  const wildcard = `%${query}%`;
  return db.query('SELECT * FROM Product WHERE productName LIKE ?').all(wildcard) as Product[];
}

export interface ProductDetail extends Product {
  categoryName?: string;
  supplierName?: string;
}


export function getProductDetails(id: number): ProductDetail | null {
  const db = getDb();
  const sql = `
    SELECT 
      p.*,
      c.categoryName,
      s.companyName as supplierName
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.categoryId
    LEFT JOIN Supplier s ON p.supplierId = s.supplierId
    WHERE p.productId = ?
  `;
  return db.query(sql).get(id) as ProductDetail | null;
}

export function countProducts(): number {
  const db = getDb();
  const result = db.query('SELECT COUNT(*) as count FROM Product').get() as { count: number };
  return result.count;
}

export function getProductsByCategory(categoryId: number): Product[] {
  const db = getDb();
  return db.query('SELECT * FROM Product WHERE categoryId = ?').all(categoryId) as Product[];
}

export function countProductsByCategory(categoryId: number): number {
  const db = getDb();
  const result = db.query('SELECT COUNT(*) as count FROM Product WHERE categoryId = ?').get(categoryId) as { count: number };
  return result.count;
}

export function getDiscontinuedProducts(): Product[] {
  const db = getDb();
  // SQLite stores booleans as integers 0/1 usually.
  return db.query('SELECT * FROM Product WHERE Discontinued = 1').all() as Product[];
}

export interface GetProductsOptions {
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  categoryId?: number;
  supplierId?: number;
  sortBy?: 'price' | 'name' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export function getProducts(options: GetProductsOptions = {}): Product[] {
  const db = getDb();
  let sql = 'SELECT * FROM Product WHERE 1=1';
  const params: any[] = [];

  if (options.minPrice !== undefined) {
    sql += ' AND UnitPrice >= ?';
    params.push(options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    sql += ' AND UnitPrice <= ?';
    params.push(options.maxPrice);
  }

  if (options.minStock !== undefined) {
    sql += ' AND UnitsInStock >= ?';
    params.push(options.minStock);
  }

  if (options.categoryId !== undefined) {
    sql += ' AND CategoryId = ?';
    params.push(options.categoryId);
  }

  if (options.supplierId !== undefined) {
    sql += ' AND SupplierId = ?';
    params.push(options.supplierId);
  }

  if (options.sortBy) {
    let sortColumn = 'ProductName';
    switch (options.sortBy) {
      case 'price':
        sortColumn = 'UnitPrice';
        break;
      case 'stock':
        sortColumn = 'UnitsInStock';
        break;
      case 'name':
      default:
        sortColumn = 'ProductName';
    }
    const order = options.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortColumn} ${order}`;
  }

  return db.query(sql).all(...params) as Product[];
}
