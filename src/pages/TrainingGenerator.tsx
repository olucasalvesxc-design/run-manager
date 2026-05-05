import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Dumbbell, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Trophy, 
  Flame, 
  ChevronLeft,
  Timer,
  Activity as ActivityIcon,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  CreditCard,
  QrCode,
  Info,
  Clock,
  Copy,
  MapPin,
  Star,
  Play
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { generateTrainingPlan, TrainingPlan } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { WorkoutGraph, TrainingPlayer } from '../components/WorkoutVisuals';

interface Subscription {
  status: 'active' | 'expired';
  expiresAt: Timestamp;
}

const EXERCISE_IMAGES: Record<string, string> = {
  running: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Running%20shoe/3D/running_shoe_3d.png',
  sprints: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/3D/high_voltage_3d.png',
  stretching: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Person%20stretching/3D/person_stretching_3d.png',
  weights: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dumbbell/3D/dumbbell_3d.png',
  rest: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bed/3D/bed_3d.png',
  hills: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mountain/3D/mountain_3d.png',
  recovery: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20in%20steamy%20bath/3D/man_in_steamy_bath_3d.png',
  cycling: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bicycle/3D/bicycle_3d.png',
  swimming: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Person%20swimming/3D/person_swimming_3d.png',
  timer: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Stopwatch/3D/stopwatch_3d.png',
  trail: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/National%20park/3D/national_park_3d.png'
};

const VISUAL_ICONS: Record<string, any> = {
  running: Trophy,
  sprints: Zap,
  stretching: ActivityIcon,
  weights: Dumbbell,
  rest: Clock,
  hills: MapPin,
  recovery: Star,
  cycling: ActivityIcon,
  swimming: ActivityIcon,
  timer: Clock,
  trail: MapPin
};

const TrainingGenerator = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(!!planId);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(planId);
  const [copied, setCopied] = useState(false);
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'info' | 'qr' | 'success'>('info');

  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState({ total: 0, completed: 0 });
  const [formData, setFormData] = useState({
    targetDistance: '5km',
    currentLevel: 'Iniciante',
    daysPerWeek: 3,
    weeksUntilRace: 8
  });

  useEffect(() => {
    if (user) {
      fetchWeeklyProgress();
    }
  }, [user]);

  const fetchWeeklyProgress = async () => {
    if (!user?.uid) return;
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'training_executions'),
        where('userId', '==', user.uid),
        where('status', '==', 'concluido'),
        where('completedAt', '>=', Timestamp.fromDate(startOfWeek))
      );
      const snapshot = await getDocs(q);
      setWeeklyStats(prev => ({ ...prev, completed: snapshot.size }));
    } catch (err) {
      console.error('Progress Fetch Error (Generator):', err);
      handleFirestoreError(err, OperationType.GET, 'training_executions', auth);
    }
  };

  const handleStartWorkout = async (workout: any) => {
    if (!user?.uid) return;
    
    // Safety check for workout ID (for Gemini-generated plans that might miss it)
    const trainingId = workout?.id || `plan-${Date.now()}`;
    
    try {
      // Check for active workout first
      const activeQuery = query(
        collection(db, 'training_executions'),
        where('userId', '==', user.uid),
        where('status', '==', 'em_andamento'),
        limit(1)
      );
      const activeSnap = await getDocs(activeQuery);
      
      if (!activeSnap.empty) {
        alert('Você já possui um treino em andamento. Conclua-o antes de iniciar um novo.');
        return;
      }

      setActiveWorkout({ ...workout, id: trainingId });
      
      await addDoc(collection(db, 'training_executions'), {
        userId: user.uid,
        trainingId: trainingId,
        activity: workout?.activity || 'Treino',
        status: 'em_andamento',
        startTime: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Start Workout Error (Generator):', err);
      handleFirestoreError(err, OperationType.WRITE, 'training_executions', auth);
    }
  };

  const handleFinishWorkout = async (data: any) => {
    if (!user?.uid || !activeWorkout) return;
    
    const trainingId = activeWorkout.id;
    if (!trainingId) {
      console.error('No training ID found for finishing workout (Generator)');
      setActiveWorkout(null);
      return;
    }

    try {
      const q = query(
        collection(db, 'training_executions'),
        where('userId', '==', user.uid),
        where('trainingId', '==', String(trainingId)),
        where('status', '==', 'em_andamento'),
        orderBy('startTime', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const executionId = snapshot.docs[0].id;
        await setDoc(doc(db, 'training_executions', executionId), {
          ...data,
          status: 'concluido',
          completedAt: serverTimestamp()
        }, { merge: true });
      }

      setActiveWorkout(null);
      fetchWeeklyProgress();
      alert('Treino concluído com sucesso! 🚀');
    } catch (err) {
      console.error('Finish Workout Error (Generator):', err);
      handleFirestoreError(err, OperationType.UPDATE, 'training_executions', auth);
    }
  };

  useEffect(() => {
    if (planId) {
      loadPlan(planId);
    } else if (user) {
      checkLastPlan();
    }
    
    if (user) {
      checkSubscription();
    } else {
      setCheckingSub(false);
    }
  }, [planId, user]);

  const checkLastPlan = async () => {
    if (!user) return;
    setFetchingPlan(true);
    try {
      const q = query(
        collection(db, 'training_plans'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as TrainingPlan;
        setPlan(data);
        // Also update form data to match the last plan for convenience if they want to regenerate
        setFormData({
          targetDistance: data.targetDistance || '5km',
          currentLevel: data.currentLevel || 'Iniciante',
          daysPerWeek: (data as any).daysPerWeek || 3,
          weeksUntilRace: (data as any).weeksUntilRace || 8
        });
      }
    } catch (err) {
      console.error('Error checking last plan:', err);
    } finally {
      setFetchingPlan(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    setCheckingSub(true);
    try {
      const subDoc = await getDoc(doc(db, 'training_subscriptions', user.uid));
      if (subDoc.exists()) {
        const data = subDoc.data() as Subscription;
        // Check if expired
        if (data.expiresAt.toMillis() < Date.now()) {
          setSubscription({ ...data, status: 'expired' });
        } else {
          setSubscription(data);
        }
      }
    } catch (err) {
      console.error('Error checking sub:', err);
    } finally {
      setCheckingSub(false);
    }
  };

  const loadPlan = async (id: string) => {
    setFetchingPlan(true);
    try {
      const planDoc = await getDoc(doc(db, 'training_plans', id));
      if (planDoc.exists()) {
        const data = planDoc.data() as TrainingPlan;
        setPlan(data);
      } else {
        alert('Plano não encontrado.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingPlan(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Apenas organizadores podem gerar novos treinos. Faça login para continuar.');
      return;
    }

    if (!subscription || subscription.status !== 'active') {
      setShowPayment(true);
      return;
    }
    
    setLoading(true);
    try {
      const generatedPlan = await generateTrainingPlan(formData);
      
      // Auto-save plan for the user
      const newPlanId = `${user.uid}-${Date.now()}`;
      await setDoc(doc(db, 'training_plans', newPlanId), {
        ...generatedPlan,
        userId: user.uid,
        targetDistance: formData.targetDistance,
        currentLevel: formData.currentLevel,
        daysPerWeek: formData.daysPerWeek,
        weeksUntilRace: formData.weeksUntilRace,
        createdAt: serverTimestamp()
      });

      setPlan(generatedPlan);
      setSharedId(newPlanId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao gerar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const subData = {
        userId: user.uid,
        status: 'awaiting_approval',
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'training_subscriptions', user.uid), subData);
      setSubscription(subData as unknown as Subscription);
      setPaymentStep('success');
      setTimeout(() => {
        setShowPayment(false);
        setPaymentStep('info');
      }, 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'training_subscriptions', auth);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!plan || !user) return;
    
    setLoading(true);
    try {
      const newPlanId = `${user.uid}-${Date.now()}`;
      await setDoc(doc(db, 'training_plans', newPlanId), {
        ...plan,
        userId: user.uid,
        targetDistance: formData.targetDistance,
        currentLevel: formData.currentLevel,
        createdAt: serverTimestamp()
      });
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?planId=${newPlanId}`;
      navigator.clipboard.writeText(shareUrl);
      setSharedId(newPlanId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'training_plans', auth);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPlan || (user && checkingSub)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando Dados...</p>
        </div>
      </div>
    );
  }

  const isSubscribed = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-yellow-400 selection:text-slate-950 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-white/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex items-center justify-between mb-12 lg:mb-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:scale-110 transition-transform">
              <ChevronLeft className="text-slate-950 w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Voltar</span>
          </Link>
          <div className="flex items-center gap-4">
            {isSubscribed && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Clock className="w-3 h-3 text-green-400" />
                <span className="text-[9px] font-black uppercase tracking-wider text-green-400">
                  Acesso Ativo até {subscription.expiresAt.toDate().toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Planilha Inteligente v1.0</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {!plan ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
                  <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Powered by Gemini AI</span>
                </div>
                <h1 className="text-[clamp(2.5rem,10vw,4.5rem)] md:text-7xl lg:text-8xl font-display font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                  Prepare-se <br />
                  <span className="text-yellow-400">Como Pro.</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed italic">
                  {user 
                    ? "Gere planilhas técnicas personalizadas para seus atletas baseadas em IA de elite."
                    : "Infraestrutura de treinamento inteligente exclusiva para organizadores e treinadores RunManager."}
                </p>
                
                {!isSubscribed && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 bg-slate-900/50 p-4 sm:p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[12px] sm:text-sm font-black uppercase italic tracking-wider truncate">Acesso Ilimitado</h4>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Planilhas por 30 dias.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">Apenas</span>
                        <span className="text-lg sm:text-xl font-display font-black text-yellow-400 tracking-tighter">R$ 30</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Foco Total</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                        <Timer className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Ritmos Reais</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="bg-slate-900 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-[60px]"></div>
                
                {user ? (
                  <>
                    <h3 className="text-2xl font-display font-black uppercase italic tracking-widest mb-10 text-center">
                      {showPayment ? 'Liberação de Acesso' : 'Configurar Perfil'}
                    </h3>
                    
                    <AnimatePresence mode="wait">
                      {!showPayment ? (
                        <motion.form 
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleGenerate} 
                          className="space-y-8"
                        >
                          {!isSubscribed && (
                            <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-start gap-4 mb-8">
                              <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-black uppercase leading-relaxed text-yellow-400">
                                Você não possui um acesso ativo. Ao clicar em gerar, você será direcionado para o pagamento simbólico de R$ 30,00.
                              </p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Distância do Objetivo</label>
                            <select 
                              value={formData.targetDistance}
                              onChange={e => setFormData({ ...formData, targetDistance: e.target.value })}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none transition-all font-black italic uppercase text-sm"
                            >
                              <option value="5km">5km (Velocidade)</option>
                              <option value="10km">10km (Intermediário)</option>
                              <option value="21km">21km (Meia Maratona)</option>
                              <option value="42km">42km (Maratona)</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nível do Atleta</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              {['Iniciante', 'Intermediário', 'Avançado'].map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, currentLevel: level })}
                                  className={`py-3 px-2 rounded-xl font-black italic text-[9px] uppercase tracking-tighter border-2 transition-all ${
                                    formData.currentLevel === level 
                                    ? 'bg-yellow-400 border-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                                    : 'border-slate-800 text-slate-500 hover:border-slate-700'
                                  } ${level === 'Intermediário' ? 'col-span-2 lg:col-span-1' : ''}`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Dias/Semana</label>
                              <input 
                                type="number" 
                                min="2" max="7"
                                value={formData.daysPerWeek}
                                onChange={e => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none transition-all font-black italic text-center text-sm md:text-base"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Semanas faltantes</label>
                              <input 
                                type="number" 
                                min="1" max="52"
                                value={formData.weeksUntilRace}
                                onChange={e => setFormData({ ...formData, weeksUntilRace: Number(e.target.value) })}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none transition-all font-black italic text-center text-sm md:text-base"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black italic uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-3 sm:gap-4 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.2)] disabled:opacity-50 group px-4"
                          >
                            {loading ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <>
                                <span className="truncate">{isSubscribed ? 'Gerar Plano de Elite' : 'Liberar Gerador (R$ 30)'}</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform shrink-0" />
                              </>
                            )}
                          </button>
                        </motion.form>
                      ) : (
                        <motion.div 
                          key="payment"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col items-center text-center py-4"
                        >
                          <AnimatePresence mode="wait">
                            {paymentStep === 'info' && (
                              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                                  <CreditCard className="w-10 h-10 text-yellow-400" />
                                </div>
                                <h4 className="text-xl font-display font-black italic uppercase mb-2">
                                  {subscription?.status === 'awaiting_approval' ? 'Aprovação Pendente' : 'Acesso por 30 dias'}
                                </h4>
                                <p className="text-slate-500 text-sm mb-8 font-medium italic">
                                  {subscription?.status === 'awaiting_approval' 
                                    ? 'Seu PIX foi enviado. O organizador irá liberar seu acesso em breve.' 
                                    : 'Liberação após confirmação manual do organizador.'}
                                </p>
                                
                                {subscription?.status !== 'awaiting_approval' && (
                                  <button 
                                    onClick={() => setPaymentStep('qr')}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black italic uppercase text-xs tracking-widest hover:bg-yellow-400 transition-colors mb-4"
                                  >
                                    Ver Chave PIX
                                  </button>
                                )}
                                <button 
                                  onClick={() => setShowPayment(false)}
                                  className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                                >
                                  Cancelar
                                </button>
                              </motion.div>
                            )}

                            {paymentStep === 'qr' && (
                              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <div className="bg-yellow-400/10 p-6 rounded-3xl mb-6 mx-auto inline-block border-2 border-yellow-400/20">
                                  <CreditCard className="w-12 h-12 text-yellow-400" />
                                </div>
                                
                                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mb-8 text-left group/pix relative overflow-hidden">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Chave PIX (Celular)</span>
                                  <div className="flex items-center justify-between gap-4">
                                    <code className="text-xl font-mono font-bold text-yellow-400 tracking-wider">81989768406</code>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText('81989768406');
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                      }}
                                      className="bg-yellow-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg"
                                    >
                                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                  </div>
                                </div>

                                <div className="mb-8">
                                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2 block italic">Já realizou o pagamento?</span>
                                  <p className="text-slate-400 text-[10px] font-medium italic mb-6">Após enviar o PIX, clique abaixo. Nossa equipe validará em breve.</p>
                                  
                                  <button 
                                    onClick={handleSimulatePayment}
                                    disabled={loading}
                                    className="w-full bg-green-500 hover:bg-green-400 text-slate-950 py-5 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                                  >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Confirmar Envio do PIX
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setPaymentStep('info')}
                                  className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                                >
                                  Voltar
                                </button>
                              </motion.div>
                            )}

                            {paymentStep === 'success' && (
                              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-10">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                                  <Check className="w-12 h-12 text-slate-950 stroke-[3px]" />
                                </div>
                                <h4 className="text-3xl font-display font-black italic uppercase mb-2">Sucesso!</h4>
                                <p className="text-slate-500 font-bold italic uppercase text-xs tracking-widest">Seu acesso foi liberado.</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mb-4">Acesso Restrito</h3>
                    <p className="text-slate-500 font-medium mb-8">Esta ferramenta é exclusiva para organizadores parceiros da RunManager.</p>
                    <Link 
                      to="/login"
                      className="inline-flex bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                    >
                      Login Organizador
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 px-4">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-4">
                      Seu Ciclo <span className="text-yellow-400">Vitorioso.</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest italic">{plan.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {user && !planId && (
                      <button 
                        onClick={handleShare}
                        disabled={loading}
                        className="px-8 py-4 bg-yellow-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 shadow-lg shadow-yellow-400/10"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Link Copiado' : 'Compartilhar com Atleta'}
                      </button>
                    )}
                    {!planId && (
                      <button 
                        onClick={() => setPlan(null)}
                        className="px-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                      >
                        Novo Treino
                      </button>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-4">
                {plan.schedule.map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-8 rounded-[3rem] border overflow-hidden min-h-[350px] group flex flex-col justify-between ${
                      day.intensity === 'rest' 
                      ? 'bg-slate-900/30 border-slate-800/50 text-slate-500' 
                      : 'bg-slate-900 border-white/5 hover:border-red-500/30 transition-all shadow-xl hover:shadow-red-500/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-50">{day.day}</div>
                        <div className={`text-[10px] font-black uppercase italic px-3 py-1 rounded-lg border ${
                          day.intensity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          day.intensity === 'medium' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 
                          day.intensity === 'low' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800/30 border-slate-700/30'
                        }`}>
                          {day.intensity.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className={`text-2xl font-display font-black uppercase italic mb-6 flex items-center gap-3 ${
                        day.intensity === 'high' ? 'text-red-500' : 
                        day.intensity === 'medium' ? 'text-yellow-400' : 
                        day.intensity === 'low' ? 'text-green-400' : ''
                      }`}>
                        {day.activity}
                      </div>

                      {/* Animated Graph Illustration */}
                      <div className="mb-6 relative h-44 rounded-[2rem] overflow-hidden border border-white/5 bg-slate-950/80 group-hover:border-red-500/20 transition-all shadow-inner flex flex-col">
                         <div className="flex-1">
                            <WorkoutGraph type={day.activity} intensity={day.intensity} />
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 z-20"></div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-medium italic mb-6">
                        {day.details}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       {day.intensity !== 'rest' ? (
                         <button 
                          onClick={() => handleStartWorkout(day)}
                          className="w-full bg-white text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                         >
                           <Play className="w-3.5 h-3.5 fill-current" />
                           Iniciar Treino
                         </button>
                       ) : (
                         <div className="flex items-center gap-2 text-slate-600">
                           <Heart className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase italic tracking-widest">Descanso Merecido</span>
                         </div>
                       )}
                    </div>

                    {day.intensity !== 'rest' && (
                       <div className={`absolute -right-4 -bottom-4 opacity-[0.02] scale-150 transform group-hover:rotate-12 transition-transform duration-700`}>
                          <Zap className="w-32 h-32" />
                       </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {activeWorkout && (
                  <TrainingPlayer 
                    training={activeWorkout} 
                    onClose={() => setActiveWorkout(null)} 
                    onFinish={handleFinishWorkout}
                  />
                )}
              </AnimatePresence>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
                <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem]">
                   <h4 className="flex items-center gap-3 text-xl font-display font-black italic uppercase tracking-widest mb-8">
                      <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                      Dicas do Treinador AI
                   </h4>
                   <ul className="space-y-6">
                      {plan.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-4 text-sm text-slate-400 leading-relaxed font-medium">
                           <span className="text-yellow-400 font-black italic">0{idx + 1}.</span>
                           {tip}
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="bg-yellow-400 p-10 rounded-[3rem] text-slate-950 relative overflow-hidden flex flex-col justify-center">
                   <div className="relative z-10">
                      <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter leading-[0.9] mb-4">Mantenha a <br />Constância.</h4>
                      <p className="text-sm font-bold italic mb-8 opacity-80">"A disciplina vence o talento quando o talento não tem disciplina."</p>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all print:hidden"
                      >
                        Imprimir Planilha
                        <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="absolute -right-10 -bottom-10 opacity-10">
                      <ActivityIcon className="w-64 h-64" />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingGenerator;
