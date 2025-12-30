
import { Type, FunctionDeclaration } from "@google/genai";

// Helper for nullable string
const nullableString = { type: Type.STRING, nullable: true };
const nullableNumber = { type: Type.NUMBER, nullable: true };
const nullableBoolean = { type: Type.BOOLEAN, nullable: true };

// Product Schema
const productSchema = {
    type: Type.OBJECT,
    properties: {
        Id: { type: Type.NUMBER },
        ProductName: { type: Type.STRING },
        SupplierId: nullableNumber,
        CategoryId: nullableNumber,
        QuantityPerUnit: nullableString,
        UnitPrice: nullableNumber,
        UnitsInStock: nullableNumber,
        UnitsOnOrder: nullableNumber,
        ReorderLevel: nullableNumber,
        Discontinued: { type: Type.BOOLEAN, nullable: true }, // Simplifying to boolean
    },
    required: ['Id', 'ProductName'], // Minimal requirements based on DB schema which has non-nullable generic fields
};

// Order Schema
const orderSchema = {
    type: Type.OBJECT,
    properties: {
        Id: { type: Type.NUMBER },
        CustomerId: { type: Type.STRING },
        EmployeeId: { type: Type.NUMBER },
        OrderDate: { type: Type.STRING },
        RequiredDate: { type: Type.STRING },
        ShippedDate: { type: Type.STRING },
        ShipVia: { type: Type.NUMBER },
        Freight: { type: Type.NUMBER },
        ShipName: { type: Type.STRING },
        ShipAddress: { type: Type.STRING },
        ShipCity: { type: Type.STRING },
        ShipRegion: { type: Type.STRING },
        ShipPostalCode: { type: Type.STRING },
        ShipCountry: { type: Type.STRING },
    },
    required: ['Id', 'CustomerId', 'EmployeeId', 'OrderDate'],
};

// Employee Schema
const employeeSchema = {
    type: Type.OBJECT,
    properties: {
        Id: { type: Type.NUMBER },
        LastName: { type: Type.STRING },
        FirstName: { type: Type.STRING },
        Title: { type: Type.STRING },
        TitleOfCourtesy: { type: Type.STRING },
        BirthDate: { type: Type.STRING },
        HireDate: { type: Type.STRING },
        Address: { type: Type.STRING },
        City: { type: Type.STRING },
        Region: { type: Type.STRING },
        PostalCode: { type: Type.STRING },
        Country: { type: Type.STRING },
        HomePhone: { type: Type.STRING },
        Extension: { type: Type.STRING },
        Notes: { type: Type.STRING },
        ReportsTo: { type: Type.NUMBER },
        PhotoPath: { type: Type.STRING },
    },
    required: ['Id', 'LastName', 'FirstName'],
};

// Customer Schema
const customerSchema = {
    type: Type.OBJECT,
    properties: {
        Id: { type: Type.STRING },
        CompanyName: { type: Type.STRING },
        ContactName: { type: Type.STRING },
        ContactTitle: { type: Type.STRING },
        Address: { type: Type.STRING },
        City: { type: Type.STRING },
        Region: { type: Type.STRING },
        PostalCode: { type: Type.STRING },
        Country: { type: Type.STRING },
        Phone: { type: Type.STRING },
        Fax: { type: Type.STRING },
    },
    required: ['Id', 'CompanyName'],
};


export const displayContentToolDeclaration: FunctionDeclaration = {
    name: 'display_content',
    description: 'Display content cards to the user such as products, orders, employees, or customers. Use this tool whenever you want to show details to the user.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            type: {
                type: Type.STRING,
                enum: ['product', 'products', 'order', 'orders', 'employee', 'employees', 'customer', 'customers', 'text_response'],
                description: 'The type of content to display',
            },
            // Product(s)
            product: { ...productSchema, description: 'Single product details', nullable: true },
            products: { type: Type.ARRAY, items: productSchema, description: 'List of products', nullable: true },

            // Order(s)
            order: { ...orderSchema, description: 'Single order details', nullable: true },
            orders: { type: Type.ARRAY, items: orderSchema, description: 'List of orders', nullable: true },

            // Employee(s)
            employee: { ...employeeSchema, description: 'Single employee details', nullable: true },
            employees: { type: Type.ARRAY, items: employeeSchema, description: 'List of employees', nullable: true },

            // Customer(s)
            customer: { ...customerSchema, description: 'Single customer details', nullable: true },
            customers: { type: Type.ARRAY, items: customerSchema, description: 'List of customers', nullable: true },

            // Text content
            content: { type: Type.STRING, description: 'Text content for text_response type', nullable: true },
        },
        required: ['type'],
    },
};

export const displayContentToolExecutor = (args: any) => {
    console.log('Displaying content:', args.type);
    return { status: 'success', message: `Displayed ${args.type} to user` };
};
