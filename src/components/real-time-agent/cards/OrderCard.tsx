import { ordersSchema } from '@/db/schema';
import { ShoppingCart, Calendar, MapPin, Truck } from 'lucide-react';
import { z } from 'zod';

interface OrderCardProps {
    order: z.infer<typeof ordersSchema>;
}

export const OrderCard = ({ order }: OrderCardProps) => {
    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold leading-none tracking-tight text-lg">Order #{order.Id}</h3>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-medium">
                                {order.CustomerId}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.OrderDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="shrink-0 bg-blue-500/10 p-2 rounded-full">
                        <ShoppingCart className="w-5 h-5 text-blue-500" />
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs font-medium uppercase mb-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Freight
                        </span>
                        <span className="text-lg font-bold">${order.Freight?.toFixed(2) ?? '0.00'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs font-medium uppercase mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Ship To
                        </span>
                        <span className="text-sm font-medium truncate" title={order.ShipCountry}>
                            {order.ShipCity}, {order.ShipCountry}
                        </span>
                    </div>
                </div>

                {/* Details Footer */}
                <div className="bg-muted/50 -mx-4 -mb-4 px-4 py-3 mt-2 text-sm space-y-1 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs">Ship Name:</span>
                        <span className="font-medium truncate ml-2 text-xs">{order.ShipName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs">Required:</span>
                        <span className="font-medium truncate ml-2 text-xs">{new Date(order.RequiredDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
