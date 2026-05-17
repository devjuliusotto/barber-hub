import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListClients } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const BARBERSHOP_ID = 1;

export default function DashboardClients() {
  const [search, setSearch] = useState("");
  
  const { data: clients, isLoading } = useListClients(
    { barbershopId: BARBERSHOP_ID, q: search || undefined },
    { query: { queryKey: ["listClients", BARBERSHOP_ID, search] } }
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and CRM.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search clients..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading clients...</TableCell>
              </TableRow>
            ) : clients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No clients found.</TableCell>
              </TableRow>
            ) : (
              clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={client.avatarUrl || ""} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.lastVisit ? `Last visit: ${new Date(client.lastVisit).toLocaleDateString()}` : 'No visits yet'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{client.email || "-"}</div>
                    <div className="text-sm text-muted-foreground">{client.phone || "-"}</div>
                  </TableCell>
                  <TableCell>{client.totalVisits || 0}</TableCell>
                  <TableCell>€{(client.totalSpent || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
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
