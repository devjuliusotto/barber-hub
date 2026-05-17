import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useListAppointments,
  useUpdateAppointment,
  getListAppointmentsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetDashboardScheduleQueryKey,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

const BARBERSHOP_ID = 1;

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400",
  completed: "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400",
  cancelled: "bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400",
  no_show:   "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
};

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export default function DashboardAppointments() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: appointments, isLoading } = useListAppointments(
    { barbershopId: BARBERSHOP_ID, status: statusFilter === "all" ? undefined : statusFilter },
    { query: { queryKey: getListAppointmentsQueryKey({ barbershopId: BARBERSHOP_ID, status: statusFilter === "all" ? undefined : statusFilter }) } }
  );

  const updateAppointment = useUpdateAppointment();

  async function handleStatusUpdate(id: number, status: string) {
    await updateAppointment.mutateAsync({ id, data: { status: status as "pending" | "confirmed" | "completed" | "cancelled" | "no_show" } });
    toast({ title: "Appointment updated", description: `Status changed to ${status}.` });
    await qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey({ barbershopId: BARBERSHOP_ID }) });
    await qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey({ barbershopId: BARBERSHOP_ID }) });
    await qc.invalidateQueries({ queryKey: getGetDashboardScheduleQueryKey({ barbershopId: BARBERSHOP_ID }) });
  }

  const sorted = appointments?.slice().sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const pendingCount = appointments?.filter(a => a.status === "pending").length ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule and send WhatsApp reminders.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-semibold">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No show</SelectItem>
            </SelectContent>
          </Select>
          <Button>New Appointment</Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Barber</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading appointments...
                </TableCell>
              </TableRow>
            ) : sorted?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              sorted?.map(apt => {
                const isActive = apt.status === "pending" || apt.status === "confirmed";
                const whatsappData = {
                  clientName: apt.clientName,
                  clientPhone: apt.clientPhone,
                  serviceName: apt.serviceName,
                  barberName: apt.barberName,
                  barbershopName: apt.barbershopName,
                  scheduledAt: apt.scheduledAt,
                  price: apt.price,
                };

                return (
                  <TableRow key={apt.id} className={cn(!isActive && "opacity-60")}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm">{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(apt.scheduledAt), "HH:mm")}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{apt.clientName ?? "—"}</div>
                      {apt.clientPhone && (
                        <div className="text-xs text-muted-foreground">{apt.clientPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{apt.serviceName ?? "—"}</TableCell>
                    <TableCell className="text-sm">{apt.barberName ?? "—"}</TableCell>
                    <TableCell className="font-semibold tabular-nums">€{apt.price.toFixed(0)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        STATUS_STYLES[apt.status] ?? "bg-muted text-muted-foreground"
                      )}>
                        {apt.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp button — always visible for active appointments */}
                        {isActive && (
                          <WhatsAppButton
                            appointment={whatsappData}
                            templates={apt.status === "confirmed" ? ["confirmation", "reminder"] : ["confirmation"]}
                          />
                        )}
                        {apt.status === "completed" && (
                          <WhatsAppButton
                            appointment={{ ...whatsappData, pointsEarned: Math.floor(apt.price) }}
                            templates={["thankyou"]}
                          />
                        )}

                        {/* Status action buttons */}
                        {apt.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(apt.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                        )}
                        {apt.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(apt.id, "completed")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Done
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(apt.id, "cancelled")}
                            title="Cancel appointment"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
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
