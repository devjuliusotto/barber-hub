import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListServices } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Clock, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BARBERSHOP_ID = 1;

export default function DashboardServices() {
  const { data: services, isLoading } = useListServices(
    { barbershopId: BARBERSHOP_ID },
    { query: { queryKey: ["listServices", BARBERSHOP_ID] } }
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your service menu and pricing.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading services...</TableCell>
              </TableRow>
            ) : services?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No services found.</TableCell>
              </TableRow>
            ) : (
              services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {service.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/50">{service.category || "General"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{service.durationMinutes} min</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">€{service.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {service.isActive !== false ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
