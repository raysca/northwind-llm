
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
    Description: z.string().nullable(),
});

export const suppliersSchema = z.object({
    Id: z.number(),
    CompanyName: z.string(),
    ContactName: z.string().nullable(),
    ContactTitle: z.string().nullable(),
    Address: z.string().nullable(),
    City: z.string().nullable(),
    Region: z.string().nullable(),
    PostalCode: z.string().nullable(),
    Country: z.string().nullable(),
    Phone: z.string().nullable(),
    Fax: z.string().nullable(),
    HomePage: z.string().nullable(),
});

export const productsSchema = z.object({
    Id: z.number(),
    ProductName: z.string(),
    SupplierId: z.number().nullable(),
    CategoryId: z.number().nullable(),
    QuantityPerUnit: z.string().nullable(),
    UnitPrice: z.number().nullable(),
    UnitsInStock: z.number().nullable(),
    UnitsOnOrder: z.number().nullable(),
    ReorderLevel: z.number().nullable(),
    Discontinued: z.number().or(z.boolean()), // Some versions use 0/1, others boolean
});

export const customersSchema = z.object({
    Id: z.string(),
    CompanyName: z.string(),
    ContactName: z.string(),
    ContactTitle: z.string(),
    Address: z.string(),
    City: z.string(),
    Region: z.string(),
    PostalCode: z.string(),
    Country: z.string(),
    Phone: z.string(),
    Fax: z.string(),
});

export const employeesSchema = z.object({
    Id: z.number(),
    LastName: z.string(),
    FirstName: z.string(),
    Title: z.string(),
    TitleOfCourtesy: z.string(),
    BirthDate: z.string(),
    HireDate: z.string(),
    Address: z.string(),
    City: z.string(),
    Region: z.string(),
    PostalCode: z.string(),
    Country: z.string(),
    HomePhone: z.string(),
    Extension: z.string(),
    Notes: z.string(),
    ReportsTo: z.number(),
    PhotoPath: z.string(),
});

export const shippersSchema = z.object({
    Id: z.number(),
    CompanyName: z.string(),
    Phone: z.string().nullable(),
});

export const ordersSchema = z.object({
    Id: z.number(),
    CustomerId: z.string(),
    EmployeeId: z.number(),
    OrderDate: z.string(),
    RequiredDate: z.string(),
    ShippedDate: z.string(),
    ShipVia: z.number(),
    Freight: z.number(),
    ShipName: z.string(),
    ShipAddress: z.string(),
    ShipCity: z.string(),
    ShipRegion: z.string(),
    ShipPostalCode: z.string(),
    ShipCountry: z.string(),
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
