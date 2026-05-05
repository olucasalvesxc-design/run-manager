import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Dumbbell, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Trophy, 
  TrendingUp, 
  ChevronRight, 
  ArrowRight,
  Target,
  Activity,
  History,
  Timer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Copy,
  Info,
  ExternalLink,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { formatCurrency, cn } from '../lib/utils';

import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const TrainingGenerator = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [training, setTraining] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  const [formData, setFormData] = useState({
    objective: '10k',
    currentPace: '',
    weeklyDays: '3',
    experience: 'intermediario',
    targetDate: '',
    notes: '',
    athleteName: ''
  });

  const isTrainer = profile?.role === 'organizer' || profile?.role === 'admin';

  useEffect(() => {
    if (isTrainer && user) {
      const q = query(collection(db, 'trainer_clients'), where('trainerId', '==', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [isTrainer, user]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Crie um plano de treinamento de corrida detalhado de 4 semanas para ${formData.athleteName || 'um corredor'} com as seguintes características:
        - Objetivo: ${formData.objective}
        - Pace Atual: ${formData.currentPace}
        - Dias por semana: ${formData.weeklyDays}
        - Experiência: ${formData.experience}
        - Data Alvo: ${formData.targetDate}
        - Observações: ${formData.notes}
        
        Formate o plano usando Markdown, com tabelas para os treinos diários e explicações claras sobre as zonas de intensidade.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setTraining(response.text);
      if (isTrainer) setPaymentConfirmed(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToClient = async () => {
    if (!selectedClientId || !training) return;
    try {
      await addDoc(collection(db, 'workouts'), {
        title: `Plano IA: ${formData.objective}`,
        clientId: selectedClientId,
        trainerId: user?.uid,
        division: 'Ciclo IA 4 Semanas',
        goal: formData.objective,
        description: training,
        exercises: [], // Could parse but MD is better as description
        status: 'open',
        isAIGenerated: true,
        createdAt: serverTimestamp()
      });
      alert('Treino salvo no perfil do aluno com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar treino.');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('81989768406');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center p-6 text-center">
       <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#3B82F6]/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 animate-spin text-[#3B82F6] relative z-10" />
       </div>
       <h1 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-4">Processando Dados...</h1>
       <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic max-w-xs leading-relaxed animate-pulse">
         Nossa inteligência artificial está desenhando seu ciclo completo de performance agora mesmo.
       </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#3B82F6] selection:text-white overflow-x-hidden -m-4 sm:-m-8 p-4 sm:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3B82F6]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/3 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto py-12 md:py-24 relative z-10">
        {/* Navbar-ish Branding */}
        <div className="flex items-center justify-between mb-20 md:mb-32 px-4">
           <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-black italic uppercase tracking-tighter">RUN<span className="text-[#3B82F6]">PRO AI</span></span>
           </div>
           
           {!training && (
             <div className="flex items-center gap-6 md:gap-10">
                <div className="hidden sm:flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Security Enforced</span>
                </div>
                <button className="bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white/10 transition-all font-bold italic">Meus Treinos</button>
             </div>
           )}
        </div>

        {!training ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7 space-y-12">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-10"
                >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full mb-6">
                  <Zap className="w-3 h-3 text-[#3B82F6] fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Powered by Gemini AI</span>
                </div>
                
                <h1 className="text-6xl sm:text-8xl md:text-[8rem] font-display font-black italic uppercase leading-[0.8] tracking-tighter">
                  TREINE <br /> <span className="text-[#3B82F6]">Como Pro.</span>
                </h1>
                
                <p className="max-w-xl text-slate-500 font-bold uppercase tracking-[0.2em] italic text-xs sm:text-sm leading-relaxed">
                  Geramos planilhas personalizadas através de Inteligência Artificial avançada, analisando seu nível atual para entregar o melhor ciclo de performance.
                </p>

                <div className="flex flex-wrap gap-8 items-center pt-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 sm:w-6 h-6 text-[#3B82F6]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Valor Único</span>
                        <span className="text-lg sm:text-xl font-display font-black text-[#3B82F6] tracking-tighter italic">R$ 29,90</span>
                      </div>
                   </div>

                   <div className="w-px h-10 bg-white/5 hidden sm:block" />

                   <div className="flex items-center gap-6">
                      <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full bg-slate-900 border-2 border-[#05070A] flex items-center justify-center overflow-hidden">
                              <Users className="w-4 h-4 text-slate-700" />
                           </div>
                         ))}
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">+5.000 Atletas Gerados</p>
                   </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-white/5 pt-12">
                 <div className="space-y-4">
                    <Trophy className="w-5 h-5 text-[#3B82F6]" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Foco Total</h4>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase italic">Macrociclos ajustados para maratonas e provas de rua.</p>
                 </div>
                 <div className="space-y-4">
                    <Timer className="w-5 h-5 text-[#3B82F6]" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Pace Builder</h4>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase italic">Treinos intervalados escalonados por limiar.</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-[60px]" />
              
              {!showPayment ? (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#11161D] rounded-[3rem] p-8 sm:p-12 border border-white/5 shadow-2xl relative"
                >
                  <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-8 text-center">Configurar <span className="text-[#3B82F6]">Planilha</span></h3>
                  
                  <div className="space-y-6">
                    {isTrainer && (
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Vincular a um Aluno</label>
                         <select 
                           value={selectedClientId}
                           onChange={e => {
                             setSelectedClientId(e.target.value);
                             const client = clients.find(c => c.id === e.target.value);
                             if (client) setFormData({...formData, athleteName: client.name});
                           }}
                           className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:border-[#3B82F6] outline-none transition-all font-black italic uppercase text-xs sm:text-base text-white appearance-none lg:text-xs"
                         >
                           <option value="">Selecionar Aluno (Opcional)</option>
                           {clients.map(client => (
                             <option key={client.id} value={client.id}>{client.name}</option>
                         ))}
                         </select>
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Qual seu objetivo?</label>
                       <select 
                         value={formData.objective}
                         onChange={e => setFormData({...formData, objective: e.target.value})}
                         className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:border-[#3B82F6] outline-none transition-all font-black italic uppercase text-xs sm:text-base text-white appearance-none lg:text-xs"
                       >
                         <option value="5k">Primeiros 5KM</option>
                         <option value="10k">Performance 10KM</option>
                         <option value="21k">Bater Sub-2h na Meia</option>
                         <option value="42k">Completar Maratona</option>
                         <option value="sub20_5k">Sub-20 nos 5KM</option>
                         <option value="fortalecimento">Fortalecimento Específico</option>
                         <option value="vo2_max">Aumento de VO2 Max</option>
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Pace Atual</label>
                           <input 
                             placeholder="Ex: 5:45"
                             value={formData.currentPace}
                             onChange={e => setFormData({...formData, currentPace: e.target.value})}
                             className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:border-[#3B82F6] outline-none transition-all font-black italic text-center text-sm md:text-base text-white"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Dias/Semana</label>
                           <input 
                             type="number"
                             min="1"
                             max="7"
                             value={formData.weeklyDays}
                             onChange={e => setFormData({...formData, weeklyDays: e.target.value})}
                             className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:border-[#3B82F6] outline-none transition-all font-black italic text-center text-sm md:text-base text-white"
                           />
                        </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nível de Experiência</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['iniciante', 'intermediario', 'avancado'].map(level => (
                            <button
                               key={level}
                               onClick={() => setFormData({...formData, experience: level})}
                               className={cn(
                                 "py-3 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest italic transition-all",
                                 formData.experience === level 
                                   ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                   : 'bg-black/20 border-white/5 text-slate-600 hover:text-white'
                               )}
                            >
                               {level}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2 pt-4">
                       <div className="p-4 bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-2xl flex items-start gap-4">
                          <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                          <p className="text-[10px] font-black uppercase leading-relaxed text-[#3B82F6] italic">
                             Ao continuar você concorda que o treino é gerado por IA e deve ser validado por um profissional de saúde.
                          </p>
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (isTrainer) handleGenerate();
                        else setShowPayment(true);
                      }}
                      className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black italic uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-3 sm:gap-4 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] group px-4 font-bold"
                    >
                       {isTrainer ? 'Gerar Planilha Agora' : 'Obter Planilha AI'}
                       <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#11161D] rounded-[3rem] p-8 sm:p-12 border border-white/5 shadow-2x text-center overflow-hidden relative"
                >
                   <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-emerald-500 to-[#3B82F6]" />
                   
                   <div className="w-20 h-20 bg-[#3B82F6]/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                      <CreditCard className="w-10 h-10 text-[#3B82F6]" />
                   </div>
                   <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4">Pagamento PIX</h3>
                   <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest mb-10 leading-relaxed">
                      Acesse sua inteligência agora por <br /> apenas <span className="text-white text-base">R$ 29,90</span>.
                   </p>

                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-10 relative group">
                      <div className="w-32 h-32 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center italic text-[10px] font-black text-slate-800">
                         QR CODE PIX <br /> SIMULADO
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Chave Pix (Celular)</span>
                            <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/5 w-full">
                               <code className="text-lg font-mono font-bold text-[#3B82F6] tracking-wider truncate flex-1">81989768406</code>
                               <button 
                                 onClick={handleCopyPix}
                                 className="bg-[#3B82F6] text-white p-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#3B82F6]/20"
                               >
                                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={handleGenerate}
                     className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-6 rounded-2xl font-black italic uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 mb-4 font-bold"
                   >
                     Já paguei, Gerar Treino
                   </button>
                   
                   <button 
                    onClick={() => setShowPayment(false)}
                    className="text-[10px] font-black uppercase text-slate-700 hover:text-white transition-colors"
                   >
                     Voltar às Configurações
                   </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
             <div className="bg-[#11161D] rounded-[4rem] p-8 sm:p-16 border border-white/5 border-t-[#3B82F6] border-t-4 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <ShieldCheck className="w-64 h-64 text-[#3B82F6]" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
                   <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Planilha Gerada com Sucesso</span>
                      </div>
                      <h2 className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-white">
                        Seu Ciclo <span className="text-[#3B82F6]">Vitorioso.</span>
                      </h2>
                   </div>

                   <div className="flex items-center gap-4">
                      {isTrainer && selectedClientId && (
                        <button 
                          onClick={handleSaveToClient}
                          className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 font-bold"
                        >
                           Salvar no Perfil do Aluno
                           <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const blob = new Blob([training || ''], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `planilha-runpro-${formData.objective}.md`;
                          a.click();
                        }}
                        className="px-8 py-4 bg-[#3B82F6] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center gap-2 shadow-lg shadow-[#3B82F6]/10 font-bold"
                      >
                         Baixar PDF / MD
                         <ExternalLink className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <div className="prose prose-invert prose-slate max-w-none prose-headings:font-display prose-headings:italic prose-headings:uppercase prose-headings:tracking-widest prose-p:text-slate-400 prose-strong:text-white prose-table:border prose-table:border-white/5 prose-th:bg-white/5 prose-th:p-4 prose-td:p-4 font-bold">
                   <ReactMarkdown>{training}</ReactMarkdown>
                </div>

                <div className="mt-20 p-8 sm:p-12 bg-black/40 rounded-[3rem] border border-white/10 flex flex-col sm:flex-row items-center gap-10">
                   <div className="w-24 h-24 bg-[#3B82F6] rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <Zap className="w-10 h-10 text-white fill-current" />
                   </div>
                   <div className="flex-1 space-y-3 text-center sm:text-left">
                      <h4 className="text-xl sm:text-2xl font-display font-black italic uppercase tracking-widest">Quer acompanhamento real?</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase italic tracking-widest leading-relaxed">
                         Alcançar o sub-4 na maratona ou o sub-20 nos 5k exige mais que IA. Nossas assessorias parceiras monitoram seu treino diariamente.
                      </p>
                   </div>
                   <button className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:scale-105 transition-all font-bold">
                      Explorar Assessorias
                   </button>
                </div>
             </div>

             <div className="text-center pt-8">
                <button 
                  onClick={() => {
                    setTraining(null);
                    setPaymentConfirmed(false);
                    setShowPayment(false);
                  }}
                  className="text-[10px] font-black uppercase text-slate-700 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                >
                   <History className="w-3 h-3" />
                   Gerar Nova Planilha (Novo Pagamento)
                </button>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrainingGenerator;
