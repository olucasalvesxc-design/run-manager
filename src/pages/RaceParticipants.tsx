import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy,
  Loader2,
  Mail,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const RaceParticipants = () => {
  const { raceId } = useParams();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!raceId) return;

    const fetchRace = async () => {
      const docSnap = await getDoc(doc(db, 'races', raceId));
      if (docSnap.exists()) {
        setRace({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchRace();

    const q = query(collection(db, 'registrations'), where('raceId', '==', raceId));
    return onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [raceId]);

  const filteredParticipants = registrations.filter(reg => {
    const matchesSearch = reg.runnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (regId: string, newStatus: string) => {
     try {
       await updateDoc(doc(db, 'registrations', regId), {
         paymentStatus: newStatus,
         updatedAt: new Date()
       });
     } catch (err) {
       console.error(err);
     }
  };

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard/races" className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Corridas</Link>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <div className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded text-[9px] font-black uppercase tracking-widest">{race?.name}</div>
           </div>
           <h1 className="text-3xl sm:text-5xl font-display font-black italic uppercase tracking-tighter text-white">Participantes</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest italic px-6 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3">
              <Download className="w-4 h-4 text-[#3B82F6]" />
              Exportar CSV
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#11161D] p-6 sm:p-8 rounded-3xl border border-white/5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Total Inscritos</p>
           <div className="text-3xl font-display font-black text-white italic">{registrations.length}</div>
        </div>
        <div className="bg-[#11161D] p-6 sm:p-8 rounded-3xl border border-white/5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Confirmados</p>
           <div className="text-3xl font-display font-black text-emerald-500 italic">{registrations.filter(r => r.paymentStatus === 'confirmed').length}</div>
        </div>
        <div className="bg-[#11161D] p-6 sm:p-8 rounded-3xl border border-white/5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Pendentes</p>
           <div className="text-3xl font-display font-black text-[#3B82F6] italic">{registrations.filter(r => r.paymentStatus === 'pending').length}</div>
        </div>
        <div className="bg-[#11161D] p-6 sm:p-8 rounded-3xl border border-white/5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Receita Estimada</p>
           <div className="text-3xl font-display font-black text-white italic">{formatCurrency(registrations.filter(r => r.paymentStatus === 'confirmed').length * (race?.price || 0))}</div>
        </div>
      </div>

      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
         <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#3B82F6] transition-colors" />
               <input 
                 type="text" 
                 placeholder="BUSCAR ATLETA OU EMAIL..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#3B82F6] transition-all text-white"
               />
            </div>
            
            <div className="flex items-center gap-3">
               <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  {['all', 'confirmed', 'pending'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        statusFilter === s ? "bg-[#3B82F6] text-white" : "text-slate-600 hover:text-white"
                      )}
                    >
                      {s === 'all' ? 'Tudo' : s === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                  <tr>
                     <th className="px-8 py-6 text-left">Atleta</th>
                     <th className="px-8 py-6 text-left">Gênero / Idade</th>
                     <th className="px-8 py-6 text-left">Kit / Tamanho</th>
                     <th className="px-8 py-6 text-left">Status</th>
                     <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredParticipants.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-xs font-black italic text-[#3B82F6] border border-white/5">
                                {reg.runnerName.charAt(0)}
                             </div>
                             <div>
                                <div className="text-white font-bold group-hover:text-[#3B82F6] transition-colors">{reg.runnerName}</div>
                                <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-2">
                                   <Mail className="w-3 h-3" />
                                   {reg.email}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reg.gender === 'male' ? 'Masculino' : 'Feminino'}</div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{reg.age} Anos</div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="text-[10px] font-black text-white uppercase tracking-widest">{reg.kitType ? (reg.kitType === 'full' ? 'Kit Completo' : 'Apenas Número') : 'Padrão'}</div>
                          <div className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-widest">Tamanho: {reg.shirtSize || 'M'}</div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic",
                            reg.paymentStatus === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                          )}>
                             {reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {reg.paymentStatus === 'pending' ? (
                               <button 
                                 onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                 className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                 title="Confirmar Pagamento"
                               >
                                  <CheckCircle2 className="w-4 h-4" />
                               </button>
                             ) : (
                               <button 
                                 onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                 className="p-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg hover:bg-[#3B82F6] hover:text-white transition-all"
                                 title="Marcar como Pendente"
                               >
                                  <Clock className="w-4 h-4" />
                               </button>
                             )}
                             <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <XCircle className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            
            {filteredParticipants.length === 0 && (
               <div className="p-20 text-center">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Nenhum participante encontrado para este filtro.</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default RaceParticipants;
