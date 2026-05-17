export interface AppointmentForWhatsApp {
  clientName: string | null;
  clientPhone?: string | null;
  serviceName: string | null;
  barberName: string | null;
  barbershopName: string | null;
  scheduledAt: string;
  price: number;
  loyaltyPoints?: number;
  pointsEarned?: number;
}

export type WhatsAppTemplate = "confirmation" | "reminder" | "thankyou";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

export function buildMessage(template: WhatsAppTemplate, appt: AppointmentForWhatsApp): string {
  const name = appt.clientName ?? "there";
  const service = appt.serviceName ?? "your appointment";
  const barber = appt.barberName ?? "your barber";
  const shop = appt.barbershopName ?? "our shop";
  const when = formatDateTime(appt.scheduledAt);

  switch (template) {
    case "confirmation":
      return (
        `Hi ${name}! 💈\n\n` +
        `Your appointment has been *confirmed*:\n\n` +
        `• Service: *${service}*\n` +
        `• Barber: *${barber}*\n` +
        `• When: *${when}*\n` +
        `• Price: *€${appt.price.toFixed(2)}*\n\n` +
        `We look forward to seeing you at *${shop}*! If you need to reschedule, please let us know as soon as possible.\n\nSee you soon! ✂️`
      );

    case "reminder":
      return (
        `Hi ${name}! 👋\n\n` +
        `Just a friendly reminder about your upcoming appointment:\n\n` +
        `• Service: *${service}*\n` +
        `• Barber: *${barber}*\n` +
        `• When: *${when}*\n\n` +
        `We'll be ready for you at *${shop}*. See you soon! 💈✂️`
      );

    case "thankyou":
      const pts = appt.pointsEarned ?? Math.floor(appt.price);
      const total = appt.loyaltyPoints ?? pts;
      return (
        `Hi ${name}! 🙏\n\n` +
        `Thank you for visiting *${shop}* today!\n\n` +
        `You've earned *+${pts} loyalty points* for your visit.\n` +
        `Your total is now *${total} points*. 🏆\n\n` +
        `We hope you love your new look — see you next time! 💈`
      );
  }
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const normalized = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const TEMPLATE_META: Record<WhatsAppTemplate, { label: string; icon: string; description: string }> = {
  confirmation: {
    label: "Booking Confirmation",
    icon: "✅",
    description: "Send when you confirm an appointment",
  },
  reminder: {
    label: "Appointment Reminder",
    icon: "🔔",
    description: "Send the day before the appointment",
  },
  thankyou: {
    label: "Thank You + Points",
    icon: "🙏",
    description: "Send after the appointment is completed",
  },
};
