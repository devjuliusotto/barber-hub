import { supabase } from "@/utils/supabase";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type DashboardAppointment = {
  id: string;
  clientName: string | null;
  clientPhone: string | null;
  serviceName: string | null;
  barberName: string | null;
  barbershopName: string | null;
  scheduledAt: string;
  price: number;
  status: AppointmentStatus;
};

export type DashboardClient = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string | null;
  createdAt: string;
  notes: string | null;
  birthdate: string | null;
};

export type DashboardSummary = {
  revenueToday: number;
  revenueGrowth: number;
  appointmentsToday: number;
  pendingAppointments: number;
  totalClients: number;
  newClientsMonth: number;
  avgTicket: number;
};

export type RevenueChartPoint = {
  date: string;
  revenue: number;
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  type: "fixed" | "variable";
  description: string | null;
  date: string;
};

export type FinancialSummary = {
  revenue: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  netProfit: number;
  profitMargin: number;
  avgTicket: number;
  totalAppointments: number;
  chartData: Array<{ date: string; revenue: number; expenses: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
};

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  price_cents: number;
  status: AppointmentStatus;
  bh_clients: { name: string | null; phone: string | null } | null;
  bh_services: { name: string | null } | null;
  bh_barbers: { name: string | null } | null;
  bh_barbershops: { name: string | null } | null;
};

type ClientAppointmentRow = {
  scheduled_at: string;
  price_cents: number;
  status: AppointmentStatus;
};

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  loyalty_points: number;
  created_at: string;
  notes: string | null;
  bh_appointments?: ClientAppointmentRow[] | null;
};

export async function listDashboardAppointments(status?: AppointmentStatus): Promise<DashboardAppointment[]> {
  let query = supabase
    .from("bh_appointments")
    .select(`
      id,
      scheduled_at,
      price_cents,
      status,
      bh_clients(name, phone),
      bh_services(name),
      bh_barbers(name),
      bh_barbershops(name)
    `)
    .order("scheduled_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AppointmentRow[]).map((appointment) => ({
    id: appointment.id,
    clientName: appointment.bh_clients?.name ?? null,
    clientPhone: appointment.bh_clients?.phone ?? null,
    serviceName: appointment.bh_services?.name ?? null,
    barberName: appointment.bh_barbers?.name ?? null,
    barbershopName: appointment.bh_barbershops?.name ?? null,
    scheduledAt: appointment.scheduled_at,
    price: appointment.price_cents / 100,
    status: appointment.status,
  }));
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const { error } = await supabase
    .from("bh_appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function listDashboardClients(search?: string): Promise<DashboardClient[]> {
  let query = supabase
    .from("bh_clients")
    .select(`
      id,
      name,
      phone,
      email,
      notes,
      loyalty_points,
      created_at,
      bh_appointments(scheduled_at, price_cents, status)
    `)
    .order("created_at", { ascending: false });

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    query = query.or(`name.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ClientRow[]).map((client) => {
    const appointments = client.bh_appointments ?? [];
    const completed = appointments.filter((appointment) => appointment.status === "completed");
    const lastVisit =
      appointments
        .map((appointment) => appointment.scheduled_at)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      avatarUrl: null,
      loyaltyPoints: client.loyalty_points,
      totalVisits: completed.length,
      totalSpent: completed.reduce((sum, appointment) => sum + appointment.price_cents / 100, 0),
      lastVisit,
      createdAt: client.created_at,
      notes: client.notes ?? null,
      birthdate: null,
    };
  });
}

export async function getDashboardClient(id: string): Promise<DashboardClient | null> {
  const clients = await listDashboardClients();
  return clients.find((client) => client.id === id) ?? null;
}

export async function listClientAppointments(clientId: string): Promise<DashboardAppointment[]> {
  const { data, error } = await supabase
    .from("bh_appointments")
    .select(`
      id,
      scheduled_at,
      price_cents,
      status,
      bh_clients(name, phone),
      bh_services(name),
      bh_barbers(name),
      bh_barbershops(name)
    `)
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AppointmentRow[]).map((appointment) => ({
    id: appointment.id,
    clientName: appointment.bh_clients?.name ?? null,
    clientPhone: appointment.bh_clients?.phone ?? null,
    serviceName: appointment.bh_services?.name ?? null,
    barberName: appointment.bh_barbers?.name ?? null,
    barbershopName: appointment.bh_barbershops?.name ?? null,
    scheduledAt: appointment.scheduled_at,
    price: appointment.price_cents / 100,
    status: appointment.status,
  }));
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [appointments, clients] = await Promise.all([
    listDashboardAppointments(),
    listDashboardClients(),
  ]);

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const completed = appointments.filter((appointment) => appointment.status === "completed");
  const completedThisMonth = completed.filter((appointment) => new Date(appointment.scheduledAt) >= monthStart);
  const completedPreviousMonth = completed.filter((appointment) => {
    const scheduledAt = new Date(appointment.scheduledAt);
    return scheduledAt >= previousMonthStart && scheduledAt < monthStart;
  });

  const revenueToday = completed
    .filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduledAt);
      return scheduledAt >= todayStart && scheduledAt < tomorrowStart;
    })
    .reduce((sum, appointment) => sum + appointment.price, 0);

  const revenueThisMonth = completedThisMonth.reduce((sum, appointment) => sum + appointment.price, 0);
  const revenuePreviousMonth = completedPreviousMonth.reduce((sum, appointment) => sum + appointment.price, 0);
  const revenueGrowth = revenuePreviousMonth > 0
    ? Math.round(((revenueThisMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100)
    : revenueThisMonth > 0 ? 100 : 0;

  return {
    revenueToday,
    revenueGrowth,
    appointmentsToday: appointments.filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduledAt);
      return scheduledAt >= todayStart && scheduledAt < tomorrowStart;
    }).length,
    pendingAppointments: appointments.filter((appointment) => appointment.status === "pending").length,
    totalClients: clients.length,
    newClientsMonth: clients.filter((client) => new Date(client.createdAt) >= monthStart).length,
    avgTicket: completed.length
      ? completed.reduce((sum, appointment) => sum + appointment.price, 0) / completed.length
      : 0,
  };
}

export async function getRevenueChart(): Promise<RevenueChartPoint[]> {
  const appointments = await listDashboardAppointments();
  const today = startOfDay(new Date());
  const points = new Map<string, number>();

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    points.set(isoDate(date), 0);
  }

  for (const appointment of appointments) {
    if (appointment.status !== "completed") continue;
    const key = isoDate(new Date(appointment.scheduledAt));
    if (points.has(key)) {
      points.set(key, (points.get(key) ?? 0) + appointment.price);
    }
  }

  return Array.from(points.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getDashboardSchedule(): Promise<DashboardAppointment[]> {
  const appointments = await listDashboardAppointments();
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  return appointments
    .filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduledAt);
      return scheduledAt >= todayStart
        && scheduledAt < tomorrowStart
        && (appointment.status === "pending" || appointment.status === "confirmed");
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export async function listExpenses(month: string): Promise<Expense[]> {
  const monthStart = `${month}-01`;
  const nextMonth = new Date(`${monthStart}T00:00:00`);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const { data, error } = await supabase
    .from("bh_expenses")
    .select("id,amount_cents,category,type,description,date")
    .gte("date", monthStart)
    .lt("date", isoDate(nextMonth))
    .order("date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((expense) => ({
    id: expense.id,
    amount: expense.amount_cents / 100,
    category: expense.category,
    type: expense.type,
    description: expense.description,
    date: expense.date,
  }));
}

export async function getFinancialSummary(month: string): Promise<FinancialSummary> {
  const [appointments, expenses] = await Promise.all([
    listDashboardAppointments(),
    listExpenses(month),
  ]);

  const monthStart = `${month}-01`;
  const nextMonth = new Date(`${monthStart}T00:00:00`);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthKey = isoDate(nextMonth);

  const monthAppointments = appointments.filter((appointment) => {
    const date = isoDate(new Date(appointment.scheduledAt));
    return date >= monthStart && date < nextMonthKey;
  });
  const completed = monthAppointments.filter((appointment) => appointment.status === "completed");
  const revenue = completed.reduce((sum, appointment) => sum + appointment.price, 0);
  const fixedExpenses = expenses.filter((expense) => expense.type === "fixed").reduce((sum, expense) => sum + expense.amount, 0);
  const variableExpenses = expenses.filter((expense) => expense.type === "variable").reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = fixedExpenses + variableExpenses;
  const netProfit = revenue - totalExpenses;

  const days = new Map<string, { date: string; revenue: number; expenses: number }>();
  for (let d = new Date(`${monthStart}T00:00:00`); isoDate(d) < nextMonthKey; d.setDate(d.getDate() + 1)) {
    const key = isoDate(d);
    days.set(key, { date: key, revenue: 0, expenses: 0 });
  }

  for (const appointment of completed) {
    const key = isoDate(new Date(appointment.scheduledAt));
    const point = days.get(key);
    if (point) point.revenue += appointment.price;
  }

  for (const expense of expenses) {
    const point = days.get(expense.date);
    if (point) point.expenses += expense.amount;
  }

  const expensesByCategory = Array.from(
    expenses.reduce((map, expense) => {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
      return map;
    }, new Map<string, number>()),
    ([category, amount]) => ({ category, amount }),
  );

  return {
    revenue,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    netProfit,
    profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    avgTicket: completed.length ? revenue / completed.length : 0,
    totalAppointments: completed.length,
    chartData: Array.from(days.values()),
    expensesByCategory,
  };
}

export async function createExpense(input: Omit<Expense, "id"> & { barbershopId: string }): Promise<void> {
  const { error } = await supabase.from("bh_expenses").insert({
    barbershop_id: input.barbershopId,
    amount_cents: Math.round(input.amount * 100),
    category: input.category,
    type: input.type,
    description: input.description || null,
    date: input.date,
  });
  if (error) throw error;
}

export async function updateExpense(id: string, input: Omit<Expense, "id">): Promise<void> {
  const { error } = await supabase
    .from("bh_expenses")
    .update({
      amount_cents: Math.round(input.amount * 100),
      category: input.category,
      type: input.type,
      description: input.description || null,
      date: input.date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("bh_expenses").delete().eq("id", id);
  if (error) throw error;
}
