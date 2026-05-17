import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListClients, getListClientsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { LoyaltyProgressBar, TierBadge } from "@/components/LoyaltyCard";

const BARBERSHOP_ID = 1;

export default function DashboardClients() {
  const [search, setSearch] = useState("");

  const { data: clients, isLoading } = useListClients(
    { barbershopId: BARBERSHOP_ID, q: search || undefined },
    { query: { queryKey: getListClientsQueryKey({ barbershopId: BARBERSHOP_ID, q: search || undefined }) } }
  );

  const totalPoints = clients?.reduce((sum, c) => sum + (c.loyaltyPoints ?? 0), 0) ?? 0;
  const loyalClients = clients?.filter(c => (c.loyaltyPoints ?? 0) >= 100).length ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and loyalty programme.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </div>

      {/* Loyalty summary strip */}
      {clients && clients.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Points in Circulation</p>
            <p className="text-2xl font-bold tabular-nums">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Loyal Clients (100+ pts)</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Users className="h-5 w-5" /> {loyalClients}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Loyalty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : clients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients?.map(client => {
                const pts = client.loyaltyPoints ?? 0;
                return (
                  <TableRow key={client.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={client.avatarUrl || ""} />
                          <AvatarFallback className="font-semibold">{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {client.lastVisit
                              ? `Last visit: ${new Date(client.lastVisit).toLocaleDateString("de-DE")}`
                              : "No visits yet"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.email || "—"}</div>
                      <div className="text-sm text-muted-foreground">{client.phone || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums">{client.totalVisits ?? 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums">€{(client.totalSpent ?? 0).toFixed(0)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5 min-w-[160px]">
                        <div className="flex items-center justify-between">
                          <TierBadge points={pts} />
                          <span className="text-xs text-muted-foreground tabular-nums">{pts} pts</span>
                        </div>
                        <LoyaltyProgressBar points={pts} compact />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
