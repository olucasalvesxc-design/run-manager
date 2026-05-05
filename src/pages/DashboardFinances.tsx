import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Zap,
  Clock,
  Loader2,
  Trophy
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';

const DashboardFinances = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'registrations'),
      where('organizerEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [user]);

  const totalRevenue = registrations
    .filter(r => r.paymentStatus === 'confirmed')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const pendingRevenue = registrations
    .filter(r => r.paymentStatus === 'pending')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const filteredRegistrations = registrations.filter(reg => 
    reg.runnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.raceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div>
           <div className="flex items-center gap-3 text-[#3B82F6] mb-4">
              <ShieldCheck className="w-5 h-5 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">FINANCEIRO MASTER</span>
           </div>
           <h1 className="flex flex-col leading-none">
              <span className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-800">Minha</span>
              <span className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white -mt-2">Gestão</span>
           </h1>
        </div>
        
        <button className="bg-[#3B82F6] text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(59,130,246,0.3)] text-xs font-bold">
           <Download className="w-4 h-4" />
           Exportar Extrato
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 md:px-0">
        <div className="bg-[#11161D] p-8 sm:p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
              <TrendingUp className="w-32 h-32 text-emerald-500" />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Receita Confirmada</p>
           <div className="text-4xl sm:text-5xl font-display font-black text-white italic tracking-tighter mb-1">{formatCurrency(totalRevenue)}</div>
           <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] italic">
              <ArrowUpRight className="w-4 h-4" />
              +24% ESTE MÊS
           </div>
        </div>

        <div className="bg-[#11161D] p-8 sm:p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
              <Clock className="w-32 h-32 text-[#3B82F6]" />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Aguardando Pagamento</p>
           <div className="text-4xl sm:text-5xl font-display font-black text-[#3B82F6] italic tracking-tighter mb-1">{formatCurrency(pendingRevenue)}</div>
           <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] italic">
              <Clock className="w-4 h-4" />
              {registrations.filter(r => r.paymentStatus === 'pending').length} TRANSAÇÕES
           </div>
        </div>

        <div className="bg-[#3B82F6] p-8 sm:p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-20 scale-150 rotate-12">
              <Zap className="w-32 h-32" />
           </div>
           <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-10 italic">Total Transacionado</p>
           <div className="text-4xl sm:text-5xl font-display font-black italic tracking-tighter mb-1">{formatCurrency(totalRevenue + pendingRevenue)}</div>
           <div className="flex items-center gap-2 text-white/70 font-black text-[10px] italic">
              <DollarSign className="w-4 h-4" />
              VALOR BRUTO
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#11161D] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl mx-4 md:mx-0">
         <div className="p-8 sm:p-12 border-b border-white/5 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
               <h2 className="text-2xl font-display font-black italic uppercase tracking-wider text-white">Fluxo de <span className="text-[#3B82F6]">Caixa</span></h2>
               <div className="flex items-center gap-4">
                  <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#3B82F6] transition-colors" />
                     <input 
                       type="text"
                       placeholder="BUSCAR TRANSAÇÃO..."
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-[#3B82F6]/50 transition-all text-[10px] font-black tracking-widest uppercase text-white placeholder:text-slate-700"
                     />
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-4">
               {['all', 'confirmed', 'pending'].map(f => (
                 <button
                   key={f}
                   onClick={() => setTimeFilter(f)}
                   className={cn(
                     "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all",
                     timeFilter === f ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20" : "bg-black/40 text-slate-500 border border-white/5 hover:text-white"
                   )}
                 >
                   {f === 'all' ? 'Todas' : f === 'confirmed' ? 'Confirmadas' : 'Pendentes'}
                 </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                  <tr>
                     <th className="px-12 py-8 text-left">Beneficiário / Prova</th>
                     <th className="px-12 py-8 text-left">Data do Registro</th>
                     <th className="px-12 py-8 text-left">Status</th>
                     <th className="px-12 py-8 text-right">Valor Bruto</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredRegistrations.filter(r => timeFilter === 'all' || r.paymentStatus === timeFilter).map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-all group">
                       <td className="px-12 py-8">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-xs font-black italic text-[#3B82F6] group-hover:scale-110 transition-transform">
                                {reg.runnerName.charAt(0)}
                             </div>
                             <div>
                                <div className="text-white font-black italic uppercase tracking-tighter text-sm mb-1 group-hover:text-[#3B82F6] transition-colors">{reg.runnerName}</div>
                                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                   <Trophy className="w-3.5 h-3.5" />
                                   {reg.raceName || 'Prova Sincronizada'}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-12 py-8">
                          <div className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{reg.createdAt?.toDate ? formatDate(reg.createdAt.toDate()) : 'RECÉM CRIADA'}</div>
                       </td>
                       <td className="px-12 py-8">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest italic border",
                            reg.paymentStatus === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                          )}>
                             {reg.paymentStatus === 'confirmed' ? 'Líquido' : 'Pendente'}
                          </span>
                       </td>
                       <td className="px-12 py-8 text-right font-display font-black text-white italic text-lg tracking-tighter">
                          {formatCurrency(reg.price || 0)}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            
            {filteredRegistrations.length === 0 && (
               <div className="p-32 text-center text-slate-700 italic">
                  <CreditCard className="w-12 h-12 mx-auto mb-6 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma transação encontrada.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default DashboardFinances;
