import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListAppointments, useUpdateAppointment } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const BARBERSHOP_ID = 1;

export default function DashboardAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useListAppointments(
    { barbershopId: BARBERSHOP_ID },
    { query: { queryKey: ["listAppointments", BARBERSHOP_ID] } }
  );

  const updateAppointment = useUpdateAppointment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Appointment updated" });
        queryClient.invalidateQueries({ queryKey: ["listAppointments", BARBERSHOP_ID] });
      }
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "confirmed": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Confirmed</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      case "no_show": return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">No Show</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleStatusUpdate = (id: number, status: any) => {
    updateAppointment.mutate({ id, data: { status } });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your shop's schedule and bookings.</p>
        </div>
        <Button>New Appointment</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Barber</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading appointments...</TableCell>
              </TableRow>
            ) : appointments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No appointments found.</TableCell>
              </TableRow>
            ) : (
              appointments?.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(apt.scheduledAt), "MMM d, HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell>{apt.clientName}</TableCell>
                  <TableCell>{apt.serviceName}</TableCell>
                  <TableCell>{apt.barberName}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {apt.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(apt.id, "confirmed")}>
                        Confirm
                      </Button>
                    )}
                    {apt.status === "confirmed" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(apt.id, "completed")}>
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Complete
                      </Button>
                    )}
                    {(apt.status === "pending" || apt.status === "confirmed") && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(apt.id, "cancelled")}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
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
