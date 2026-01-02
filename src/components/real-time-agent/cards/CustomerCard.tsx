import { customersSchema } from '@/db/schema';
import { Building2, UserCircle, Phone, Globe } from 'lucide-react';
import { z } from 'zod';

interface CustomerCardProps {
    customer: z.infer<typeof customersSchema>;
}

export const CustomerCard = ({ customer }: CustomerCardProps) => {
    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm w-72 sm:w-80 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-tight text-lg">{customer.CompanyName}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{customer.Id}</p>
                    </div>
                    <div className="shrink-0 bg-primary/10 p-2 rounded-full">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Contact info grid */}
                <div className="grid gap-2 text-sm mt-2">
                    <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{customer.ContactName}</span>
                        <span className="text-muted-foreground text-xs border-l pl-2 ml-1">{customer.ContactTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{customer.Phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex flex-col text-xs text-muted-foreground">
                            <span className="text-foreground text-sm">{customer.City}, {customer.Country}</span>
                            <span>{customer.Address}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
