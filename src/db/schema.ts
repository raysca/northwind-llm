
import { z } from 'zod';

export const regionSchema = z.object({
    Id: z.number(),
    RegionDescription: z.string(),
});

export const territoriesSchema = z.object({
    Id: z.string(),
    TerritoryDescription: z.string(),
    RegionId: z.number(),
});

export const categoriesSchema = z.object({
    Id: z.number(),
    CategoryName: z.string(),
    Description: z.string().nullable().optional(),
    Picture: z.instanceof(Buffer).nullable().optional(), // Or z.string() if base64
});

export const suppliersSchema = z.object({
    Id: z.number(),
    CompanyName: z.string(),
    ContactName: z.string().nullable().optional(),
    ContactTitle: z.string().nullable().optional(),
    Address: z.string().nullable().optional(),
    City: z.string().nullable().optional(),
    Region: z.string().nullable().optional(),
    PostalCode: z.string().nullable().optional(),
    Country: z.string().nullable().optional(),
    Phone: z.string().nullable().optional(),
    Fax: z.string().nullable().optional(),
    HomePage: z.string().nullable().optional(),
});

export const productsSchema = z.object({
    Id: z.number(),
    ProductName: z.string(),
    SupplierId: z.number().nullable().optional(),
    CategoryId: z.number().nullable().optional(),
    QuantityPerUnit: z.string().nullable().optional(),
    UnitPrice: z.number().nullable().optional(),
    UnitsInStock: z.number().nullable().optional(),
    UnitsOnOrder: z.number().nullable().optional(),
    ReorderLevel: z.number().nullable().optional(),
    Discontinued: z.number().or(z.boolean()), // Some versions use 0/1, others boolean
});

export const customersSchema = z.object({
    Id: z.string(),
    CompanyName: z.string(),
    ContactName: z.string().nullable().optional(),
    ContactTitle: z.string().nullable().optional(),
    Address: z.string().nullable().optional(),
    City: z.string().nullable().optional(),
    Region: z.string().nullable().optional(),
    PostalCode: z.string().nullable().optional(),
    Country: z.string().nullable().optional(),
    Phone: z.string().nullable().optional(),
    Fax: z.string().nullable().optional(),
});

export const employeesSchema = z.object({
    Id: z.number(),
    LastName: z.string(),
    FirstName: z.string(),
    Title: z.string().nullable().optional(),
    TitleOfCourtesy: z.string().nullable().optional(),
    BirthDate: z.string().or(z.date()).nullable().optional(),
    HireDate: z.string().or(z.date()).nullable().optional(),
    Address: z.string().nullable().optional(),
    City: z.string().nullable().optional(),
    Region: z.string().nullable().optional(),
    PostalCode: z.string().nullable().optional(),
    Country: z.string().nullable().optional(),
    HomePhone: z.string().nullable().optional(),
    Extension: z.string().nullable().optional(),
    Photo: z.instanceof(Buffer).nullable().optional(),
    Notes: z.string().nullable().optional(),
    ReportsTo: z.number().nullable().optional(),
    PhotoPath: z.string().nullable().optional(),
});

export const shippersSchema = z.object({
    Id: z.number(),
    CompanyName: z.string(),
    Phone: z.string().nullable().optional(),
});

export const ordersSchema = z.object({
    Id: z.number(),
    CustomerId: z.string().nullable().optional(),
    EmployeeId: z.number().nullable().optional(),
    OrderDate: z.string().or(z.date()).nullable().optional(),
    RequiredDate: z.string().or(z.date()).nullable().optional(),
    ShippedDate: z.string().or(z.date()).nullable().optional(),
    ShipVia: z.number().nullable().optional(),
    Freight: z.number().nullable().optional(),
    ShipName: z.string().nullable().optional(),
    ShipAddress: z.string().nullable().optional(),
    ShipCity: z.string().nullable().optional(),
    ShipRegion: z.string().nullable().optional(),
    ShipPostalCode: z.string().nullable().optional(),
    ShipCountry: z.string().nullable().optional(),
});

export const orderDetailsSchema = z.object({
    OrderId: z.number(),
    ProductId: z.number(),
    UnitPrice: z.number(),
    Quantity: z.number(),
    Discount: z.number(),
});

export type Region = z.infer<typeof regionSchema>;
export type Territory = z.infer<typeof territoriesSchema>;
export type Category = z.infer<typeof categoriesSchema>;
export type Supplier = z.infer<typeof suppliersSchema>;
export type Product = z.infer<typeof productsSchema>;
export type Customer = z.infer<typeof customersSchema>;
export type Employee = z.infer<typeof employeesSchema>;
export type Shipper = z.infer<typeof shippersSchema>;
export type Order = z.infer<typeof ordersSchema>;
export type OrderDetail = z.infer<typeof orderDetailsSchema>;
