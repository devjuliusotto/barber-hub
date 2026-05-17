import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetBarbershop, useListServices, useListBarbers, useListReviews } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { MapPin, Star, Clock, CheckCircle2, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BarbershopDetail() {
  const { id } = useParams<{ id: string }>();
  const barbershopId = parseInt(id, 10);

  const { data: shop, isLoading: isLoadingShop } = useGetBarbershop(barbershopId, {
    query: { enabled: !!barbershopId, queryKey: ["getBarbershop", barbershopId] }
  });

  const { data: services } = useListServices({ barbershopId }, {
    query: { enabled: !!barbershopId, queryKey: ["listServices", barbershopId] }
  });

  const { data: barbers } = useListBarbers({ barbershopId }, {
    query: { enabled: !!barbershopId, queryKey: ["listBarbers", barbershopId] }
  });

  const { data: reviews } = useListReviews({ barbershopId }, {
    query: { enabled: !!barbershopId, queryKey: ["listReviews", barbershopId] }
  });

  if (isLoadingShop) {
    return <PublicLayout><div className="p-24 text-center">Loading...</div></PublicLayout>;
  }

  if (!shop) {
    return <PublicLayout><div className="p-24 text-center">Barbershop not found</div></PublicLayout>;
  }

  return (
    <PublicLayout>
      {/* Hero Header */}
      <div className="relative h-64 md:h-96 bg-muted overflow-hidden">
        <img 
          src={shop.coverImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000"} 
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 md:px-8 pb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {shop.nationalityFlag && (
                  <span className="text-2xl bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm" title={shop.nationalityLabel || ""}>
                    {shop.nationalityFlag}
                  </span>
                )}
                {shop.isPremium && <Badge variant="secondary" className="bg-primary text-primary-foreground border-none">Premium</Badge>}
                {shop.isVerified && <span className="text-blue-400 flex items-center text-sm font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Verified</span>}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold">{shop.name}</h1>
              <p className="flex items-center text-white/80 mt-2 text-lg">
                <MapPin className="h-5 w-5 mr-1.5" /> {shop.address}, {shop.city}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-center">
                <div className="flex items-center text-2xl font-bold text-primary">
                  <Star className="h-6 w-6 mr-1" fill="currentColor" /> {shop.rating.toFixed(1)}
                </div>
                <div className="text-sm text-white/70">{shop.reviewCount} reviews</div>
              </div>
              <Button size="lg" className="font-semibold px-8 h-14">Book Now</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">About Us</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {shop.description || "A premium barbershop experience delivering precision cuts and exceptional service."}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {shop.specialties?.map(s => <Badge key={s} variant="outline" className="text-sm py-1">{s}</Badge>)}
              </div>
            </section>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
                <TabsTrigger value="services" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 text-base">Services</TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 text-base">Staff</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 text-base">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="pt-6 space-y-4">
                {services?.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5" /> {service.durationMinutes} min
                        {service.description && <span className="hidden sm:inline"> • {service.description}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-xl">€{service.price.toFixed(2)}</span>
                      <Button variant="secondary">Book</Button>
                    </div>
                  </div>
                ))}
                {!services?.length && <div className="text-muted-foreground py-8 text-center">No services listed.</div>}
              </TabsContent>

              <TabsContent value="staff" className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {barbers?.map(barber => (
                  <Card key={barber.id} className="overflow-hidden">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <AvatarImage src={barber.avatarUrl || ""} />
                        <AvatarFallback className="text-2xl">{barber.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg flex items-center justify-center gap-2">
                        {barber.name} 
                        {barber.nationalityFlag && <span title={barber.nationality} className="text-sm">{barber.nationalityFlag}</span>}
                      </h3>
                      {barber.rating ? (
                        <div className="flex items-center justify-center mt-1 text-sm font-medium">
                          <Star className="h-4 w-4 text-primary mr-1" fill="currentColor" />
                          {barber.rating.toFixed(1)} ({barber.reviewCount})
                        </div>
                      ) : null}
                      <Button variant="outline" className="mt-4 w-full">Book with {barber.name.split(' ')[0]}</Button>
                    </CardContent>
                  </Card>
                ))}
                {!barbers?.length && <div className="text-muted-foreground py-8 text-center col-span-2">No staff listed.</div>}
              </TabsContent>

              <TabsContent value="reviews" className="pt-6 space-y-6">
                {reviews?.map(review => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{review.clientName || "Anonymous Client"}</div>
                      <div className="text-muted-foreground text-sm">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <div className="flex text-primary mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4" fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
                {!reviews?.length && <div className="text-muted-foreground py-8 text-center">No reviews yet.</div>}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Location & Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{shop.address}</p>
                      <p className="text-muted-foreground text-sm">{shop.city}</p>
                    </div>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium">📞</span>
                      <p>{shop.phone}</p>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium">🌐</span>
                      <a href={shop.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Opening Hours</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Monday</span> <span>Closed</span></li>
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Tuesday</span> <span>10:00 - 19:00</span></li>
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Wednesday</span> <span>10:00 - 19:00</span></li>
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Thursday</span> <span>10:00 - 20:00</span></li>
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Friday</span> <span>10:00 - 20:00</span></li>
                  <li className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Saturday</span> <span>09:00 - 18:00</span></li>
                  <li className="flex justify-between py-1"><span className="text-muted-foreground">Sunday</span> <span>Closed</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
