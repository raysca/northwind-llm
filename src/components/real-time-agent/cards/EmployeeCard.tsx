import { employeesSchema } from '@/db/schema';
import { User, Phone, MapPin, Briefcase } from 'lucide-react';
import { z } from 'zod';

interface EmployeeCardProps {
    employee: z.infer<typeof employeesSchema>;
}

export const EmployeeCard = ({ employee }: EmployeeCardProps) => {
    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm w-72 sm:w-80 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 space-y-4">
                {/* Header with Avatar Placeholder */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-tight">
                            {employee.FirstName} {employee.LastName}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {employee.Title}
                        </p>
                    </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span className="text-foreground">{employee.HomePhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-foreground">
                            {employee.City}, {employee.Country}
                        </span>
                    </div>
                </div>

                {/* Footer info */}
                <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                    <span>Ext: {employee.Extension}</span>
                    <span>ID: {employee.Id}</span>
                </div>
            </div>
        </div>
    );
};
