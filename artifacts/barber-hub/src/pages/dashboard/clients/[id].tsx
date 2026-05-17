import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useGetClient,
  useListAppointments,
  useUpdateAppointment,
  getGetClientQueryKey,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoyaltyCard, TierBadge } from "@/components/LoyaltyCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400",
  completed: "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400",
  cancelled: "bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400",
  no_show:   "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
};

export default function DashboardClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id, 10);
  const barbershopId = 1;
  const qc = useQueryClient();

  const { data: client, isLoading } = useGetClient(clientId, {
    query: { enabled: !!clientId, queryKey: getGetClientQueryKey(clientId) },
  });

  const { data: appointments } = useListAppointments(
    { clientId, barbershopId },
    { query: { enabled: !!clientId, queryKey: getListAppointmentsQueryKey({ clientId, barbershopId }) } }
  );

  const updateAppointment = useUpdateAppointment();

  async function handleStatusChange(apptId: number, status: string) {
    await updateAppointment.mutateAsync({ id: apptId, data: { status: status as "pending" | "confirmed" | "completed" | "cancelled" | "no_show" } });
    await qc.invalidateQueries({ queryKey: getGetClientQueryKey(clientId) });
    await qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey({ clientId, barbershopId }) });
  }

  if (isLoading || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const pts = client.loyaltyPoints ?? 0;
  const completedAppts = appointments?.filter(a => a.status === "completed") ?? [];
  const upcomingAppts = appointments?.filter(a => a.status === "pending" || a.status === "confirmed") ?? [];

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
        {/* Left column */}
        <div className="space-y-6 md:col-span-1">
          {/* Profile card */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={client.avatarUrl || ""} />
                <AvatarFallback className="text-2xl font-bold">{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="font-display text-2xl font-bold">{client.name}</h2>
              <div className="flex items-center justify-center mt-2">
                <TierBadge points={pts} className="text-sm px-3 py-1" />
              </div>
              {/* WhatsApp quick-contact */}
              {client.phone && (
                <div className="mt-4">
                  <WhatsAppButton
                    appointment={{
                      clientName: client.name,
                      clientPhone: client.phone,
                      serviceName: null,
                      barberName: null,
                      barbershopName: "Barber Hub",
                      scheduledAt: new Date().toISOString(),
                      price: 0,
                      loyaltyPoints: pts,
                    }}
                    templates={["reminder", "thankyou"]}
                    size="default"
                    className="w-full justify-center"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loyalty card */}
          <LoyaltyCard points={pts} />

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">{client.phone}</a>
                ) : (
                  "No phone provided"
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.birthdate
                  ? format(new Date(client.birthdate), "MMMM d, yyyy")
                  : "No birthdate provided"}
              </div>
              {client.notes && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground mt-2">
                  {client.notes}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Visits", value: client.totalVisits ?? 0 },
                { label: "Total Spent", value: `€${(client.totalSpent ?? 0).toFixed(2)}` },
                { label: "Completed", value: completedAppts.length },
                { label: "Upcoming", value: upcomingAppts.length },
                { label: "Loyalty Points", value: `${pts} pts` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1 border-b last:border-0">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className="font-semibold tabular-nums">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-6">
          {/* Upcoming appointments */}
          {upcomingAppts.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppts.map(apt => {
                  const waData = {
                    clientName: client.name,
                    clientPhone: client.phone ?? null,
                    serviceName: apt.serviceName,
                    barberName: apt.barberName,
                    barbershopName: apt.barbershopName,
                    scheduledAt: apt.scheduledAt,
                    price: apt.price,
                    loyaltyPoints: pts,
                  };
                  return (
                    <div key={apt.id} className="flex items-center justify-between rounded-xl bg-background border p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{apt.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.scheduledAt), "MMM d, yyyy 'at' HH:mm")} · {apt.barberName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold">€{apt.price.toFixed(0)}</span>
                        <WhatsAppButton
                          appointment={waData}
                          templates={apt.status === "confirmed" ? ["confirmation", "reminder"] : ["confirmation"]}
                        />
                        {apt.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleStatusChange(apt.id, "completed")}
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Full history */}
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
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Msg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!appointments?.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments
                      .slice()
                      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                      .map(apt => {
                        const waData = {
                          clientName: client.name,
                          clientPhone: client.phone ?? null,
                          serviceName: apt.serviceName,
                          barberName: apt.barberName,
                          barbershopName: apt.barbershopName,
                          scheduledAt: apt.scheduledAt,
                          price: apt.price,
                          loyaltyPoints: pts,
                          pointsEarned: Math.floor(apt.price),
                        };
                        return (
                          <TableRow key={apt.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(apt.scheduledAt), "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>{apt.serviceName ?? "—"}</TableCell>
                            <TableCell>{apt.barberName ?? "—"}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                STATUS_STYLES[apt.status] ?? "bg-muted text-muted-foreground"
                              )}>
                                {apt.status.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              €{apt.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {apt.status === "completed" ? (
                                <span className="text-xs font-semibold text-amber-600 tabular-nums">
                                  +{Math.floor(apt.price)} pts
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {apt.status !== "cancelled" && apt.status !== "no_show" && (
                                <WhatsAppButton
                                  appointment={waData}
                                  templates={
                                    apt.status === "completed" ? ["thankyou"] :
                                    apt.status === "confirmed" ? ["confirmation", "reminder"] :
                                    ["confirmation"]
                                  }
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
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
