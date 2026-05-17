import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listBarbers, searchMarketplaceBarbershops } from "@/lib/supabase/barbershops";

export default function DashboardBarbers() {
  const { data: shops } = useQuery({
    queryKey: ["marketplaceBarbershops", "dashboard-team"],
    queryFn: () => searchMarketplaceBarbershops(),
  });

  const primaryShopId = shops?.[0]?.id;

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["dashboardBarbers", primaryShopId],
    queryFn: () => listBarbers(primaryShopId ?? ""),
    enabled: !!primaryShopId,
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Barbers</h1>
          <p className="text-muted-foreground mt-1">Manage your team and their profiles.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Barber</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="animate-pulse bg-card h-64 rounded-xl border" />)
        ) : (
          barbers?.map(barber => (
            <Card key={barber.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={barber.avatarUrl || ""} />
                    <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="default">
                      Available
                    </Badge>
                    {barber.nationalityFlag && (
                      <span className="text-xl" title={barber.nationality ?? ""}>{barber.nationalityFlag}</span>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl mb-1">{barber.name}</h3>
                
                {barber.rating ? (
                  <div className="flex items-center text-sm mb-4">
                    <Star className="h-4 w-4 text-primary mr-1" fill="currentColor" />
                    <span className="font-medium">{barber.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">({barber.reviewCount} reviews)</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4">No reviews yet</div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {barber.role}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {barber.specialties?.slice(0, 3).map(spec => (
                    <Badge key={spec} variant="outline" className="text-xs font-normal bg-muted/50">{spec}</Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Edit Profile</Button>
                  <Button variant="secondary" className="flex-1">Schedule</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
