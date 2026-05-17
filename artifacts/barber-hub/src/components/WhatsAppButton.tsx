import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  buildMessage,
  buildWhatsAppLink,
  TEMPLATE_META,
  type AppointmentForWhatsApp,
  type WhatsAppTemplate,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Copy, ExternalLink } from "lucide-react";

const TEMPLATES: WhatsAppTemplate[] = ["confirmation", "reminder", "thankyou"];

// WhatsApp green
const WA_COLOR = "bg-[#25D366] hover:bg-[#20BA5A] text-white border-transparent";

interface WhatsAppButtonProps {
  appointment: AppointmentForWhatsApp;
  /** Which templates to show. Defaults to all three. */
  templates?: WhatsAppTemplate[];
  size?: "sm" | "default";
  className?: string;
}

export function WhatsAppButton({
  appointment,
  templates = TEMPLATES,
  size = "sm",
  className,
}: WhatsAppButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<WhatsAppTemplate | null>(null);

  const hasPhone = !!appointment.clientPhone;

  function handleCopy(tpl: WhatsAppTemplate) {
    const msg = buildMessage(tpl, appointment);
    navigator.clipboard.writeText(msg).then(() => {
      toast({
        title: "Message copied",
        description: `${TEMPLATE_META[tpl].label} copied to clipboard.`,
      });
      setOpen(false);
      setPreview(null);
    });
  }

  function handleOpen(tpl: WhatsAppTemplate) {
    if (!appointment.clientPhone) return;
    const msg = buildMessage(tpl, appointment);
    const url = buildWhatsAppLink(appointment.clientPhone, msg);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    setPreview(null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className={cn(
            "border gap-1.5 font-medium",
            WA_COLOR,
            className
          )}
          title="Send WhatsApp message"
        >
          {/* WhatsApp logo SVG */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="bg-[#075E54] px-4 py-3">
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send to {appointment.clientName ?? "client"}
          </p>
          {!hasPhone && (
            <p className="text-white/70 text-xs mt-0.5">No phone number — messages will be copied</p>
          )}
        </div>

        <div className="p-2 space-y-1">
          {templates.map(tpl => {
            const meta = TEMPLATE_META[tpl];
            const isActive = preview === tpl;
            return (
              <div key={tpl}>
                <button
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  )}
                  onClick={() => setPreview(isActive ? null : tpl)}
                >
                  <span className="text-xl shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </button>

                {isActive && (
                  <div className="mx-2 mb-2 rounded-lg border bg-muted/50 overflow-hidden">
                    {/* Chat bubble preview */}
                    <div className="p-3 bg-[#DCF8C6] dark:bg-[#1a3a1f] max-h-40 overflow-y-auto">
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {buildMessage(tpl, appointment)}
                      </p>
                    </div>
                    <div className="flex border-t">
                      <button
                        onClick={() => handleCopy(tpl)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                      {hasPhone && (
                        <>
                          <div className="w-px bg-border" />
                          <button
                            onClick={() => handleOpen(tpl)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open WhatsApp
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
