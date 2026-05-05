import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Edit3, 
  Trash2, 
  ChevronLeft,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Info,
  Loader2,
  AlertCircle,
  XCircle,
  QrCode,
  Activity
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import MapSection from '../components/MapSection';
import ParticipantsTable from '../components/ParticipantsTable';
import { motion, AnimatePresence } from 'motion/react';

const RaceDetail = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!raceId) return;

    const unsubRace = onSnapshot(doc(db, 'races', raceId), (snap) => {
      if (snap.exists()) {
        setRace({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    const q = query(collection(db, 'registrations'), where('raceId', '==', raceId));
    const unsubRegs = onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubRace();
      unsubRegs();
    };
  }, [raceId]);

  const handleDelete = async () => {
     if (!raceId) return;
     setIsDeleting(true);
     try {
       await deleteDoc(doc(db, 'races', raceId));
       navigate('/dashboard/races');
     } catch (err) {
       console.error(err);
       setIsDeleting(false);
     }
  };

  const handleCopyLink = () => {
     const link = `${window.location.origin}/race/${raceId}/enroll`;
     navigator.clipboard.writeText(link);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
    </div>
  );

  if (!race) return (
    <div className="text-center py-20 bg-[#11161D] rounded-[4rem] border border-white/5 mx-4 md:mx-0">
      <XCircle className="w-16 h-16 text-[#3B82F6] mx-auto mb-6" />
      <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-4">Corrida não encontrada.</h2>
      <Link to="/dashboard/races" className="text-[#3B82F6] font-black uppercase tracking-widest text-[10px] italic hover:underline">Voltar para Listagem</Link>
    </div>
  );

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#11161D] p-12 rounded-[3.5rem] border border-white/5 text-center max-w-lg w-full shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent"></div>
                <div className="w-20 h-20 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Trash2 className="w-10 h-10 text-[#3B82F6] animate-pulse" />
                </div>
                <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-4">Excluir Corrida?</h3>
                <p className="text-slate-500 font-bold uppercase italic text-[10px] tracking-widest leading-relaxed mb-10">Essa ação é irreversível. Todas as inscrições associadas serão perdidas permanentemente.</p>
                <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleDelete}
                      className="w-full py-5 bg-[#3B82F6] text-white rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                    >
                       Confirmar Exclusão
                    </button>
                    <button 
                      onClick={() => setIsDeleting(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors p-4"
                    >
                       Cancelar Operação
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
         <div className="space-y-6">
             <Link to="/dashboard/races" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3B82F6] italic group">
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Listagem de Corridas
             </Link>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <h1 className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white leading-[0.8]">{race.name}</h1>
                   <div className={cn(
                        "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic border self-start mt-2",
                        race.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                      )}>
                      {race.status === 'active' ? 'Ativa' : 'Pausada'}
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-8 text-slate-500 font-black uppercase tracking-[0.2em] italic text-xs">
                   <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#3B82F6]" /> {formatDate(race.date)}</div>
                   <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#3B82F6]" /> {race.time}</div>
                   <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3B82F6]" /> {race.location}</div>
                </div>
             </div>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-3 bg-[#3B82F6] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.2)] font-bold group"
            >
               {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Link Copiado!' : 'Link de Inscrição'}
            </button>
            <button 
              onClick={() => setIsDeleting(true)}
              className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
            >
               <Trash2 className="w-6 h-6" />
            </button>
         </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
             {/* Info Cards */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all">
                   <Users className="w-10 h-10 text-white/5 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-6">Total Inscritos</p>
                   <div className="text-4xl font-display font-black text-white italic leading-none">{registrations.length}</div>
                   <div className="mt-4 w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" 
                        style={{ width: `${Math.min((registrations.length / race.capacity) * 100, 100)}%` }}
                      />
                   </div>
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2">{Math.round((registrations.length / race.capacity) * 100)}% DA CAPACIDADE</p>
                </div>

                <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                   <Check className="w-10 h-10 text-white/5 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-6">Confirmados (Pagas)</p>
                   <div className="text-4xl font-display font-black text-emerald-500 italic leading-none">{registrations.filter(r => r.paymentStatus === 'confirmed').length}</div>
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2 italic flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      TAXA DE CONVERSÃO EXCELENTE
                   </p>
                </div>

                <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all md:col-span-1 col-span-2">
                   <Zap className="w-10 h-10 text-white/5 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-6">Arrecadação Bruta</p>
                   <div className="text-2xl sm:text-4xl font-display font-black text-[#3B82F6] italic leading-none">{formatCurrency(registrations.filter(r => r.paymentStatus === 'confirmed').length * (race.price || 0))}</div>
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">MÉDIA DE R$ {race.price || '0'}</p>
                </div>
             </div>

             {/* Participants Component */}
             <div className="bg-[#11161D] rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <ParticipantsTable 
                  registrations={registrations} 
                  raceId={raceId!} 
                  raceName={race.name}
                  isAdmin={true}
                />
             </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-8">
            <div className="bg-[#3B82F6] p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-[#3B82F6]/20">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                  <QrCode className="w-24 h-24" />
               </div>
               <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 leading-none">Divulgação <br /> Master.</h4>
               <p className="text-[10px] font-bold uppercase tracking-widest italic leading-relaxed mb-10 opacity-70">Sua página de inscrição foi otimizada para SEO e alta conversão mobile.</p>
               
               <div className="bg-black/20 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md mb-6 border border-white/10 group/item">
                  <div className="flex-1 truncate text-xs font-mono font-bold tracking-widest opacity-80">{window.location.origin}/race/{raceId}/enroll</div>
                  <button 
                    onClick={handleCopyLink}
                    className="p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                     <Copy className="w-4 h-4" />
                  </button>
               </div>

               <Link 
                 to={`/race/${raceId}/enroll`}
                 target="_blank"
                 className="block w-full text-center bg-white text-black py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all font-bold"
               >
                  Ver Página Pública
               </Link>
            </div>

            <div className="bg-[#11161D] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ExternalLink className="w-24 h-24" />
               </div>
               <h4 className="text-xl font-display font-black italic uppercase tracking-widest mb-10 text-[#3B82F6]">Configurar Prova</h4>
              
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
                     <div>
                        <p className="text-xs font-black uppercase italic text-white mb-1">Inscrições Automáticas</p>
                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Confirmação via PIX</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
                     <div>
                        <p className="text-xs font-black uppercase italic text-white mb-1">Customização de Kits</p>
                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Número + Brindes</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
                     <div>
                        <p className="text-xs font-black uppercase italic text-white mb-1">Relatórios de Atletas</p>
                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Download Base CRM</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            </div>

            {/* Map Section */}
            <div className="bg-[#11161D] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden aspect-square sm:aspect-auto sm:h-96">
               <MapSection address={race.location} raceName={race.name} />
            </div>
         </div>
      </div>
    </div>
  );
};

export default RaceDetail;
