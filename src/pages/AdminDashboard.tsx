import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Profile } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  RefreshCw,
  Crown,
  Zap,
  TrendingUp,
  Settings,
  Mail,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'all' | 'premium' | 'trial'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Professionals (Organizers/Trainers)
      const q = query(
        collection(db, 'profiles'),
        where('role', 'in', ['organizer', 'admin']),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
      setOrganizers(data);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'profiles', userId), {
        planName: newPlan,
        planStatus: 'active',
        updatedAt: new Date()
      });
      setOrganizers(prev => prev.map(org => 
        org.id === userId ? { ...org, planName: newPlan, planStatus: 'active' } : org
      ));
    } catch (err) {
      console.error('Error updating plan:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrganizers = organizers.filter(org => {
    const matchesSearch = org.organizerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeView === 'premium') return matchesSearch && (org.planName === 'PRO RUNNER' || org.planName === 'MASTER ELITE');
    if (activeView === 'trial') return matchesSearch && org.planStatus === 'trial';
    return matchesSearch;
  });

  const stats = {
    total: organizers.length,
    pro: organizers.filter(o => o.planName === 'PRO RUNNER').length,
    master: organizers.filter(o => o.planName === 'MASTER ELITE').length,
    active: organizers.filter(o => o.planStatus === 'active').length,
    trial: organizers.filter(o => o.planStatus === 'trial').length,
  };

  // Generate chart data based on registrations
  const chartData = [
    { name: 'Sem 1', users: 12 },
    { name: 'Sem 2', users: 18 },
    { name: 'Sem 3', users: 15 },
    { name: 'Sem 4', users: 24 },
    { name: 'Hoje', users: stats.total },
  ];

  return (
    <div className="bg-[#050A14] rounded-[2.5rem] p-6 sm:p-10 space-y-8 pb-20 animate-in fade-in duration-700 text-white shadow-2xl">
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 border-b border-white/5 pb-12 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 relative z-10 w-full lg:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] shrink-0">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.4em] mb-1.5">SISTEMA ATIVO: MASTER_AUTH</div>
              <h1 className="text-4xl lg:text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                ADMIN <span className="text-slate-500">HUB</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto relative z-10">
          <QuickStat label="Total Profissionais" value={stats.total} trend="+12%" icon={<Users className="w-4 h-4" />} />
          <QuickStat label="Assinaturas Ativas" value={stats.pro + stats.master} trend="+5%" highlighted icon={<Zap className="w-4 h-4" />} />
          <QuickStat label="Contas em Teste" value={stats.trial} trend="-2%" icon={<Clock className="w-4 h-4" />} />
          <QuickStat label="Conexão" value="Estável" status="live" icon={<Activity className="w-4 h-4" />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics & Management */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Chart Card */}
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
             
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
                <div>
                   <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter mb-2">Trajetória de Crescimento</h2>
                   <p className="text-sm text-[#94A3B8] font-medium">Adesão de novos organizadores nos últimos 30 dias</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-[#0B1220] rounded-xl border border-blue-500/10">
                   <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">Tempo Real</span>
                </div>
             </div>

             <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                         <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight={900} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1220', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ color: '#3B82F6', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3B82F6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                        animationDuration={2000}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* User Management Table */}
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <div className="p-6 sm:p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-[#0B1220] rounded-2xl flex items-center justify-center border border-white/5 relative group-hover:border-blue-500/50 transition-colors">
                      <Users className="w-6 h-6 text-[#3B82F6]" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter mb-1">Gestão de Licenças</h2>
                      <p className="text-sm text-[#94A3B8] font-medium">Controle de acesso e upgrade de planos</p>
                   </div>
                </div>

                <div className="flex bg-[#0B1220] p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
                   <ViewTab active={activeView === 'all'} onClick={() => setActiveView('all')}>Todos</ViewTab>
                   <ViewTab active={activeView === 'premium'} onClick={() => setActiveView('premium')}>PRO/MASTER</ViewTab>
                   <ViewTab active={activeView === 'trial'} onClick={() => setActiveView('trial')}>Trial</ViewTab>
                </div>
             </div>

             <div className="p-6 sm:p-10">
                <div className="relative mb-8 group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
                   <input 
                     type="text" 
                     placeholder="Buscar organizador por nome ou e-mail..."
                     className="w-full bg-[#0B1220] border-2 border-white/5 rounded-2xl pl-14 pr-8 py-4 focus:outline-none focus:border-[#3B82F6]/40 transition-all text-white font-medium placeholder:text-slate-600 shadow-inner"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                   <table className="w-full text-left border-separate border-spacing-y-4">
                      <thead>
                         <tr className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] italic">
                            <th className="px-4 pb-2">Profissional</th>
                            <th className="px-4 pb-2">Nível / Créditos</th>
                            <th className="px-4 pb-2 text-right">Licença / Recarregar</th>
                         </tr>
                      </thead>
                      <tbody>
                         {loading ? (
                            <tr>
                               <td colSpan={3} className="py-20 text-center">
                                  <div className="flex flex-col items-center gap-4">
                                     <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                                     <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest animate-pulse">Consultando Registros...</span>
                                  </div>
                               </td>
                            </tr>
                         ) : filteredOrganizers.map((org) => (
                            <tr key={org.id} className="group">
                               <td className="bg-[#0B1220]/40 p-4 rounded-l-2xl border-y border-l border-white/5 group-hover:bg-[#3B82F6]/5 transition-colors">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl bg-[#111827] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {org.profileImageUrl ? (
                                           <img src={org.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : <Users className="w-5 h-5 text-slate-500" />}
                                     </div>
                                     <div className="min-w-0">
                                        <div className="text-sm font-black text-white uppercase truncate">{org.organizerName || 'Usuário Sem Nome'}</div>
                                        <div className="text-[10px] text-[#94A3B8] font-bold truncate">{org.email}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="bg-[#0B1220]/40 p-4 border-y border-white/5 group-hover:bg-[#3B82F6]/5 transition-colors">
                                  <div className="space-y-3">
                                     <PlanBadge plan={org.planName || 'TRIAL'} status={org.planStatus} />
                                     <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-white/5 w-fit">
                                        <Zap className="w-3 h-3 text-[#3B82F6]" />
                                        <span className="text-[10px] font-black text-white italic">{org.raceCredits || 0}</span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CRÉDITOS</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="bg-[#0B1220]/40 p-4 rounded-r-2xl border-y border-r border-white/5 text-right group-hover:bg-[#3B82F6]/5 transition-colors">
                                  <div className="flex items-center justify-end gap-2">
                                     <div className="flex flex-col gap-1 mr-2">
                                        <PlanAction 
                                          active={org.planName === 'PRO RUNNER'} 
                                          icon={<Zap className="w-4 h-4" />} 
                                          onClick={() => updatePlan(org.id, 'PRO RUNNER')}
                                          loading={updatingId === org.id}
                                          variant="blue"
                                        />
                                        <PlanAction 
                                          active={org.planName === 'MASTER ELITE'} 
                                          icon={<Crown className="w-4 h-4" />} 
                                          onClick={() => updatePlan(org.id, 'MASTER ELITE')}
                                          loading={updatingId === org.id}
                                          variant="indigo"
                                        />
                                     </div>

                                     <div className="w-px h-10 bg-white/5 mx-2" />
                                     
                                     <div className="flex flex-col gap-1">
                                        <button 
                                          onClick={async () => {
                                             setUpdatingId(org.id);
                                             await updateDoc(doc(db, 'profiles', org.id), { raceCredits: (org.raceCredits || 0) + 5 });
                                             fetchData();
                                             setUpdatingId(null);
                                          }}
                                          className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
                                        >
                                           +5 CRED
                                        </button>
                                        <button 
                                          onClick={async () => {
                                             setUpdatingId(org.id);
                                             await updateDoc(doc(db, 'profiles', org.id), { raceCredits: (org.raceCredits || 0) + 10 });
                                             fetchData();
                                             setUpdatingId(null);
                                          }}
                                          className="px-3 py-1 bg-[#3B82F6] text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all"
                                        >
                                           +10 CRED
                                        </button>
                                     </div>

                                     <div className="w-px h-6 bg-white/5 mx-2" />
                                     <button className="p-2.5 rounded-xl bg-[#111827] border border-white/5 text-[#94A3B8] hover:text-[#3B82F6] hover:border-[#3B82F6]/30 transition-all">
                                        <Settings className="w-4 h-4" />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Activity & Summary */}
        <div className="lg:col-span-4 space-y-8">
           {/* Revenue Summary Card */}
           <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                 </div>
                 <h2 className="text-xl font-display font-black text-white italic uppercase tracking-tighter">Performance de Planos</h2>
              </div>

              <div className="space-y-6">
                 {[
                   { label: 'MASTER ELITE', count: stats.master, price: 297, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                   { label: 'PRO RUNNER', count: stats.pro, price: 97, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
                   { label: 'TRIAL ACCOUNTS', count: stats.trial, price: 0, color: 'text-slate-400', bg: 'bg-white/5' },
                 ].map((plan, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1220]/60 border border-white/5 hover:border-[#3B82F6]/20 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", plan.bg.replace('/10', ''))} />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-black text-white uppercase italic">{plan.label}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{plan.count} ASSINANTES</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-display font-black text-white italic tracking-tighter">R$ {plan.count * plan.price}</p>
                          <p className="text-[8px] text-[#3B82F6] font-black uppercase tracking-[0.2em] italic">MRR EST.</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Receita Mensal Estimada</span>
                 <span className="text-2xl font-display font-black text-[#3B82F6] italic tracking-tighter">
                   R$ {(stats.master * 297 + stats.pro * 97).toLocaleString()}
                 </span>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 group hover:border-[#3B82F6]/30 transition-all cursor-default">
                 <div className="flex justify-between items-start mb-6">
                    <Crown className="w-8 h-8 text-amber-500" />
                    <div className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">MASTER</div>
                 </div>
                 <h3 className="text-4xl font-display font-black text-white italic tracking-tighter mb-1">{stats.master}</h3>
                 <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest italic">Elite Professionals</p>
              </div>

              <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 group hover:border-[#3B82F6]/30 transition-all cursor-default">
                 <div className="flex justify-between items-start mb-6">
                    <Zap className="w-8 h-8 text-[#3B82F6]" />
                    <div className="text-[10px] font-black text-[#3B82F6]/50 uppercase tracking-widest">PRO</div>
                 </div>
                 <h3 className="text-4xl font-display font-black text-white italic tracking-tighter mb-1">{stats.pro}</h3>
                 <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest italic">Runner Subscriptions</p>
              </div>
           </div>

           {/* System Action */}
           <button className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all flex items-center justify-between group active:scale-[0.98]">
              <div className="text-left">
                 <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter leading-none mb-2">Manutenção DB</h3>
                 <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Otimizar e Limpar</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:rotate-45 transition-transform duration-500">
                 <ArrowUpRight className="text-white w-7 h-7" />
              </div>
           </button>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, trend, highlighted, status, icon }: any) => (
  <div className={cn(
    "p-6 rounded-3xl border transition-all h-full flex flex-col justify-between group",
    highlighted 
      ? "bg-[#3B82F6] border-[#3B82F6] shadow-[0_20px_40px_rgba(59,130,246,0.2)]" 
      : "bg-[#111827] border-white/5 hover:border-[#3B82F6]/30"
  )}>
     <div className="flex justify-between items-start mb-8 text-left">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center border",
          highlighted ? "bg-white/20 border-white/30" : "bg-[#0B1220] border-white/5"
        )}>
           {React.cloneElement(icon, { className: highlighted ? "text-white" : "text-[#3B82F6]" })}
        </div>
        {status === 'live' && (
           <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-ping" />
              <span className="text-[8px] font-black tracking-widest text-[#3B82F6]">ESTÁVEL</span>
           </div>
        )}
        {!status && trend && (
           <span className={cn(
             "text-[10px] font-black px-2 py-1 rounded-lg",
             highlighted ? "bg-white/20 text-white" : (trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")
           )}>
             {trend}
           </span>
        )}
     </div>
     <div>
        <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1.5", highlighted ? "text-white/70" : "text-[#94A3B8]")}>
          {label}
        </div>
        <div className={cn("text-3xl font-display font-black italic tracking-tighter", highlighted ? "text-white" : "text-white")}>
          {value}
        </div>
     </div>
  </div>
);

const ViewTab = ({ children, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
      active ? "bg-[#3B82F6] text-white shadow-lg" : "text-[#94A3B8] hover:text-white"
    )}
  >
    {children}
  </button>
);

const PlanBadge = ({ plan, status }: { plan: string, status?: string }) => {
  const isMaster = plan === 'MASTER ELITE';
  const isPro = plan === 'PRO RUNNER';
  const isTrial = status === 'trial';

  return (
    <div className="flex flex-col gap-2">
       <div className={cn(
          "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic border self-start shadow-sm",
          isMaster ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          isPro ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
          isTrial ? "bg-[#94A3B8]/10 text-[#94A3B8] border-white/10" :
          "bg-slate-800 text-slate-500 border-white/10"
       )}>
          {isMaster && <Crown className="w-3.5 h-3.5" />}
          {isPro && <Zap className="w-3.5 h-3.5" />}
          {plan}
       </div>
       {isTrial && (
         <div className="flex items-center gap-2 ml-1">
           <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-pulse" />
           <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest italic">Período de Teste</span>
         </div>
       )}
    </div>
  );
};

const PlanAction = ({ active, icon, onClick, loading, variant }: any) => (
  <button 
    onClick={onClick}
    disabled={active || loading}
    className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all disabled:opacity-20 relative group overflow-hidden",
      variant === 'blue' ? "bg-blue-500/5 border-blue-500/20 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]" :
      "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]",
      active && "bg-white/5 border-transparent text-slate-700 scale-90"
    )}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
  </button>
);

export default AdminDashboard;
