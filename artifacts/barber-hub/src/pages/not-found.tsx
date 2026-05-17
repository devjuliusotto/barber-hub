import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Scissors className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">404 - Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="font-semibold">Return Home</Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
