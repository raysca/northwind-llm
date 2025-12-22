
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
