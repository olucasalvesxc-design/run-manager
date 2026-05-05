import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile, Race, Registration } from '../types';
import { Link } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  ShieldCheck, Users, Trophy, TrendingUp, Crown, Zap, Clock,
  ArrowLeft, Loader2, Search, Mail, Calendar, AlertTriangle,
  Activity, DollarSign, UserCheck, Bell, ArrowUpRight,
  RefreshCw, CheckCircle, Lightbulb, UserPlus, Target,
  Flame, Database, Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | 'all';
type TableTab = 'organizers' | 'athletes';

interface Insight {
  type: 'positive' | 'warning' | 'info';
  icon: React.ElementType;
  text: string;
  detail: string;
}

interface Alert {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
}

interface ActivityLog {
  icon: React.ElementType;
  color: string;
  text: string;
  time: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_PRICE: Record<string, number> = {
  'PRO RUNNER': 49.9,
  'MASTER ELITE': 149.9,
};

function filterByPeriod<T extends { createdAt: any }>(items: T[], period: Period): T[] {
  if (period === 'all') return items;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter(item => {
    const d: Date = item.createdAt?.toDate?.() ?? new Date(item.createdAt ?? 0);
    return d >= cutoff;
  });
}

function buildWeeklyChart(registrations: Registration[]): { label: string; inscrições: number }[] {
  const weeks = 8;
  const now = new Date();
  return Array.from({ length: weeks }, (_, i) => {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    const count = registrations.filter(r => {
      const d: Date = r.createdAt?.toDate?.() ?? new Date(r.createdAt ?? 0);
      return d >= start && d < end;
    }).length;
    return { label: `S${weeks - i}`, inscrições: count };
  }).reverse();
}

function buildMonthlyRevenue(profiles: Profile[]): { label: string; receita: number }[] {
  const months = 6;
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const inPeriod = profiles.filter(p => {
      const created: Date = p.createdAt?.toDate?.() ?? new Date(p.createdAt ?? 0);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    });
    const receita = inPeriod.reduce((sum, p) => sum + (PLAN_PRICE[p.planName ?? ''] ?? 0), 0);
    return { label, receita };
  });
}

function generateInsights(
  profiles: Profile[],
  races: Race[],
  registrations: Registration[],
): Insight[] {
  const organizers = profiles.filter(p => p.role === 'organizer');
  const athletes   = profiles.filter(p => p.role === 'athlete');
  const premium    = organizers.filter(p => PLAN_PRICE[p.planName ?? '']);
  const convRate   = organizers.length ? Math.round((premium.length / organizers.length) * 100) : 0;

  const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const newUsers = profiles.filter(p => {
    const d: Date = p.createdAt?.toDate?.() ?? new Date(p.createdAt ?? 0);
    return d >= oneMonthAgo;
  }).length;

  const confirmed = registrations.filter(r => r.status === 'confirmado' || r.paymentStatus === 'confirmed').length;
  const confirmRate = registrations.length ? Math.round((confirmed / registrations.length) * 100) : 0;

  return [
    {
      type: newUsers > 0 ? 'positive' : 'info',
      icon: UserPlus,
      text: `${newUsers} novos usuários este mês`,
      detail: `${athletes.length} atletas · ${organizers.length} organizadores`,
    },
    {
      type: convRate >= 40 ? 'positive' : 'warning',
      icon: Target,
      text: `${convRate}% de conversão premium`,
      detail: `${premium.length} de ${organizers.length} organizadores pagantes`,
    },
    {
      type: confirmRate >= 60 ? 'positive' : 'warning',
      icon: CheckCircle,
      text: `${confirmRate}% inscrições confirmadas`,
      detail: `${confirmed} de ${registrations.length} inscrições`,
    },
    {
      type: races.length > 0 ? 'info' : 'warning',
      icon: Trophy,
      text: `${races.length} corridas cadastradas`,
      detail: `${races.filter(r => r.status === 'active').length} ativas agora`,
    },
  ];
}

function generateAlerts(profiles: Profile[], races: Race[], registrations: Registration[]): Alert[] {
  const alerts: Alert[] = [];

  const organizers = profiles.filter(p => p.role === 'organizer');
  const withRaces = new Set(races.map(r => r.organizerId));
  const noRace = organizers.filter(p => !withRaces.has(p.id));
  if (noRace.length > 0)
    alerts.push({ type: 'warning', title: `${noRace.length} organizador(es) sem corridas`, description: 'Podem precisar de suporte para criar o primeiro evento.' });

  const pending = registrations.filter(r => r.paymentStatus === 'pending' && r.status !== 'cancelado');
  if (pending.length > 3)
    alerts.push({ type: 'info', title: `${pending.length} pagamentos pendentes`, description: 'Inscrições aguardando confirmação de pagamento.' });

  const inactive = profiles.filter(p => p.planStatus === 'inactive' && p.planName && p.planName !== 'START');
  if (inactive.length > 0)
    alerts.push({ type: 'error', title: `${inactive.length} plano(s) inativo(s)`, description: 'Organizadores com assinatura vencida.' });

  if (alerts.length === 0)
    alerts.push({ type: 'info', title: 'Plataforma saudável', description: 'Nenhum alerta crítico no momento.' });

  return alerts;
}

function generateLogs(profiles: Profile[], registrations: Registration[]): ActivityLog[] {
  const logs: ActivityLog[] = [];

  const recent = [...registrations]
    .sort((a, b) => {
      const da: Date = a.createdAt?.toDate?.() ?? new Date(0);
      const db_: Date = b.createdAt?.toDate?.() ?? new Date(0);
      return db_.getTime() - da.getTime();
    })
    .slice(0, 4);

  recent.forEach(r => {
    const d: Date = r.createdAt?.toDate?.() ?? new Date();
    logs.push({
      icon: UserCheck,
      color: 'text-yellow-400',
      text: `${r.runnerName} se inscreveu em uma corrida`,
      time: d.toLocaleDateString('pt-BR'),
    });
  });

  const recentProfiles = [...profiles]
    .sort((a, b) => {
      const da: Date = a.createdAt?.toDate?.() ?? new Date(0);
      const db_: Date = b.createdAt?.toDate?.() ?? new Date(0);
      return db_.getTime() - da.getTime();
    })
    .slice(0, 3);

  recentProfiles.forEach(p => {
    const d: Date = p.createdAt?.toDate?.() ?? new Date();
    logs.push({
      icon: p.role === 'organizer' ? Flame : UserPlus,
      color: p.role === 'organizer' ? 'text-red-400' : 'text-green-400',
      text: `${p.organizerName || p.email} entrou como ${p.role === 'organizer' ? 'organizador' : 'atleta'}`,
      time: d.toLocaleDateString('pt-BR'),
    });
  });

  return logs.slice(0, 6);
}

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm font-black" style={{ color: entry.color }}>
          {entry.dataKey === 'receita' ? formatCurrency(entry.value) : entry.value}
          <span className="text-[10px] text-slate-500 ml-1 normal-case font-normal">{entry.dataKey}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [profiles,      setProfiles]      = useState<Profile[]>([]);
  const [races,         setRaces]          = useState<Race[]>([]);
  const [registrations, setRegistrations]  = useState<Registration[]>([]);
  const [loading,       setLoading]        = useState(true);
  const [period,        setPeriod]         = useState<Period>('30d');
  const [tableTab,      setTableTab]       = useState<TableTab>('organizers');
  const [search,        setSearch]         = useState('');
  const [planFilter,    setPlanFilter]     = useState('all');
  const [updatingId,    setUpdatingId]     = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profSnap, raceSnap, regSnap] = await Promise.all([
        getDocs(collection(db, 'profiles')),
        getDocs(collection(db, 'races')),
        getDocs(query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(200))),
      ]);
      setProfiles(profSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)));
      setRaces(raceSnap.docs.map(d => ({ id: d.id, ...d.data() } as Race)));
      setRegistrations(regSnap.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'profiles', userId), { planName: newPlan, planStatus: 'active', updatedAt: new Date() });
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, planName: newPlan, planStatus: 'active' } : p));
    } catch (err) { console.error(err); }
    finally { setUpdatingId(null); }
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const organizers = useMemo(() => profiles.filter(p => p.role === 'organizer'), [profiles]);
  const athletes   = useMemo(() => profiles.filter(p => p.role === 'athlete'),   [profiles]);
  const premium    = useMemo(() => organizers.filter(p => PLAN_PRICE[p.planName ?? '']), [organizers]);
  const estRevenue = useMemo(() => organizers.reduce((s, p) => s + (PLAN_PRICE[p.planName ?? ''] ?? 0), 0), [organizers]);

  const periodRegs  = useMemo(() => filterByPeriod(registrations, period), [registrations, period]);
  const periodProfs = useMemo(() => filterByPeriod(profiles, period),       [profiles, period]);

  const weeklyData   = useMemo(() => buildWeeklyChart(registrations),  [registrations]);
  const monthlyData  = useMemo(() => buildMonthlyRevenue(organizers),  [organizers]);
  const planPieData  = useMemo(() => [
    { name: 'Start',        value: organizers.filter(p => !p.planName || p.planName === 'START').length, color: '#475569' },
    { name: 'Pro Runner',   value: organizers.filter(p => p.planName === 'PRO RUNNER').length,           color: '#facc15' },
    { name: 'Master Elite', value: organizers.filter(p => p.planName === 'MASTER ELITE').length,         color: '#ef4444' },
  ], [organizers]);

  const insights = useMemo(() => generateInsights(profiles, races, registrations), [profiles, races, registrations]);
  const alerts   = useMemo(() => generateAlerts(profiles, races, registrations),   [profiles, races, registrations]);
  const logs     = useMemo(() => generateLogs(profiles, registrations),            [profiles, registrations]);

  // ── Table filters ────────────────────────────────────────────────────────────

  const filteredOrganizers = useMemo(() => organizers.filter(o => {
    const matchSearch = !search ||
      o.organizerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || o.planName === planFilter || (!o.planName && planFilter === 'START');
    return matchSearch && matchPlan;
  }), [organizers, search, planFilter]);

  const filteredAthletes = useMemo(() => athletes.filter(a =>
    !search ||
    (a.organizerName || a.email)?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  ), [athletes, search]);

  // ── Metrics ──────────────────────────────────────────────────────────────────

  const metrics = [
    { label: 'Receita Est. / mês', value: formatCurrency(estRevenue), icon: DollarSign, color: 'green',  sub: `${premium.length} assinaturas ativas` },
    { label: 'Total Usuários',     value: profiles.length,             icon: Users,       color: 'blue',   sub: `+${periodProfs.length} no período` },
    { label: 'Organizadores',      value: organizers.length,           icon: Flame,       color: 'yellow', sub: `${premium.length} premium` },
    { label: 'Atletas',            value: athletes.length,             icon: UserCheck,   color: 'purple', sub: `${periodRegs.length} inscrições` },
    { label: 'Corridas',           value: races.length,                icon: Trophy,      color: 'red',    sub: `${races.filter(r => r.status === 'active').length} ativas` },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Carregando dados...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full space-y-6 pb-16 animate-in fade-in duration-500">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/organizer/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest mb-4 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Painel Principal
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 font-black text-[10px] uppercase tracking-[0.2em] italic border border-yellow-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Panel
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
            Centro de <span className="text-yellow-400">Comando</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-2 italic">Visão completa da plataforma em tempo real.</p>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 self-start sm:self-center">
          {(['7d','30d','90d','all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                period === p ? 'bg-yellow-400 text-slate-950' : 'text-slate-500 hover:text-white'
              )}
            >
              {p === 'all' ? 'Tudo' : p}
            </button>
          ))}
          <button onClick={fetchAll} className="p-1.5 rounded-xl text-slate-500 hover:text-yellow-400 transition-colors ml-1" title="Atualizar">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart – inscriptions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <SectionTitle icon={Activity} label="Inscrições por Semana" sub="últimas 8 semanas" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gInsc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#facc15" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="inscrições" stroke="#facc15" fill="url(#gInsc)" strokeWidth={2} dot={{ fill: '#facc15', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart – plan distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <SectionTitle icon={Database} label="Distribuição de Planos" sub="organizadores" />
          <div className="flex items-center gap-4 mt-2">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={planPieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {planPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {planPieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{d.name}</div>
                    <div className="text-base font-black text-white leading-none">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bar chart – monthly revenue ───────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <SectionTitle icon={DollarSign} label="Receita Estimada Mensal" sub="últimos 6 meses · assinaturas" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="receita" fill="#facc15" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Insights + Alerts row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <SectionTitle icon={Lightbulb} label="Insights Automáticos" sub="gerados com base nos dados" />
          <div className="space-y-2 mt-3">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border',
                  ins.type === 'positive' ? 'bg-green-500/5 border-green-500/15' :
                  ins.type === 'warning'  ? 'bg-yellow-400/5 border-yellow-400/15' :
                  'bg-blue-500/5 border-blue-500/15'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  ins.type === 'positive' ? 'bg-green-500/15 text-green-400' :
                  ins.type === 'warning'  ? 'bg-yellow-400/15 text-yellow-400' :
                  'bg-blue-500/15 text-blue-400'
                )}>
                  <ins.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{ins.text}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{ins.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <SectionTitle icon={Bell} label="Alertas do Sistema" sub="monitoramento automático" />
          <div className="space-y-2 mt-3">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border',
                  a.type === 'error'   ? 'bg-red-500/5 border-red-500/15' :
                  a.type === 'warning' ? 'bg-yellow-400/5 border-yellow-400/15' :
                  'bg-slate-800/50 border-slate-700'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  a.type === 'error'   ? 'bg-red-500/15 text-red-400' :
                  a.type === 'warning' ? 'bg-yellow-400/15 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                )}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{a.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{a.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <SectionTitle icon={Zap} label="Ações Rápidas" sub="gerenciamento da plataforma" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {[
            { label: 'Criar Corrida',     icon: Trophy,    to: '/organizer/races/create',      color: 'yellow' },
            { label: 'Ver Inscritos',     icon: Users,     to: '/organizer/registrations',     color: 'blue'   },
            { label: 'Financeiro',        icon: DollarSign,to: '/organizer/finance',            color: 'green'  },
            { label: 'Configurações',     icon: ShieldCheck,to: '/organizer/settings',          color: 'slate'  },
          ].map(a => (
            <Link
              key={a.label}
              to={a.to}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:scale-[1.03] text-center',
                a.color === 'yellow' ? 'bg-yellow-400/5 border-yellow-400/15 hover:bg-yellow-400/10 text-yellow-400' :
                a.color === 'green'  ? 'bg-green-500/5 border-green-500/15 hover:bg-green-500/10 text-green-400' :
                a.color === 'blue'   ? 'bg-blue-500/5 border-blue-500/15 hover:bg-blue-500/10 text-blue-400' :
                'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
              )}
            >
              <a.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tables ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* Table top bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-fit">
            {(['organizers','athletes'] as TableTab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTableTab(t); setSearch(''); setPlanFilter('all'); }}
                className={cn(
                  'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  tableTab === t ? 'bg-yellow-400 text-slate-950' : 'text-slate-500 hover:text-white'
                )}
              >
                {t === 'organizers' ? `Organizadores (${organizers.length})` : `Atletas (${athletes.length})`}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {tableTab === 'organizers' && (
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <Filter className="w-3 h-3 text-slate-500" />
                <select
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className="bg-transparent text-[10px] font-black text-slate-300 uppercase tracking-widest outline-none cursor-pointer"
                >
                  <option value="all">Todos os planos</option>
                  <option value="START">Start</option>
                  <option value="PRO RUNNER">Pro Runner</option>
                  <option value="MASTER ELITE">Master Elite</option>
                </select>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 transition-all w-44"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <AnimatePresence mode="wait">
            {tableTab === 'organizers' ? (
              <motion.table key="org" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-left" style={{ minWidth: '520px' }}>
                <thead>
                  <tr className="bg-slate-950/60 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                    <th className="px-5 py-4">Organizador</th>
                    <th className="px-4 py-4">Plano</th>
                    <th className="px-4 py-4 text-center">Corridas</th>
                    <th className="px-4 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrganizers.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-600 text-xs font-bold italic">Nenhum organizador encontrado.</td></tr>
                  ) : filteredOrganizers.map(org => (
                    <tr key={org.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-yellow-400 font-black text-sm italic">
                            {org.profileImageUrl
                              ? <img src={org.profileImageUrl} alt="" className="w-full h-full object-cover" />
                              : (org.organizerName?.charAt(0) || org.email?.charAt(0) || '?')
                            }
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-xs font-black italic uppercase tracking-tight truncate max-w-[140px] sm:max-w-[200px]">{org.organizerName || 'Sem Nome'}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[140px] sm:max-w-[200px]">
                              <Mail className="w-2.5 h-2.5 shrink-0" />{org.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <PlanBadge plan={org.planName} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-black text-white">
                          {races.filter(r => r.organizerId === org.id).length}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn icon={Clock}  title="Rebaixar para Start"        disabled={!org.planName || org.planName === 'START'}      onClick={() => updatePlan(org.id, 'START')}        loading={updatingId === org.id} variant="slate" />
                          <ActionBtn icon={Zap}   title="Promover para Pro Runner"   disabled={org.planName === 'PRO RUNNER'}                  onClick={() => updatePlan(org.id, 'PRO RUNNER')}   loading={updatingId === org.id} variant="yellow" />
                          <ActionBtn icon={Crown} title="Promover para Master Elite" disabled={org.planName === 'MASTER ELITE'}                onClick={() => updatePlan(org.id, 'MASTER ELITE')} loading={updatingId === org.id} variant="red" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              <motion.table key="ath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-left" style={{ minWidth: '480px' }}>
                <thead>
                  <tr className="bg-slate-950/60 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                    <th className="px-5 py-4">Atleta</th>
                    <th className="px-4 py-4">Cidade</th>
                    <th className="px-4 py-4 text-center">Inscrições</th>
                    <th className="px-4 py-4">Entrada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAthletes.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-600 text-xs font-bold italic">Nenhum atleta encontrado.</td></tr>
                  ) : filteredAthletes.map(ath => {
                    const athRegs = registrations.filter(r => r.email === ath.email);
                    const joined: Date = ath.createdAt?.toDate?.() ?? new Date(ath.createdAt ?? 0);
                    return (
                      <tr key={ath.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-green-400 font-black text-sm italic">
                              {ath.profileImageUrl
                                ? <img src={ath.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                : (ath.organizerName?.charAt(0) || ath.email?.charAt(0) || '?')
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="text-white text-xs font-black italic uppercase truncate max-w-[140px] sm:max-w-[200px]">{ath.organizerName || ath.email}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[140px] sm:max-w-[200px]">
                                <Mail className="w-2.5 h-2.5 shrink-0" />{ath.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-400 font-medium">—</td>
                        <td className="px-4 py-4 text-center">
                          <span className={cn('text-sm font-black', athRegs.length > 0 ? 'text-yellow-400' : 'text-slate-600')}>
                            {athRegs.length}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {joined.toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Activity Log ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <SectionTitle icon={Activity} label="Log de Atividade" sub="eventos recentes da plataforma" />
        <div className="mt-3 space-y-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 text-xs italic py-4 text-center">Nenhuma atividade recente.</p>
          ) : logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className={cn('w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0', log.color)}>
                <log.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-slate-300 flex-1">{log.text}</span>
              <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap">{log.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const METRIC_COLORS: Record<string, string> = {
  green:  'text-green-400  bg-green-500/10  border-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  red:    'text-red-400    bg-red-500/10    border-red-500/20',
};

const MetricCard = ({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub: string;
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors">
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', METRIC_COLORS[color])}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">{label}</div>
      <div className="text-2xl font-display font-black text-white tracking-tighter italic leading-none">{value}</div>
      <div className="text-[9px] text-slate-600 mt-1 font-medium">{sub}</div>
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <Icon className="w-4 h-4 text-yellow-400 shrink-0" />
    <div>
      <div className="text-xs font-black text-white uppercase tracking-widest">{label}</div>
      <div className="text-[9px] text-slate-600 font-medium">{sub}</div>
    </div>
  </div>
);

const PlanBadge = ({ plan }: { plan?: string }) => (
  <div className={cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic whitespace-nowrap',
    plan === 'MASTER ELITE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
    plan === 'PRO RUNNER'   ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
    'bg-slate-800 text-slate-500 border border-slate-700'
  )}>
    {plan === 'MASTER ELITE' && <Crown className="w-2.5 h-2.5" />}
    {plan === 'PRO RUNNER'   && <Zap   className="w-2.5 h-2.5" />}
    {plan || 'START'}
  </div>
);

const ActionBtn = ({ icon: Icon, title, disabled, onClick, loading, variant }: {
  icon: React.ElementType; title: string; disabled: boolean;
  onClick: () => void; loading: boolean; variant: 'slate' | 'yellow' | 'red';
}) => (
  <button
    disabled={disabled || loading}
    onClick={onClick}
    title={title}
    className={cn(
      'p-2 rounded-xl transition-all border disabled:opacity-30 disabled:cursor-not-allowed',
      variant === 'yellow' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400 hover:text-slate-950' :
      variant === 'red'    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' :
      'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-white'
    )}
  >
    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
  </button>
);

export default AdminDashboard;
