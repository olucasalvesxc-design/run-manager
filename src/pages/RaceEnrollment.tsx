import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Copy,
  Info,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowRight,
  Dumbbell,
  Activity
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const RaceEnrollment = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    runnerName: '',
    email: '',
    phone: '',
    gender: 'male',
    age: '',
    shirtSize: 'M',
    kitType: 'full',
    participationType: 'paid'
  });

  useEffect(() => {
    if (!raceId) return;
    const fetchRace = async () => {
      const docSnap = await getDoc(doc(db, 'races', raceId));
      if (docSnap.exists()) {
        setRace({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchRace();
  }, [raceId]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raceId || !race) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const resp = await addDoc(collection(db, 'registrations'), {
        ...formData,
        raceId,
        raceName: race.name,
        price: race.price,
        organizerEmail: race.organizerEmail || '',
        paymentStatus: race.participationType === 'free' ? 'confirmed' : 'pending',
        createdAt: serverTimestamp()
      });
      setStep(3);
      // Optional: Navigation to status page after some delay or if it's free
      if (race.participationType === 'free') {
         setTimeout(() => navigate(`/registration/${resp.id}`), 3000);
      } else {
         navigate(`/registration/${resp.id}`);
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!race) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center p-6 text-center">
       <AlertCircle className="w-16 h-16 text-[#3B82F6] mb-8" />
       <h1 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-4">Corrida não encontrada</h1>
       <Link to="/" className="text-[#3B82F6] font-black uppercase tracking-widest text-[10px] italic hover:underline">Voltar para o Início</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans selection:bg-[#3B82F6] selection:text-white overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3B82F6]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/3 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto py-12 md:py-24 relative z-10 px-4 sm:px-8">
        {/* Branding & Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 md:mb-32">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Trophy className="w-7 h-7 text-white" />
                 </div>
                 <span className="text-2xl font-display font-black italic uppercase tracking-tighter">RUN<span className="text-[#3B82F6]">PRO</span></span>
              </div>
              
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-4 py-2 rounded-full">
                    <Zap className="w-4 h-4 text-[#3B82F6] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] italic">Inscrições Oficiais Abertas</span>
                 </div>
                 <h1 className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter leading-[0.8] text-white max-w-2xl">
                    {race.name}
                 </h1>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-slate-500 font-black uppercase tracking-[0.2em] italic text-xs">
                 <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[#3B82F6]" /> {formatDate(race.date)}</div>
                 <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#3B82F6]" /> {race.time}</div>
                 <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[#3B82F6]" /> {race.location}</div>
              </div>
           </div>

           <div className="bg-[#11161D] rounded-[3.5rem] p-10 border border-white/5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group min-w-[300px]">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <CreditCard className="w-24 h-24 text-[#3B82F6]" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-6">Investimento Prova</p>
              <div className="text-6xl font-display font-black italic text-[#3B82F6] tabular-nums tracking-tighter mb-2 group-hover:scale-110 transition-transform">
                 {formatCurrency(race.price)}
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">VALOR LÍQUIDO DO LOTE</p>
           </div>
        </div>

        {/* Enrollment Card */}
        <div className="max-w-4xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-[#11161D] rounded-[4rem] p-8 sm:p-16 border border-white/5 shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <ShieldCheck className="w-64 h-64 text-[#3B82F6]" />
              </div>

              <div className="flex items-center justify-between mb-16 relative z-10 border-b border-white/5 pb-10">
                 <h2 className="text-3xl font-display font-black italic uppercase tracking-widest text-white">Inscrição <span className="text-[#3B82F6]">Rápida</span></h2>
                 <div className="flex items-center gap-4">
                    {[1, 2].map(s => (
                      <div key={s} className={cn(
                        "w-12 h-2 rounded-full transition-all duration-500",
                        step >= s ? "bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" : "bg-white/5"
                      )} />
                    ))}
                 </div>
              </div>

              <form onSubmit={handleEnroll} className="relative z-10 space-y-12">
                 {step === 1 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-10"
                   >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome Completo</label>
                            <div className="relative">
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                               <input 
                                 required
                                 value={formData.runnerName}
                                 onChange={e => setFormData({...formData, runnerName: e.target.value})}
                                 className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-5 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                                 placeholder="COMO CONSTA NO DOCUMENTO"
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">E-mail para Confirmação</label>
                            <div className="relative">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                               <input 
                                 required
                                 type="email"
                                 value={formData.email}
                                 onChange={e => setFormData({...formData, email: e.target.value})}
                                 className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-5 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                                 placeholder="EX: ATLETA@RUNPRO.COM"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Gênero</label>
                             <select 
                               required
                               value={formData.gender}
                               onChange={e => setFormData({...formData, gender: e.target.value})}
                               className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest appearance-none lg:text-xs"
                             >
                                <option value="male">MASCULINO</option>
                                <option value="female">FEMININO</option>
                             </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Idade (Anos)</label>
                            <input 
                              required
                              type="number"
                              value={formData.age}
                              onChange={e => setFormData({...formData, age: e.target.value})}
                              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic text-center text-sm md:text-base"
                              placeholder="00"
                            />
                         </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">WhatsApp</label>
                             <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                                <input 
                                  required
                                  value={formData.phone}
                                  onChange={e => setFormData({...formData, phone: e.target.value})}
                                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-5 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                                  placeholder="81 9XXXX-XXXX"
                                />
                             </div>
                         </div>
                      </div>

                      <div className="pt-8 flex flex-col sm:flex-row gap-6">
                         <button 
                           type="button"
                           onClick={() => setStep(2)}
                           className="flex-1 bg-[#3B82F6] text-white py-6 rounded-3xl font-black italic uppercase tracking-[0.2em] text-sm hover:bg-blue-600 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 font-bold"
                         >
                            Confirmar Dados
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </div>
                   </motion.div>
                 )}

                 {step === 2 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-12"
                   >
                      <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 p-8 rounded-[3rem] space-y-8">
                         <div>
                            <h4 className="text-xl font-display font-black italic uppercase tracking-widest text-white mb-6">Escolha seu <span className="text-[#3B82F6]">Kit.</span></h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {['completo', 'basico'].map(kit => (
                                 <button
                                   key={kit}
                                   type="button"
                                   onClick={() => setFormData({...formData, kitType: kit})}
                                   className={cn(
                                     "p-6 rounded-[2rem] border-2 transition-all text-left group",
                                     formData.kitType === kit ? "bg-[#3B82F6] border-[#3B82F6] text-white shadow-xl shadow-[#3B82F6]/20" : "bg-black/40 border-white/5 text-slate-500 hover:text-white"
                                   )}
                                 >
                                    <div className="flex items-center justify-between mb-4">
                                       <Dumbbell className={cn("w-6 h-6", formData.kitType === kit ? "text-white" : "text-slate-700")} />
                                       {formData.kitType === kit && <CheckCircle2 className="w-5 h-5 text-white" />}
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest italic">{kit === 'completo' ? 'Kit Performance' : 'Kit Atleta Essencial'}</p>
                                    <p className="text-[10px] font-bold opacity-60 uppercase mt-1 italic">{kit === 'completo' ? 'Camiseta, Chip e Medalha' : 'Número de Peito e Chip'}</p>
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2 mb-4 block">Tamanho da Camiseta</label>
                            <div className="grid grid-cols-5 gap-3">
                               {['P', 'M', 'G', 'GG', 'XG'].map(size => (
                                 <button
                                   key={size}
                                   type="button"
                                   onClick={() => setFormData({...formData, shirtSize: size})}
                                   className={cn(
                                     "py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                     formData.shirtSize === size ? "bg-[#3B82F6] border-[#3B82F6] text-white" : "bg-black/40 border-white/5 text-slate-600 hover:text-white"
                                   )}
                                 >
                                    {size}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-white/5">
                         <div className="p-6 bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-3xl flex items-start gap-4">
                            <ShieldCheck className="w-6 h-6 text-[#3B82F6] shrink-0 mt-0.5" />
                            <p className="text-[10px] font-black uppercase leading-relaxed text-[#3B82F6] italic">
                               Ao confirmar a inscrição, você declara estar em perfeitas condições de saúde para a prática esportiva desta prova.
                            </p>
                         </div>

                         <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                              type="button"
                              onClick={() => setStep(1)}
                              className="flex-1 py-6 bg-white/5 text-white rounded-3xl font-black italic uppercase tracking-widest text-[10px]"
                            >
                               Voltar
                            </button>
                            <button 
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-[2] bg-[#3B82F6] text-white py-6 rounded-3xl font-black italic uppercase tracking-[0.2em] text-sm hover:bg-blue-600 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 font-bold"
                            >
                               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                               Finalizar e Gerar PIX
                            </button>
                         </div>
                      </div>
                   </motion.div>
                 )}
              </form>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RaceEnrollment;
