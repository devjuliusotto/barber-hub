import React from "react";
import { Link, useLocation } from "wouter";
import { Scissors, Search, User, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-primary text-primary-foreground rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Barber Hub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/marketplace" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location === '/marketplace' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Discover
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              For Salons
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="font-semibold">Log In</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="font-semibold">Get Started</Button>
              </Link>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground border-t border-border/10">
        <div className="container mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-6 w-6 bg-primary text-primary-foreground rounded flex items-center justify-center">
                  <Scissors className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-lg">Barber Hub</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                The definitive digital infrastructure for barbershops in Germany. Elevate your craft.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">ERP Dashboard</Link></li>
                <li><Link href="/marketplace" className="hover:text-primary transition-colors">For Clients</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Imprint</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between">
            <p>© {new Date().getFullYear()} Barber Hub Germany. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
