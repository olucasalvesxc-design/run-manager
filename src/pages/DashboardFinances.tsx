import React, { useEffect, useState } from 'react';
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Race, Registration } from '../types';
import { 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Trophy,
  BarChart3,
  XCircle,
  Eye,
  MessageCircle
} from 'lucide-react';
import { formatCurrency, formatDate, cn, handleFirestoreError, OperationType } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const DashboardFinances = () => {
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [raceFilter, setRaceFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    // Listen to races to get prices and names
    const racesQuery = query(
      collection(db, 'races'),
      where('organizerId', '==', user.uid)
    );
    const unsubRaces = onSnapshot(racesQuery, (snap) => {
      setRaces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Race)));
    });

    // Listen to all registrations
    const regsQuery = query(
      collection(db, 'registrations'),
      where('organizerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubRegs = onSnapshot(regsQuery, (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration)));
      setLoading(false);
    }, (err) => {
      console.error('Error listening to registrations:', err);
      handleFirestoreError(err, OperationType.GET, 'registrations', auth);
    });

    return () => {
      unsubRaces();
      unsubRegs();
    };
  }, [user]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleConfirm = async (regId: string) => {
    setUpdatingId(regId);
    try {
      await updateDoc(doc(db, 'registrations', regId), {
        paymentStatus: 'confirmed',
        status: 'pago',
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (regId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;
    setUpdatingId(regId);
    try {
      await updateDoc(doc(db, 'registrations', regId), {
        status: 'cancelado',
        paymentStatus: 'pending',
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error canceling registration:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.runnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.paymentStatus === statusFilter;
    const matchesRace = raceFilter === 'all' || reg.raceId === raceFilter;
    return matchesSearch && matchesStatus && matchesRace;
  });

  const totalRevenue = filteredRegistrations
    .filter(r => r.paymentStatus === 'confirmed')
    .reduce((acc, curr) => {
      const race = races.find(r => r.id === curr.raceId);
      if (race?.participationType === 'paid') return acc + race.price;
      return acc;
    }, 0);

  const pendingRevenue = filteredRegistrations
    .filter(r => r.paymentStatus === 'pending')
    .reduce((acc, curr) => {
      const race = races.find(r => r.id === curr.raceId);
      if (race?.participationType === 'paid') return acc + race.price;
      return acc;
    }, 0);

  const chartData = races
    .map(race => {
      const raceRegs = registrations.filter(r => r.raceId === race.id && r.paymentStatus === 'confirmed');
      const revenue = raceRegs.reduce((acc, curr) => acc + (race.participationType === 'paid' ? race.price : 0), 0);
      return {
        name: race.name,
        revenue,
        date: new Date(race.date).getTime(),
        displayDate: new Date(race.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
      };
    })
    .sort((a, b) => a.date - b.date);

  const exportCSV = () => {
    const headers = ['ID', 'Atleta', 'Prova', 'Status', 'Valor', 'Data'];
    const rows = filteredRegistrations.map(reg => {
      const race = races.find(r => r.id === reg.raceId);
      const val = race?.participationType === 'paid' ? formatCurrency(race.price) : '0';
      return [
        reg.id,
        reg.runnerName,
        race?.name || '?',
        reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente',
        val,
        new Date(reg.createdAt).toLocaleDateString('pt-BR')
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inscricoes_runmanager.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-2">Relatório Financeiro</h1>
           <p className="text-slate-500 font-medium">Gestão consolidada de todas as suas receitas e atletas.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all border border-slate-800"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/5 rounded-full blur-3xl"></div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Receita Confirmada</div>
            <div className="text-4xl font-display font-black text-green-400 italic tracking-tighter mb-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Baseado em filtros atuais</div>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pendente (A Confirmar)</div>
            <div className="text-4xl font-display font-black text-yellow-500 italic tracking-tighter mb-1">{formatCurrency(pendingRevenue)}</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Aguardando validação PIX</div>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Atletas Listados</div>
            <div className="text-4xl font-display font-black text-white italic tracking-tighter mb-1">{filteredRegistrations.length}</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Filtrados na busca</div>
         </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-slate-950 border border-slate-900 p-8 rounded-[3rem] shadow-2xl">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
               <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
               <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tighter">Evolução por Corrida</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Receita líquida confirmada em R$</p>
            </div>
         </div>
         
         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <defs>
                     <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity={1} />
                        <stop offset="100%" stopColor="#facc15" stopOpacity={0.3} />
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#1e293b', radius: 8 }}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b', 
                      borderRadius: '16px',
                      padding: '12px'
                    }}
                    itemStyle={{ color: '#facc15', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', fontStyle: 'italic' }}
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.name;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]} 
                    barSize={40}
                  />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2.5rem] flex flex-col lg:flex-row gap-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-yellow-400/50 transition-all text-sm font-medium text-white"
            />
         </div>
         <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="relative grow md:grow-0">
               <select 
                 value={raceFilter}
                 onChange={e => setRaceFilter(e.target.value)}
                 className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400/50 transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer pr-12"
               >
                 <option value="all">TODAS AS PROVAS</option>
                 {races.map(r => (
                   <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                 ))}
               </select>
               <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
            <div className="relative grow md:grow-0">
               <select 
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value as any)}
                 className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400/50 transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer pr-12"
               >
                 <option value="all">TODOS STATUS</option>
                 <option value="confirmed">CONFIRMADO</option>
                 <option value="pending">PENDENTE</option>
               </select>
               <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Table List */}
      <div className="bg-slate-950 border border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-900/50">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Atleta</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Evento</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Valor</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Data</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-900">
                  <AnimatePresence mode="popLayout">
                    {filteredRegistrations.map((reg) => {
                      const race = races.find(r => r.id === reg.raceId);
                      return (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={reg.id} 
                          className="hover:bg-slate-900/20 transition-all group"
                        >
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black italic text-yellow-400 group-hover:scale-110 transition-transform">
                                    {reg.runnerName[0].toUpperCase()}
                                 </div>
                                 <div className="min-w-0">
                                    <div className="text-white font-bold truncate group-hover:text-yellow-400 transition-colors uppercase tracking-tight italic">{reg.runnerName}</div>
                                    <div className="text-[10px] text-slate-500 font-bold truncate">{reg.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Trophy className="w-3 h-3 text-yellow-400/30" />
                                 <span className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{race?.name || '---'}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                reg.paymentStatus === 'confirmed' ? "bg-green-400/10 text-green-400" : (
                                  reg.status === 'cancelado' ? "bg-red-400/10 text-red-500" : "bg-yellow-400/10 text-yellow-400"
                                )
                              )}>
                                 {reg.paymentStatus === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : (
                                   reg.status === 'cancelado' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />
                                 )}
                                 {reg.paymentStatus === 'confirmed' ? 'Pago' : (
                                   reg.status === 'cancelado' ? 'Cancelado' : 'Pendente'
                                 )}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="text-white font-black italic font-display">
                                 {race?.participationType === 'paid' ? formatCurrency(race.price) : (race?.participationType === 'beneficent' ? 'SOLIDÁRIO' : 'GRÁTIS')}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-slate-500 font-bold text-[10px] uppercase font-mono">
                                 {new Date(reg.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <a 
                                   href={`https://wa.me/55${reg.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${reg.runnerName}, sou do suporte da corrida ${race?.name}.`)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="p-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                                   title="Falar no WhatsApp"
                                 >
                                    <MessageCircle className="w-4 h-4" />
                                 </a>
                                 {reg.paymentStatus === 'pending' && reg.status !== 'cancelado' && (
                                   <button 
                                     onClick={() => handleConfirm(reg.id)}
                                     disabled={updatingId === reg.id}
                                     className="p-2 bg-yellow-400/10 text-yellow-400 rounded-lg border border-yellow-400/20 hover:bg-yellow-400 hover:text-slate-950 transition-all font-black text-[10px] flex items-center justify-center"
                                     title="Confirmar Pagamento"
                                   >
                                      {updatingId === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                   </button>
                                 )}
                                 {reg.status !== 'cancelado' && (
                                   <button 
                                     onClick={() => handleCancel(reg.id)}
                                     disabled={updatingId === reg.id}
                                     className="p-2 bg-red-400/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black text-[10px]"
                                     title="Cancelar Inscrição"
                                   >
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                 )}
                              </div>
                           </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                  {filteredRegistrations.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic font-medium">Nenhuma inscrição encontrada para os filtros aplicados.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default DashboardFinances;
