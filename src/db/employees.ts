
import { getDb } from './client';
import type { Employee } from './schema';

export function getEmployeeById(id: number): Employee | null {
    const db = getDb();
    return db.query('SELECT * FROM Employees WHERE employeeId = ?').get(id) as Employee | null;
}

export function searchEmployees(query: string): Employee[] {
    const db = getDb();
    const wildcard = `%${query}%`;
    return db.query(`
    SELECT * FROM Employees 
    WHERE firstName LIKE ? OR lastName LIKE ?
  `).all(wildcard, wildcard) as Employee[];
}

export interface EmployeeDetail extends Employee {
    reportsToName?: string;
}

export function getEmployeeDetails(id: number): EmployeeDetail | null {
    const db = getDb();
    return db.query(`
    SELECT 
      e.*,
      m.firstName || ' ' || m.lastName as reportsToName
    FROM Employees e
    LEFT JOIN Employees m ON e.reportsTo = m.employeeId
    WHERE e.employeeId = ?
  `).get(id) as EmployeeDetail | null;
}
