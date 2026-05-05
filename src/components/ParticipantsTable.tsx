import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Download, 
  Filter, 
  MoreVertical,
  Mail,
  User,
  ShieldCheck,
  CreditCard,
  Target,
  Zap,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ParticipantsTableProps {
  registrations: any[];
  raceId: string;
  raceName: string;
  isAdmin?: boolean;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({ registrations, raceId, raceName, isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = registrations.filter(r => {
    const matchesSearch = r.runnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || r.paymentStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full">
      <div className="p-8 sm:p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div>
            <div className="flex items-center gap-3 text-[#3B82F6] mb-3">
               <ShieldCheck className="w-4 h-4 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic">Base de Atletas</h3>
            </div>
            <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">Inscritos <span className="text-slate-600">({registrations.length})</span></h2>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#3B82F6] transition-colors" />
               <input 
                 type="text" 
                 placeholder="BUSCAR ATLETA..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#3B82F6]/50 transition-all text-white placeholder:text-slate-700"
               />
            </div>
            
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
               {['all', 'confirmed', 'pending'].map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={cn(
                     "flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all",
                     filter === f ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20" : "text-slate-600 hover:text-white"
                   )}
                 >
                   {f === 'all' ? 'Tudo' : f === 'confirm' ? 'Pagas' : 'Pend.'}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <div className="overflow-x-auto">
         <table className="w-full">
            <thead className="bg-black/20 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">
               <tr>
                  <th className="px-12 py-8 text-left">Atleta / Identidade</th>
                  <th className="px-12 py-8 text-left">Kit & Tamanho</th>
                  <th className="px-12 py-8 text-left">Status Financeiro</th>
                  <th className="px-12 py-8 text-right">Inscrição</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {filtered.map((reg) => (
                 <tr key={reg.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-12 py-8">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-xs font-black italic text-[#3B82F6] group-hover:scale-110 transition-transform relative overflow-hidden">
                             <div className="absolute inset-0 bg-[#3B82F6]/5 blur-sm" />
                             {reg.runnerName.charAt(0)}
                          </div>
                          <div>
                             <div className="text-white font-black italic uppercase tracking-widest text-sm mb-1 group-hover:text-[#3B82F6] transition-colors">{reg.runnerName}</div>
                             <div className="text-[10px] text-slate-600 flex items-center gap-2 uppercase font-black italic tracking-widest">
                                <Mail className="w-3.5 h-3.5" />
                                {reg.email}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-12 py-8">
                       <div className="flex flex-col gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-white/5 w-fit">
                             <Target className="w-3 h-3 text-[#3B82F6]" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">TAMANHO: {reg.shirtSize || 'M'}</span>
                          </div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest italic">{reg.kitType === 'full' ? 'KIT PERFORMANCE' : 'KIT ESSENCIAL'}</div>
                       </div>
                    </td>
                    <td className="px-12 py-8">
                       <div className={cn(
                         "inline-flex items-center gap-3 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic border",
                         reg.paymentStatus === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                       )}>
                          {reg.paymentStatus === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              CONFIRMADO
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              PENDENTE
                            </>
                          )}
                       </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="font-display font-black text-white italic tracking-tighter text-lg">{formatCurrency(reg.price || 0)}</div>
                       <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-[#3B82F6] transition-colors">{formatDate(reg.createdAt?.toDate ? reg.createdAt.toDate() : new Date())}</div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         
         {filtered.length === 0 && (
            <div className="p-32 text-center text-slate-700 italic">
               <Users className="w-12 h-12 mx-auto mb-6 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum atleta localizado para este critério.</p>
            </div>
         )}
      </div>

      <div className="p-10 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
               <CreditCard className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="text-left">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Receita do Grupo</p>
               <p className="text-xl font-display font-black text-white italic tracking-tighter">{formatCurrency(registrations.filter(r => r.paymentStatus === 'confirmed').reduce((acc, c) => acc + (c.price || 0), 0))}</p>
            </div>
         </div>
         
         {isAdmin && (
           <button className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-bold">
              Imprimir Check-in Lista
           </button>
         )}
      </div>
    </div>
  );
};

export default ParticipantsTable;
