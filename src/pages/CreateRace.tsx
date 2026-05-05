import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Link as LinkIcon, 
  DollarSign, 
  CreditCard,
  Target,
  Zap,
  ShieldCheck,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const CreateRace = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    type: '10k',
    link: '',
    organizerName: '',
    price: '',
    pixKey: '',
    description: '',
    capacity: '100',
    participationType: 'paid'
  });

  const raceTypes = [
    { label: '5 KM', value: '5k' },
    { label: '10 KM', value: '10k' },
    { label: '21 KM (MEIA)', value: '21k' },
    { label: '42 KM (MARATONA)', value: '42k' },
    { label: 'ULTRA', value: 'ultra' },
    { label: 'TRAIL', value: 'trail' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const availableCredits = profile.raceCredits || 0;
    const isMaster = profile.role === 'admin';

    if (availableCredits <= 0 && !isMaster) {
      setShowCreditModal(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Create the race
      await addDoc(collection(db, 'races'), {
        ...formData,
        userId: user.uid,
        organizerEmail: user.email,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        status: 'active',
        createdAt: serverTimestamp()
      });

      // 2. Deduct credit
      if (!isMaster) {
        const profileRef = doc(db, 'profiles', user.uid);
        await updateDoc(profileRef, {
          raceCredits: availableCredits - 1,
          creditsUsed: (profile.creditsUsed || 0) + 1
        });
      }

      navigate('/dashboard/races');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar corrida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <AnimatePresence>
        {showCreditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCreditModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-[#11161D] border border-white/10 rounded-[3rem] p-10 max-w-md relative z-10 text-center shadow-2xl"
             >
                <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                   <Zap className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4">Créditos Insuficientes</h2>
                <p className="text-slate-500 text-sm italic mb-10 leading-relaxed uppercase font-bold text-[10px] tracking-widest leading-relaxed">
                   VOCÊ PRECISA DE CRÉDITOS DE CORRIDA PARA LANÇAR UM NOVO EVENTO NA PLATAFORMA.
                </p>
                <div className="space-y-4">
                   <button 
                     onClick={() => window.open('https://kirvano.com', '_blank')}
                     className="w-full bg-[#3B82F6] text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all font-bold"
                   >
                      Comprar 5 Créditos (R$ 47)
                   </button>
                   <button 
                     onClick={() => setShowCreditModal(false)}
                     className="w-full bg-white/5 text-slate-500 py-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                   >
                      Depois eu vejo
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 text-[#3B82F6] mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">PRO MASTER ACCESS</span>
           </div>
           <h1 className="flex flex-col leading-none">
              <span className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-800">Organizar</span>
              <span className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white -mt-2">Nova Prova</span>
           </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-[#11161D] px-6 py-4 rounded-3xl border border-white/5">
           <Zap className="w-5 h-5 text-[#3B82F6] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Padrão Elite de Provas</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informações Básicas */}
        <div className="bg-[#11161D] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Dados do Evento</h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome da Corrida</label>
                 <input 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                   placeholder="EX: MARATONA DO RECIFE 2025"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Data</label>
                     <input 
                       required
                       type="date"
                       value={formData.date}
                       onChange={e => setFormData({...formData, date: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white color-scheme-dark"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Horário Largada</label>
                     <input 
                       required
                       type="time"
                       value={formData.time}
                       onChange={e => setFormData({...formData, time: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white color-scheme-dark"
                     />
                  </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Local / Endereço</label>
                 <input 
                   required
                   value={formData.location}
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                   placeholder="Rua da Aurora, Recife - PE"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Distância Principal</label>
                 <div className="grid grid-cols-2 gap-3">
                    {raceTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, type: type.value})}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border",
                          formData.type === type.value 
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-lg shadow-[#3B82F6]/20" 
                            : "bg-black/40 border-white/10 text-slate-500 hover:text-white"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Vagas Disponíveis</label>
                 <input 
                   type="number"
                   value={formData.capacity}
                   onChange={e => setFormData({...formData, capacity: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                   placeholder="Ex: 500"
                 />
              </div>
           </div>
        </div>

        {/* Financeiro e Extras */}
        <div className="space-y-8">
           <div className="bg-[#11161D] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Finanças e Link</h2>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Tipo de Participação</label>
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                       {['paid', 'free'].map(type => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setFormData({...formData, participationType: type})}
                           className={cn(
                             "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                             formData.participationType === type ? "bg-[#3B82F6] text-white" : "text-slate-600 hover:text-white"
                           )}
                         >
                           {type === 'paid' ? 'Paga' : 'Gratuita'}
                         </button>
                       ))}
                    </div>
                 </div>

                 {formData.participationType === 'paid' && (
                   <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2 text-[#3B82F6]">Valor da Inscrição (R$)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6]" />
                          <input 
                            required
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-black/40 border-2 border-[#3B82F6]/30 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                            placeholder="0.00"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Chave PIX para Recebimento</label>
                       <input 
                         required
                         value={formData.pixKey}
                         onChange={e => setFormData({...formData, pixKey: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                         placeholder="CPF, Email ou Aleatória"
                       />
                       <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2 italic ml-2">
                         <Info className="w-3 h-3 text-[#3B82F6]" />
                         Os pagamentos vão direto para sua conta.
                       </p>
                    </div>
                   </>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Link Externo (Opcional)</label>
                    <div className="relative">
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         value={formData.link}
                         onChange={e => setFormData({...formData, link: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white"
                         placeholder="https://seu-site-de-inscricao.com"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Descrição Completa</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#3B82F6] transition-colors text-white resize-none"
                      placeholder="Detalhes sobre kit, retirada, percursos e premiação..."
                    />
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="button"
                onClick={() => navigate('/dashboard/races')}
                className="flex-1 bg-white/5 text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] bg-[#3B82F6] text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-[0.3em] hover:bg-blue-600 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                Lançar Prova RUNPRO
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRace;
