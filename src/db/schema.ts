
import { z } from 'zod';

export const regionSchema = z.object({
    regionId: z.number(),
    regionDescription: z.string(),
});

export const territoriesSchema = z.object({
    territoryId: z.string(),
    territoryDescription: z.string(),
    regionId: z.number(),
});

export const categoriesSchema = z.object({
    categoryId: z.number(),
    categoryName: z.string(),
    description: z.string().nullable().optional(),
    picture: z.instanceof(Buffer).nullable().optional(), // Or z.string() if base64
});

export const suppliersSchema = z.object({
    supplierId: z.number(),
    companyName: z.string(),
    contactName: z.string().nullable().optional(),
    contactTitle: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
    homePage: z.string().nullable().optional(),
});

export const productsSchema = z.object({
    productId: z.number(),
    productName: z.string(),
    supplierId: z.number().nullable().optional(),
    categoryId: z.number().nullable().optional(),
    quantityPerUnit: z.string().nullable().optional(),
    unitPrice: z.number().nullable().optional(),
    unitsInStock: z.number().nullable().optional(),
    unitsOnOrder: z.number().nullable().optional(),
    reorderLevel: z.number().nullable().optional(),
    discontinued: z.number().or(z.boolean()), // Some versions use 0/1, others boolean
});

export const customersSchema = z.object({
    customerId: z.string(),
    companyName: z.string(),
    contactName: z.string().nullable().optional(),
    contactTitle: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
});

export const employeesSchema = z.object({
    employeeId: z.number(),
    lastName: z.string(),
    firstName: z.string(),
    title: z.string().nullable().optional(),
    titleOfCourtesy: z.string().nullable().optional(),
    birthDate: z.string().or(z.date()).nullable().optional(),
    hireDate: z.string().or(z.date()).nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    homePhone: z.string().nullable().optional(),
    extension: z.string().nullable().optional(),
    photo: z.instanceof(Buffer).nullable().optional(),
    notes: z.string().nullable().optional(),
    reportsTo: z.number().nullable().optional(),
    photoPath: z.string().nullable().optional(),
});

export const shippersSchema = z.object({
    shipperId: z.number(),
    companyName: z.string(),
    phone: z.string().nullable().optional(),
});

export const ordersSchema = z.object({
    orderId: z.number(),
    customerId: z.string().nullable().optional(),
    employeeId: z.number().nullable().optional(),
    orderDate: z.string().or(z.date()).nullable().optional(),
    requiredDate: z.string().or(z.date()).nullable().optional(),
    shippedDate: z.string().or(z.date()).nullable().optional(),
    shipVia: z.number().nullable().optional(),
    freight: z.number().nullable().optional(),
    shipName: z.string().nullable().optional(),
    shipAddress: z.string().nullable().optional(),
    shipCity: z.string().nullable().optional(),
    shipRegion: z.string().nullable().optional(),
    shipPostalCode: z.string().nullable().optional(),
    shipCountry: z.string().nullable().optional(),
});

export const orderDetailsSchema = z.object({
    orderId: z.number(),
    productId: z.number(),
    unitPrice: z.number(),
    quantity: z.number(),
    discount: z.number(),
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
