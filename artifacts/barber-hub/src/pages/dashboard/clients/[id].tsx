import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetClient, useListAppointments } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Calendar, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id, 10);
  const barbershopId = 1; // Demo

  const { data: client, isLoading } = useGetClient(clientId, {
    query: { enabled: !!clientId, queryKey: ["getClient", clientId] }
  });

  const { data: appointments } = useListAppointments(
    { clientId, barbershopId },
    { query: { enabled: !!clientId, queryKey: ["listAppointments", "client", clientId] } }
  );

  if (isLoading || !client) return <DashboardLayout><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/clients">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={client.avatarUrl || ""} />
                <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="font-display text-2xl font-bold">{client.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Star className="h-3 w-3 mr-1" fill="currentColor" /> {client.loyaltyPoints || 0} Points
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {client.email || "No email provided"}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {client.phone || "No phone provided"}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {client.birthdate ? format(new Date(client.birthdate), "MMMM d, yyyy") : "No birthdate provided"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Visits</span>
                <span className="font-medium">{client.totalVisits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Spent</span>
                <span className="font-medium">€{(client.totalSpent || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No appointments found</TableCell>
                    </TableRow>
                  ) : (
                    appointments?.map(apt => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(apt.scheduledAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>{apt.serviceName}</TableCell>
                        <TableCell>{apt.barberName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{apt.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">€{apt.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
