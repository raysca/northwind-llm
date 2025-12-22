import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "./index.css";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-3xl font-bold">Northwind Store Assistant</CardTitle>
          <CardDescription>
            Ask questions about your orders and products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>TODO</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
