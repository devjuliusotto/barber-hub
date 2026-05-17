import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Scissors, Star, MapPin, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000" 
            alt="Barber working" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-20 py-24 md:py-36">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-sm font-medium">
              <Star className="h-4 w-4" fill="currentColor" />
              <span>The #1 Booking Platform in Germany</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Elevate your <span className="text-primary">craft.</span><br />
              Master your <span className="text-primary">business.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-2xl leading-relaxed">
              Barber Hub is the definitive digital infrastructure for modern barbershops. 
              Attract new clients, manage your schedule, and grow your revenue with a 
              tool built specifically for the trade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-base h-14 px-8 w-full sm:w-auto font-semibold">
                  Open your Shop <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="text-base h-14 px-8 w-full sm:w-auto font-semibold bg-background/10 border-border/20 text-secondary-foreground hover:bg-background/20">
                  Find a Barber
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Everything you need to run a premium shop</h2>
            <p className="text-muted-foreground text-lg">Replace disjointed tools with one elegant platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">Smart Booking</h3>
              <p className="text-muted-foreground leading-relaxed">
                A frictionless booking experience for your clients. Eliminate no-shows with automated reminders and waitlists.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">Client CRM</h3>
              <p className="text-muted-foreground leading-relaxed">
                Remember every detail. Track visit history, preferences, and spend to provide a truly personalized service.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">ERP Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your business cockpit. Monitor revenue, staff performance, and key metrics in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-24 bg-muted/50 border-t">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Discover masters of the craft.</h2>
              <ul className="space-y-4">
                {[
                  "Find top-rated barbers in your city",
                  "Filter by specialty, language, and nationality",
                  "Book and manage appointments instantly",
                  "Read verified reviews from real clients"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/marketplace">
                <Button size="lg" className="mt-4 font-semibold">Explore Marketplace</Button>
              </Link>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000" 
                  alt="Client getting haircut"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Re-importing icons used in content that weren't in lucide-react top import
import { Calendar, Users, LayoutDashboard } from "lucide-react";
