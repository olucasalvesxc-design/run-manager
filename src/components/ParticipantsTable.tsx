import React, { useState } from 'react';
import { Registration, Gender, PaymentStatus } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone,
  FilterX,
  FileBadge,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ParticipantsTableProps {
  registrations: Registration[];
  isAdmin?: boolean;
  onTogglePayment?: (reg: Registration) => void;
  onGenerateCertificate?: (reg: Registration) => void;
  title?: string;
}

const ParticipantsTable = ({ 
  registrations, 
  isAdmin = false, 
  onTogglePayment, 
  onGenerateCertificate,
  title = "Participantes" 
}: ParticipantsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');
  const itemsPerPage = 10;

  React.useEffect(() => {
    setJumpInput(currentPage.toString());
  }, [currentPage]);

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.runnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.cpf.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || reg.paymentStatus === statusFilter;
    const matchesGender = genderFilter === 'all' || reg.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-400" />
          {title}
        </h3>
        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{filteredRegistrations.length} atletas encontrados</span>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-[2.5rem] flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 group-focus-within:text-yellow-400 transition-all">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou CPF..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-4 py-4 focus:outline-none focus:border-yellow-400/50 transition-all text-xs font-medium text-white"
            />
         </div>
         <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
               {['all', 'male', 'female'].map(g => (
                 <button
                   key={g}
                   onClick={() => handleFilterChange(setGenderFilter, g)}
                   className={cn(
                     "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                     genderFilter === g ? "bg-yellow-400 text-slate-950" : "text-slate-500 hover:text-white"
                   )}
                 >
                   {g === 'all' ? 'TUDO' : g === 'male' ? 'MASC' : 'FEM'}
                 </button>
               ))}
            </div>

            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
               {['all', 'confirmed', 'pending'].map(s => (
                 <button
                   key={s}
                   onClick={() => handleFilterChange(setStatusFilter, s)}
                   className={cn(
                     "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                     statusFilter === s 
                       ? (s === 'confirmed' ? "bg-green-500 text-white" : s === 'pending' ? "bg-yellow-500 text-white" : "bg-yellow-400 text-slate-950")
                       : "text-slate-500 hover:text-white"
                   )}
                 >
                   {s === 'all' ? 'STATUS' : s === 'confirmed' ? 'CONF' : 'PEND'}
                 </button>
               ))}
            </div>

            {(searchTerm || statusFilter !== 'all' || genderFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setGenderFilter('all');
                }}
                className="p-3 bg-slate-800 text-slate-400 rounded-2xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
         </div>
      </div>

      {/* List */}
      <div className="bg-slate-950 border border-slate-900 rounded-[2rem] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-900/50">
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Atleta</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hidden sm:table-cell">Equipe</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                     {isAdmin && <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ação</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-900">
                  <AnimatePresence mode="popLayout">
                    {paginatedRegistrations.map((reg) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={reg.id} 
                        className="even:bg-white/[0.02] hover:bg-slate-900 transition-all group border-l-2 border-l-transparent hover:border-l-yellow-400/50"
                      >
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black italic text-yellow-400">
                                  {reg.runnerName[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white text-xs font-bold truncate uppercase tracking-tight italic">{reg.runnerName}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[8px] font-black text-slate-600 uppercase bg-slate-900/50 px-1 rounded">{reg.gender === 'male' ? 'M' : 'F'}</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase bg-slate-900/50 px-1 rounded">{reg.jerseySize}</span>
                                  </div>
                                </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[150px]">
                               {reg.team || '---'}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                              reg.paymentStatus === 'confirmed' ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"
                            )}>
                               {reg.paymentStatus === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                               {reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </div>
                         </td>
                         {isAdmin && (
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 {reg.paymentStatus === 'confirmed' && onGenerateCertificate && (
                                   <button
                                     onClick={() => onGenerateCertificate(reg)}
                                     className="px-3 py-1.5 bg-yellow-400/10 text-yellow-500 hover:bg-yellow-400 hover:text-slate-950 rounded-lg transition-all border border-yellow-400/20 flex items-center gap-2 group/cert"
                                     title="Gerar Certificado"
                                   >
                                      <FileBadge className="w-3.5 h-3.5" />
                                      <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Certificado</span>
                                   </button>
                                 )}
                                 <button 
                                   onClick={() => onTogglePayment?.(reg)}
                                   className={cn(
                                     "p-2 rounded-lg transition-all border",
                                     reg.paymentStatus === 'confirmed' 
                                       ? "bg-slate-900 border-slate-800 text-slate-600 hover:text-yellow-400" 
                                       : "bg-green-500 text-white border-green-400"
                                   )}
                                 >
                                    {reg.paymentStatus === 'confirmed' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                 </button>
                              </div>
                           </td>
                         )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredRegistrations.length === 0 && (
                    <tr>
                       <td colSpan={isAdmin ? 4 : 3} className="px-6 py-12 text-center">
                          <p className="text-slate-600 italic font-medium text-xs">Nenhum participante encontrado.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination Controls */}
         {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-900 bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                  Página {currentPage} de {totalPages}
               </span>
               <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Display local window of pages if total is large
                      if (
                        totalPages > 5 && 
                        page !== 1 && 
                        page !== totalPages && 
                        Math.abs(page - currentPage) > 1
                      ) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-slate-700">...</span>;
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
                            currentPage === page 
                              ? "bg-yellow-400 text-slate-950" 
                              : "bg-slate-900 text-slate-500 hover:bg-slate-800"
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white disabled:opacity-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 border-l border-slate-900 pl-4 ml-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Ir para:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="text"
                        value={jumpInput}
                        onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const p = parseInt(jumpInput);
                            if (!isNaN(p) && p >= 1 && p <= totalPages) {
                              setCurrentPage(p);
                            } else {
                              setJumpInput(currentPage.toString());
                            }
                          }
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-1 text-[10px] font-black text-yellow-400 text-center focus:outline-none focus:border-yellow-400 transition-colors"
                      />
                      <button 
                        onClick={() => {
                          const p = parseInt(jumpInput);
                          if (!isNaN(p) && p >= 1 && p <= totalPages) {
                            setCurrentPage(p);
                          } else {
                            setJumpInput(currentPage.toString());
                          }
                        }}
                        className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase italic"
                      >
                        IR
                      </button>
                    </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default ParticipantsTable;
