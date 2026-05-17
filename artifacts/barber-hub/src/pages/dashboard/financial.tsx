import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths } from "date-fns";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Target, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createExpense,
  deleteExpense,
  getFinancialSummary,
  listExpenses,
  updateExpense,
} from "@/lib/supabase/dashboard";
import { searchMarketplaceBarbershops } from "@/lib/supabase/barbershops";

const CATEGORY_LABELS: Record<string, string> = {
  rent: "Aluguel", salaries: "Salários", supplies: "Suprimentos",
  utilities: "Serviços", marketing: "Marketing", equipment: "Equipamentos",
  maintenance: "Manutenção", insurance: "Seguro", taxes: "Impostos", other: "Outros",
};

const CATEGORY_COLORS: Record<string, string> = {
  rent: "#f97316", salaries: "#8b5cf6", supplies: "#06b6d4",
  utilities: "#10b981", marketing: "#f59e0b", equipment: "#3b82f6",
  maintenance: "#6366f1", insurance: "#ec4899", taxes: "#ef4444", other: "#6b7280",
};

const TYPE_LABELS: Record<string, string> = { fixed: "Fixa", variable: "Variável" };

function fmtEur(n: number) {
  return `€${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("de-DE", { month: "long", year: "numeric" });
}

type ExpenseForm = {
  amount: string;
  category: string;
  type: string;
  description: string;
  date: string;
};

const EMPTY_FORM: ExpenseForm = {
  amount: "",
  category: "other",
  type: "variable",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function DashboardFinancial() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);

  const { data: shops } = useQuery({
    queryKey: ["marketplaceBarbershops", "financial-primary"],
    queryFn: () => searchMarketplaceBarbershops(),
  });
  const primaryShopId = shops?.[0]?.id;

  const { data: fin, isLoading } = useQuery({
    queryKey: ["financialSummary", selectedMonth],
    queryFn: () => getFinancialSummary(selectedMonth),
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses", selectedMonth],
    queryFn: () => listExpenses(selectedMonth),
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
  });
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateExpense>[1] }) => updateExpense(id, data),
  });
  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
  });

  async function invalidate() {
    await qc.invalidateQueries({ queryKey: ["financialSummary", selectedMonth] });
    await qc.invalidateQueries({ queryKey: ["expenses", selectedMonth] });
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: `${selectedMonth}-01` });
    setDialogOpen(true);
  }

  function openEdit(exp: any) {
    setEditingId(exp.id);
    setForm({
      amount: String(exp.amount),
      category: exp.category,
      type: exp.type,
      description: exp.description ?? "",
      date: exp.date,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.amount || !form.category || !form.type || !form.date) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      amount: parseFloat(form.amount),
      category: form.category as any,
      type: form.type as any,
      description: form.description || null,
      date: form.date,
    };
    if (editingId) {
      await updateExpenseMutation.mutateAsync({ id: editingId, data: payload });
      toast({ title: "Despesa atualizada" });
    } else {
      if (!primaryShopId) throw new Error("No barbershop available");
      await createExpenseMutation.mutateAsync({ ...payload, barbershopId: primaryShopId });
      toast({ title: "Despesa adicionada" });
    }
    await invalidate();
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteExpenseMutation.mutateAsync(id);
    toast({ title: "Despesa removida" });
    await invalidate();
  }

  function shiftMonth(delta: number) {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const kpis = [
    {
      label: "Receita",
      value: fin ? fmtEur(fin.revenue) : "—",
      sub: `${fin?.totalAppointments ?? 0} atendimentos`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Despesas Totais",
      value: fin ? fmtEur(fin.totalExpenses) : "—",
      sub: `Fixas ${fin ? fmtEur(fin.fixedExpenses) : "—"} · Variáveis ${fin ? fmtEur(fin.variableExpenses) : "—"}`,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Lucro Líquido",
      value: fin ? fmtEur(fin.netProfit) : "—",
      sub: fin ? `Margem ${fin.profitMargin.toFixed(1)}%` : "—",
      icon: Wallet,
      color: fin && fin.netProfit >= 0 ? "text-primary" : "text-red-600",
      bg: "bg-primary/10",
    },
    {
      label: "Ticket Médio",
      value: fin ? fmtEur(fin.avgTicket) : "—",
      sub: "por atendimento concluído",
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ];

  const chartData = (fin?.chartData ?? []).map(d => ({
    ...d,
    label: d.date.slice(8), // day of month
  }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Receitas, despesas, fluxo de caixa e DRE simplificado.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[160px] text-center capitalize">{monthLabel(selectedMonth)}</span>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="ml-4 gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Adicionar despesa
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(kpi => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className={cn("inline-flex h-10 w-10 rounded-lg items-center justify-center mb-3", kpi.bg)}>
                      <Icon className={cn("h-5 w-5", kpi.color)} />
                    </div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className={cn("text-2xl font-bold tabular-nums mt-0.5", kpi.color)}>{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* DRE Simplificado */}
          {fin && (
            <Card className="mb-8 overflow-hidden">
              <CardHeader>
                <CardTitle>DRE Simplificado — {monthLabel(selectedMonth)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0 divide-y">
                  {[
                    { label: "Receita Bruta", value: fin.revenue, bold: false, positive: true },
                    { label: "Despesas Fixas", value: -fin.fixedExpenses, bold: false, positive: false },
                    { label: "Despesas Variáveis", value: -fin.variableExpenses, bold: false, positive: false },
                    { label: "Lucro Líquido", value: fin.netProfit, bold: true, positive: fin.netProfit >= 0 },
                  ].map(row => (
                    <div key={row.label} className={cn("flex justify-between py-3 px-2", row.bold && "bg-muted/30 rounded-lg")}>
                      <span className={cn("text-sm", row.bold && "font-bold text-base")}>{row.label}</span>
                      <span className={cn(
                        "tabular-nums font-semibold",
                        row.bold && "text-base",
                        row.positive ? (row.bold ? "text-green-700" : "text-foreground") : "text-red-600"
                      )}>
                        {row.value < 0 ? `−${fmtEur(-row.value)}` : fmtEur(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Profit margin bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Margem de lucro</span>
                    <span className="font-semibold text-foreground">{fin.profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", fin.profitMargin >= 0 ? "bg-green-500" : "bg-red-500")}
                      style={{ width: `${Math.min(Math.max(fin.profitMargin, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue vs Expenses area chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Receita vs Despesas (diário)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
                    <Tooltip formatter={(v: number) => fmtEur(v)} labelFormatter={l => `Dia ${l}`} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Receita" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="expenses" name="Despesas" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expenses by category pie */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas por categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {fin && fin.expensesByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={fin.expensesByCategory}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%" cy="50%"
                          outerRadius={70}
                          strokeWidth={2}
                        >
                          {fin.expensesByCategory.map(entry => (
                            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#6b7280"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtEur(v)} labelFormatter={l => CATEGORY_LABELS[l] ?? l} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                      {fin.expensesByCategory.map(e => (
                        <div key={e.category} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[e.category] ?? "#6b7280" }} />
                            <span>{CATEGORY_LABELS[e.category] ?? e.category}</span>
                          </div>
                          <span className="font-semibold tabular-nums">{fmtEur(e.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">Nenhuma despesa registrada.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expenses table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Despesas — {monthLabel(selectedMonth)}</CardTitle>
              <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Data</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">Valor</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {!expenses?.length ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                          Nenhuma despesa neste mês.
                        </td>
                      </tr>
                    ) : (
                      expenses
                        .slice()
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map(exp => (
                          <tr key={exp.id} className="hover:bg-muted/20">
                            <td className="px-6 py-3 tabular-nums text-muted-foreground">{exp.date}</td>
                            <td className="px-4 py-3">{exp.description ?? "—"}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[exp.category] ?? "#6b7280" }} />
                                {CATEGORY_LABELS[exp.category] ?? exp.category}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                exp.type === "fixed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              )}>
                                {TYPE_LABELS[exp.type]}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-semibold tabular-nums text-red-600">
                              −{fmtEur(exp.amount)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(exp)}>
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600"
                                  onClick={() => handleDelete(exp.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                  {expenses && expenses.length > 0 && (
                    <tfoot>
                      <tr className="border-t bg-muted/30 font-semibold">
                        <td colSpan={4} className="px-6 py-3">Total</td>
                        <td className="px-6 py-3 text-right text-red-600 tabular-nums">
                          −{fmtEur(expenses.reduce((s, e) => s + e.amount, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar despesa" : "Adicionar despesa"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Valor (€) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Data *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Categoria *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Tipo *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixa</SelectItem>
                    <SelectItem value="variable">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Descrição</Label>
              <Input
                placeholder="Ex: Aluguel do espaço"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
              {editingId ? "Salvar alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
