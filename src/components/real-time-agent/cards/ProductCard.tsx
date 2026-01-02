import { productsSchema } from '@/db/schema';
import { Package, DollarSign, Archive, Layers } from 'lucide-react';
import { z } from 'zod';

interface ProductCardProps {
    product: z.infer<typeof productsSchema>;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const isDiscontinued = product.Discontinued === 1 || product.Discontinued === true;

    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm w-72 sm:w-80 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight text-lg mb-1">{product.ProductName}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">#{product.Id}</p>
                    </div>
                    <div className="shrink-0 bg-primary/10 p-2 rounded-full">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Price & Stock Row */}
                <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs font-medium uppercase mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Price
                        </span>
                        <span className="text-lg font-bold">${product.UnitPrice?.toFixed(2) ?? 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs font-medium uppercase mb-1 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Stock
                        </span>
                        <span className={`text-lg font-bold ${product.UnitsInStock && product.UnitsInStock < 10 ? 'text-destructive' : ''}`}>
                            {product.UnitsInStock ?? 0}
                        </span>
                    </div>
                </div>

                {/* Details Footer */}
                <div className="bg-muted/50 -mx-4 -mb-4 px-4 py-3 mt-2 text-sm space-y-1 border-t">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit:</span>
                        <span className="font-medium truncate ml-2">{product.QuantityPerUnit}</span>
                    </div>
                    {isDiscontinued && (
                        <div className="flex justify-between items-center text-destructive font-medium">
                            <span className="flex items-center gap-1"><Archive className="w-3 h-3" /> Status:</span>
                            <span>Discontinued</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
