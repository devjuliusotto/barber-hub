import { useState, useMemo } from "react";
import {
  useListAppointments,
  useCreateClient,
  useCreateAppointment,
  getListAppointmentsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetDashboardScheduleQueryKey,
  getGetRevenueChartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock, ChevronRight, ChevronLeft, Calendar, User, Scissors, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Service = { id: number; name: string; price: number; durationMinutes: number; description?: string | null };
type Barber = { id: number; name: string; nationalityFlag?: string; nationality?: string; rating?: number; avatarUrl?: string | null };

interface Props {
  open: boolean;
  onClose: () => void;
  barbershopId: number;
  barbershopName: string;
  services: Service[];
  barbers: Barber[];
  preselectedServiceId?: number;
  preselectedBarberId?: number;
}

type Step = "service" | "barber" | "datetime" | "details" | "success";

const BUSINESS_HOURS = { start: 9, end: 19 };
const SLOT_DURATION = 30;

function generateSlots(date: Date, durationMinutes: number, takenSlots: string[]): string[] {
  const slots: string[] = [];
  const day = date.getDay(); // 0 = Sunday, 1 = Monday
  if (day === 0 || day === 1) return []; // Closed Sun/Mon

  const dateStr = date.toISOString().split("T")[0];
  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
    for (let m = 0; m < 60; m += SLOT_DURATION) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const isoStr = `${dateStr}T${timeStr}:00`;
      // Check if this slot conflicts with any taken slot (considering service duration)
      const slotMs = new Date(isoStr).getTime();
      const taken = takenSlots.some(ts => {
        const takenMs = new Date(ts).getTime();
        return Math.abs(slotMs - takenMs) < durationMinutes * 60 * 1000;
      });
      if (!taken) slots.push(isoStr);
    }
  }
  return slots;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
}

function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d = new Date(today);
  d.setDate(d.getDate() + 1); // Start from tomorrow
  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 1) days.push(new Date(d)); // Skip Sun/Mon
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const STEP_ORDER: Step[] = ["service", "barber", "datetime", "details", "success"];

const STEP_LABELS: Record<Step, string> = {
  service: "Service",
  barber: "Barber",
  datetime: "Date & Time",
  details: "Your Details",
  success: "Confirmed",
};

export function BookingModal({
  open,
  onClose,
  barbershopId,
  barbershopName,
  services,
  barbers,
  preselectedServiceId,
  preselectedBarberId,
}: Props) {
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>(preselectedServiceId ? (preselectedBarberId ? "datetime" : "barber") : "service");
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>(preselectedServiceId);
  const [selectedBarberId, setSelectedBarberId] = useState<number | undefined>(preselectedBarberId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<number | undefined>();

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedBarber = barbers.find(b => b.id === selectedBarberId);

  const { data: existingAppointments } = useListAppointments(
    { barbershopId, barberId: selectedBarberId },
    { query: { enabled: !!selectedBarberId, queryKey: getListAppointmentsQueryKey({ barbershopId, barberId: selectedBarberId }) } }
  );

  const availableDays = useMemo(() => getNextDays(14), []);

  const takenSlots = useMemo(
    () => (existingAppointments ?? [])
      .filter(a => a.status !== "cancelled" && a.status !== "no_show")
      .map(a => a.scheduledAt),
    [existingAppointments]
  );

  const slotsForDay = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    return generateSlots(selectedDate, selectedService.durationMinutes, takenSlots);
  }, [selectedDate, selectedService, takenSlots]);

  const createClient = useCreateClient();
  const createAppointment = useCreateAppointment();

  function resetAndClose() {
    setStep(preselectedServiceId ? (preselectedBarberId ? "datetime" : "barber") : "service");
    setSelectedServiceId(preselectedServiceId);
    setSelectedBarberId(preselectedBarberId);
    setSelectedDate(undefined);
    setSelectedSlot(undefined);
    setName("");
    setPhone("");
    setSubmitting(false);
    setBookedAppointmentId(undefined);
    onClose();
  }

  async function handleConfirm() {
    if (!selectedServiceId || !selectedBarberId || !selectedSlot || !selectedService) return;
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const client = await createClient.mutateAsync({
        data: { name: name.trim(), phone: phone.trim() || undefined, barbershopId },
      });
      const appt = await createAppointment.mutateAsync({
        data: {
          clientId: client.id,
          barberId: selectedBarberId,
          serviceId: selectedServiceId,
          barbershopId,
          scheduledAt: selectedSlot,
          price: selectedService.price,
        },
      });
      setBookedAppointmentId(appt.id);
      await qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey({ barbershopId }) });
      await qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey({ barbershopId }) });
      await qc.invalidateQueries({ queryKey: getGetDashboardScheduleQueryKey({ barbershopId }) });
      await qc.invalidateQueries({ queryKey: getGetRevenueChartQueryKey({ barbershopId }) });
      setStep("success");
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const visibleSteps = STEP_ORDER.filter(s => s !== "success");

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) resetAndClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Book Appointment at {barbershopName}</DialogTitle>

        {step !== "success" && (
          <div className="px-6 pt-6 pb-4 border-b">
            <h2 className="font-bold text-lg mb-4">Book at {barbershopName}</h2>
            <div className="flex gap-1">
              {visibleSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors",
                    i < stepIndex ? "bg-primary text-primary-foreground" :
                    i === stepIndex ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-xs font-medium truncate hidden sm:block",
                    i === stepIndex ? "text-foreground" : "text-muted-foreground"
                  )}>{STEP_LABELS[s]}</span>
                  {i < visibleSteps.length - 1 && (
                    <div className={cn("h-px flex-1 mx-1", i < stepIndex ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* ── Step 1: Service ── */}
          {step === "service" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Scissors className="h-4 w-4 text-primary" /> Choose a service
              </h3>
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedServiceId(s.id); setStep("barber"); }}
                  className={cn(
                    "w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                    selectedServiceId === s.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {s.durationMinutes} min
                      {s.description && <span className="hidden sm:inline"> · {s.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">€{s.price.toFixed(0)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Barber ── */}
          {step === "barber" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" /> Choose your barber
              </h3>
              {barbers.filter(b => b.rating !== undefined ? true : true).map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBarberId(b.id); setStep("datetime"); }}
                  className={cn(
                    "w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                    selectedBarberId === b.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={b.avatarUrl || ""} />
                    <AvatarFallback className="font-bold">{b.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-2">
                      {b.name}
                      {b.nationalityFlag && <span className="text-base">{b.nationalityFlag}</span>}
                    </div>
                    {b.rating ? (
                      <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                        <Star className="h-3.5 w-3.5 text-primary mr-1" fill="currentColor" />
                        {b.rating.toFixed(1)} rating
                      </div>
                    ) : null}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* ── Step 3: Date & Time ── */}
          {step === "datetime" && (
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" /> Pick a date
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
                {availableDays.map(day => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = day.getDate();
                  const mon = day.toLocaleDateString("en-US", { month: "short" });
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => { setSelectedDate(day); setSelectedSlot(undefined); }}
                      className={cn(
                        "shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border-2 min-w-[60px] transition-all",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-xs font-medium uppercase tracking-wide">{dayName}</span>
                      <span className="text-xl font-bold leading-tight">{dayNum}</span>
                      <span className="text-xs opacity-70">{mon}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-5">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                    Available times — {formatDate(selectedDate)}
                  </h3>
                  {slotsForDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No available slots for this day.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slotsForDay.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "py-2 px-1 rounded-lg border text-sm font-medium transition-all text-center",
                            selectedSlot === slot
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-accent"
                          )}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("barber")} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => setStep("details")}
                  disabled={!selectedSlot}
                  className="flex-1"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Details ── */}
          {step === "details" && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="font-semibold text-base mb-3">Booking Summary</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barber</span>
                  <span className="font-medium">{selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDate ? formatDate(selectedDate) : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedSlot ? formatTime(selectedSlot) : ""}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">€{selectedService?.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Your information</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">Full name *</Label>
                  <Input
                    id="booking-name"
                    placeholder="e.g. João Santos"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone">Phone number (optional)</Label>
                  <Input
                    id="booking-phone"
                    placeholder="+49 170 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("datetime")} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!name.trim() || submitting}
                  className="flex-1"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Success ── */}
          {step === "success" && (
            <div className="py-4 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-2xl">You're booked!</h3>
                <p className="text-muted-foreground mt-1">Your appointment has been confirmed.</p>
              </div>

              <div className="w-full bg-muted/50 rounded-xl p-4 text-sm text-left space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shop</span>
                  <span className="font-medium">{barbershopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barber</span>
                  <span className="font-medium">{selectedBarber?.name} {selectedBarber?.nationalityFlag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">When</span>
                  <span className="font-medium">
                    {selectedDate ? formatDate(selectedDate) : ""}{selectedSlot ? ` at ${formatTime(selectedSlot)}` : ""}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">€{selectedService?.price.toFixed(2)}</span>
                </div>
                {bookedAppointmentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ref</span>
                    <Badge variant="outline">#{String(bookedAppointmentId).padStart(5, "0")}</Badge>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                See you soon, {name}! The barbershop will confirm your appointment.
              </p>

              <Button onClick={resetAndClose} className="w-full mt-2">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
