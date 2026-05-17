import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Scissors, Filter } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { searchMarketplaceBarbershops } from "@/lib/supabase/barbershops";

export default function Marketplace() {
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");

  const { data: barbershops, isLoading } = useQuery({
    queryKey: ["marketplaceBarbershops", debouncedCity],
    queryFn: () => searchMarketplaceBarbershops(debouncedCity || undefined),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedCity(city);
  };

  return (
    <PublicLayout>
      {/* Search Header */}
      <div className="bg-secondary text-secondary-foreground py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl space-y-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Find Your Next Great Haircut</h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
            Discover the best barbershops in Germany. Filter by specialty, language, or heritage.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Enter your city (e.g. Berlin, Munich)" 
                className="pl-11 h-12 text-base bg-background text-foreground border-transparent focus-visible:ring-primary"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 font-semibold">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="flex items-center gap-2 font-display font-bold text-lg border-b pb-4">
            <Filter className="h-5 w-5" /> Filters
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Rating</h3>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5].map(rating => (
                <label key={rating} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rating" className="accent-primary" />
                  <span className="flex items-center">
                    {rating}+ <Star className="h-3 w-3 ml-1 text-primary" fill="currentColor" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Specialties</h3>
            <div className="space-y-2 text-sm">
              {["Fades", "Beard Trim", "Hot Towel Shave", "Classic Cut", "Kids"].map(spec => (
                <label key={spec} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary rounded" />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">
              {isLoading ? "Searching..." : `${barbershops?.length || 0} barbershops found`}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-muted rounded-xl h-80"></div>
              ))}
            </div>
          ) : barbershops?.length === 0 ? (
            <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold">No barbershops found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbershops?.map(shop => (
                <Link key={shop.id} href={`/barbershops/${shop.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group overflow-hidden flex flex-col">
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <img 
                        src={shop.coverImage || "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800"} 
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur text-foreground px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 text-primary" fill="currentColor" />
                        {shop.rating.toFixed(1)} ({shop.reviewCount})
                      </div>
                      {shop.nationalityFlag && (
                        <div className="absolute top-3 right-3 text-xl bg-background/90 backdrop-blur rounded-md px-2 py-0.5 shadow-sm" title={shop.nationalityLabel || ""}>
                          {shop.nationalityFlag}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{shop.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5" /> {shop.city}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {shop.specialties?.slice(0, 3).map(spec => (
                          <Badge key={spec} variant="secondary" className="font-normal text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
