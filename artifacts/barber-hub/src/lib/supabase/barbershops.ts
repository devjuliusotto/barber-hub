import { supabase } from "@/utils/supabase";

export type MarketplaceBarbershop = {
  id: string;
  name: string;
  city: string;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  nationalityFlag: string | null;
  nationalityLabel: string | null;
  specialties: string[];
  premium: boolean;
};

export type BarbershopDetail = MarketplaceBarbershop & {
  address: string | null;
  description: string | null;
  languages: string[];
  phone: string | null;
  email: string | null;
  isPremium: boolean;
  isVerified: boolean;
};

export type BarberProfile = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  nationalityFlag: string | null;
  nationality: string | null;
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
};

export type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
};

export type ReviewItem = {
  id: string;
  clientName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type BarbershopRow = {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  description?: string | null;
  cover_image: string | null;
  rating: string | number;
  review_count: number;
  nationality_flag: string | null;
  nationality_label: string | null;
  languages?: string[] | null;
  specialties: string[] | null;
  premium: boolean;
  phone?: string | null;
  email?: string | null;
};

export async function searchMarketplaceBarbershops(city?: string): Promise<MarketplaceBarbershop[]> {
  let query = supabase
    .from("bh_barbershops")
    .select("id,name,city,cover_image,rating,review_count,nationality_flag,nationality_label,specialties,premium")
    .eq("active", true)
    .order("rating", { ascending: false });

  const trimmedCity = city?.trim();
  if (trimmedCity) {
    query = query.ilike("city", `%${trimmedCity}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as BarbershopRow[]).map((shop) => ({
    id: shop.id,
    name: shop.name,
    city: shop.city,
    coverImage: shop.cover_image,
    rating: Number(shop.rating),
    reviewCount: shop.review_count,
    nationalityFlag: shop.nationality_flag,
    nationalityLabel: shop.nationality_label,
    specialties: shop.specialties ?? [],
    premium: shop.premium,
  }));
}

export async function getBarbershopDetail(id: string): Promise<BarbershopDetail | null> {
  const { data, error } = await supabase
    .from("bh_barbershops")
    .select("id,name,city,address,description,cover_image,rating,review_count,nationality_flag,nationality_label,languages,specialties,premium,phone,email")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const shop = data as BarbershopRow;

  return {
    id: shop.id,
    name: shop.name,
    city: shop.city,
    address: shop.address ?? null,
    description: shop.description ?? null,
    coverImage: shop.cover_image,
    rating: Number(shop.rating),
    reviewCount: shop.review_count,
    nationalityFlag: shop.nationality_flag,
    nationalityLabel: shop.nationality_label,
    languages: shop.languages ?? [],
    specialties: shop.specialties ?? [],
    premium: shop.premium,
    isPremium: shop.premium,
    isVerified: true,
    phone: shop.phone ?? null,
    email: shop.email ?? null,
  };
}

export async function getPrimaryBarbershop(): Promise<BarbershopDetail | null> {
  const shops = await searchMarketplaceBarbershops();
  return shops[0] ? getBarbershopDetail(shops[0].id) : null;
}

export async function updateBarbershopProfile(id: string, input: {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}): Promise<void> {
  const { error } = await supabase
    .from("bh_barbershops")
    .update({
      name: input.name,
      description: input.description || null,
      address: input.address || null,
      city: input.city,
      phone: input.phone || null,
      email: input.email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function listBarbers(barbershopId: string): Promise<BarberProfile[]> {
  const { data, error } = await supabase
    .from("bh_barbers")
    .select("id,name,role,avatar_url,nationality_flag,nationality_label,languages,specialties,rating")
    .eq("barbershop_id", barbershopId)
    .eq("active", true)
    .order("rating", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((barber) => ({
    id: barber.id,
    name: barber.name,
    role: barber.role,
    avatarUrl: barber.avatar_url,
    nationalityFlag: barber.nationality_flag,
    nationality: barber.nationality_label,
    languages: barber.languages ?? [],
    specialties: barber.specialties ?? [],
    rating: Number(barber.rating),
    reviewCount: 0,
  }));
}

export async function listServices(barbershopId: string): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from("bh_services")
    .select("id,name,description,duration_minutes,price_cents,active")
    .eq("barbershop_id", barbershopId)
    .eq("active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.duration_minutes,
    price: service.price_cents / 100,
    isActive: service.active,
  }));
}

export async function listReviews(barbershopId: string): Promise<ReviewItem[]> {
  const { data, error } = await supabase
    .from("bh_reviews")
    .select("id,author_name,rating,comment,created_at")
    .eq("barbershop_id", barbershopId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((review) => ({
    id: review.id,
    clientName: review.author_name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
  }));
}

export async function listTakenAppointmentSlots(barbershopId: string, barberId?: string): Promise<string[]> {
  let query = supabase
    .from("bh_appointments")
    .select("scheduled_at")
    .eq("barbershop_id", barbershopId)
    .in("status", ["pending", "confirmed"]);

  if (barberId) {
    query = query.eq("barber_id", barberId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((appointment) => appointment.scheduled_at);
}

export async function createBooking(input: {
  barbershopId: string;
  clientName: string;
  clientPhone?: string;
  barberId: string;
  serviceId: string;
  scheduledAt: string;
  price: number;
}): Promise<{ id: string }> {
  const { data: client, error: clientError } = await supabase
    .from("bh_clients")
    .insert({
      barbershop_id: input.barbershopId,
      name: input.clientName,
      phone: input.clientPhone || null,
    })
    .select("id")
    .single();

  if (clientError) {
    throw clientError;
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("bh_appointments")
    .insert({
      barbershop_id: input.barbershopId,
      client_id: client.id,
      barber_id: input.barberId,
      service_id: input.serviceId,
      scheduled_at: input.scheduledAt,
      price_cents: Math.round(input.price * 100),
      status: "pending",
    })
    .select("id")
    .single();

  if (appointmentError) {
    throw appointmentError;
  }

  return { id: appointment.id };
}
