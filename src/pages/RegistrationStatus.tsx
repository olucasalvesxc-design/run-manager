import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  CreditCard,
  Copy,
  Info,
  ExternalLink,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const RegistrationStatus = () => {
  const { registrationId } = useParams();
  const [registration, setRegistration] = useState<any>(null);
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!registrationId) return;

    const unsub = onSnapshot(doc(db, 'registrations', registrationId), async (snap) => {
      if (snap.exists()) {
        const regData = snap.data();
        setRegistration({ id: snap.id, ...regData });
        
        const raceSnap = await getDoc(doc(db, 'races', regData.raceId));
        if (raceSnap.exists()) {
          setRace({ id: raceSnap.id, ...raceSnap.data() });
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [registrationId]);

  const handleCopyPix = () => {
    if (!race?.pixKey) return;
    navigator.clipboard.writeText(race.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center p-6">
      <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
    </div>
  );

  if (!registration || !race) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-[#3B82F6] mb-6" />
        <h1 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-4">Inscrição não encontrada</h1>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic mb-8">Verifique o link ou entre em contato com o suporte.</p>
        <Link 
          to="/"
          className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] italic"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const isConfirmed = registration.paymentStatus === 'confirmed';

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans selection:bg-[#3B82F6]/30 overflow-x-hidden p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto py-12 md:py-20 relative">
          {/* Background Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3B82F6]/10 rounded-full blur-[80px] pointer-events-none" />

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-12 group italic"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Página Inicial
          </Link>

          <div className="bg-[#11161D] rounded-[3rem] p-8 sm:p-16 border border-white/5 shadow-2x relative overflow-hidden">
             {/* Status Badge */}
             <div className="flex justify-center mb-10">
                <div className={cn(
                  "px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest italic flex items-center gap-3 border",
                  isConfirmed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                )}>
                   {isConfirmed ? (
                     <>
                       <CheckCircle2 className="w-4 h-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       Inscrição Confirmada
                     </>
                   ) : (
                     <>
                       <Clock className="w-4 h-4 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                       Aguardando Pagamento
                     </>
                   )}
                </div>
             </div>

             <div className="text-center space-y-6 mb-16">
                <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic mb-4">Protocolo: #{registration.id.slice(0, 8).toUpperCase()}</p>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black italic uppercase tracking-tighter leading-none text-white">
                   {registration.runnerName.split(' ')[0]}, <br />
                   <span className={cn("font-black italic uppercase tracking-tighter", isConfirmed ? "text-emerald-500" : "text-[#3B82F6]")}>
                      {isConfirmed ? "VOCÊ ESTÁ PRONTO." : "QUASE LÁ."}
                   </span>
                </h1>
                <p className="max-w-md mx-auto text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed italic">
                   {isConfirmed 
                     ? "Seu pagamento foi processado com sucesso. Prepare seu kit, nos vemos na linha de largada!" 
                     : "Sua vaga está pré-reservada. Complete o pagamento via PIX para garantir seu número de peito."}
                </p>
             </div>

             {/* Action Section */}
             {!isConfirmed && (
                <div className="mt-4 p-8 bg-[#3B82F6]/5 rounded-[2.5rem] border border-[#3B82F6]/20 flex flex-col gap-8 shadow-inner">
                   <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20">
                         <CreditCard className="w-8 h-8 text-[#3B82F6]" />
                      </div>
                      <div className="text-center sm:text-left">
                         <span className="text-sm text-[#3B82F6] uppercase font-black italic tracking-widest block mb-1">Pagamento via PIX Único</span>
                         <p className="text-[10px] text-slate-500 font-bold uppercase italic tracking-widest">A confirmação é automática após o envio.</p>
                      </div>
                      <div className="sm:ml-auto">
                         <div className="text-3xl font-display font-black text-white italic tracking-tighter">{formatCurrency(race.price)}</div>
                      </div>
                   </div>

                   <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5">
                      <div className="flex flex-col md:flex-row items-center gap-10">
                         <div className="w-32 h-32 bg-white p-3 rounded-2xl flex-shrink-0 animate-in fade-in zoom-in duration-700">
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white italic text-center">
                               QR CODE <br /> PIX
                            </div>
                         </div>
                         <div className="flex-1 space-y-4 w-full">
                             <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic text-center md:text-left">
                                Copie a chave Pix abaixo para realizar o pagamento.
                             </p>
                             <div className="flex items-center gap-2 bg-[#05070A] p-4 rounded-xl border border-white/5">
                                <code className="text-[#3B82F6] font-mono break-all text-xs font-bold leading-none flex-1 truncate">{race.pixKey}</code>
                                <button 
                                  onClick={handleCopyPix}
                                  className="bg-[#3B82F6] text-white p-3 rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#3B82F6]/20 shrink-0"
                                >
                                   {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                             </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* Details Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-16 pt-16 border-t border-white/5">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] italic">Informações da Prova</h4>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <Trophy className="w-4 h-4 text-slate-700" />
                          <span className="text-sm font-display font-black italic uppercase text-white truncate">{race.name}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 font-bold uppercase italic text-[10px] tracking-widest">
                          <Calendar className="w-4 h-4" />
                          {formatDate(race.date)} • {race.time}
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 font-bold uppercase italic text-[10px] tracking-widest">
                          <MapPin className="w-4 h-4" />
                          {race.location}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] italic">Dados do Atleta</h4>
                    <div className="space-y-3">
                       <p className="text-sm font-display font-black italic uppercase text-white truncate">{registration.runnerName}</p>
                       <p className="text-slate-500 font-bold uppercase italic text-[10px] tracking-widest">E-mail: {registration.email}</p>
                       <p className="text-slate-500 font-bold uppercase italic text-[10px] tracking-widest">Kit: {registration.kitType || 'Padrão'} / Tam: {registration.shirtSize || 'M'}</p>
                    </div>
                 </div>
             </div>

             <div className="mt-16 flex flex-col gap-4">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-3"
                >
                  <Copy className="w-4 h-4" />
                  Imprimir Comprovante
                </button>
                <Link 
                  to="/atleta"
                  className="w-full py-5 bg-[#3B82F6] text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-[#3B82F6]/10 hover:scale-[1.02] active:scale-95 transition-all font-bold"
                >
                  Ir para Portal do Atleta
                  <ChevronRight className="w-4 h-4" />
                </Link>
             </div>
          </div>

          <div className="mt-12 text-center">
             <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic">RunPro Performance Lab • 2025</p>
          </div>
      </div>
    </div>
  );
};

export default RegistrationStatus;
