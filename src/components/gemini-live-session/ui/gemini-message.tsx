import { GeminiMessage, ToolCallContent } from '../types';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { OrderCard } from '@/components/real-time-agent/cards/OrderCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';

interface GeminiMessageProps {
  message: GeminiMessage;
}

export function GeminiMessageItem({ message }: GeminiMessageProps) {
  const isUser = message.role === 'user';

  if (message.type === 'text') {
    const textContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

    return (
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-secondary-foreground rounded-bl-md border border-border"
        )}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === 'tool_call' && message.content) {
    const content = message.content as ToolCallContent;

    if (content.name !== 'display_content') {
      return null;
    }

    return (
      <div className="flex justify-start">
        <div className="max-w-full">
          {renderToolResult(content.name, content.args)}
        </div>
      </div>
    );
  }

  return null;
}

function renderToolResult(name: string, result: any) {
  if (name === 'display_content') {
    // Single items
    if (result.type === 'product' && result.product) {
      return <ProductCard product={result.product} />;
    }
    if (result.type === 'order' && result.order) {
      return <OrderCard order={result.order} />;
    }
    if (result.type === 'employee' && result.employee) {
      return <EmployeeCard employee={result.employee} />;
    }
    if (result.type === 'customer' && result.customer) {
      return <CustomerCard customer={result.customer} />;
    }

    // Arrays - horizontal scroll on mobile
    if (result.type === 'products' && result.products) {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {result.products.map((p: any) => (
            <div key={p.Id} className="flex-none snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      );
    }
    if (result.type === 'orders' && result.orders) {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {result.orders.map((o: any) => (
            <div key={o.Id} className="flex-none snap-start">
              <OrderCard order={o} />
            </div>
          ))}
        </div>
      );
    }
    if (result.type === 'employees' && result.employees) {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {result.employees.map((e: any) => (
            <div key={e.Id} className="flex-none snap-start">
              <EmployeeCard employee={e} />
            </div>
          ))}
        </div>
      );
    }
    if (result.type === 'customers' && result.customers) {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {result.customers.map((c: any) => (
            <div key={c.Id} className="flex-none snap-start">
              <CustomerCard customer={c} />
            </div>
          ))}
        </div>
      );
    }

    // Text response
    if (result.type === 'text_response' && result.text) {
      return (
        <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-2.5 border border-border">
          <p className="text-[15px] leading-relaxed">{result.text}</p>
        </div>
      );
    }
  }

  // Fallback JSON for debugging
  return (
    <div className="text-xs bg-muted p-3 rounded-lg text-muted-foreground font-mono overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto border">
      {JSON.stringify(result, null, 2)}
    </div>
  );
}
