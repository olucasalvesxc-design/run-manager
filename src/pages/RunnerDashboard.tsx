import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { 
  Zap, 
  Dumbbell, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Target,
  Video,
  FileText,
  BadgeAlert,
  MapPin,
  Trophy,
  Plus,
  Activity,
  Play,
  Flame,
  CheckCircle2,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Workout, Consultation, Registration, Race } from '../types';
import { cn, formatDate, formatCurrency, handleFirestoreError, OperationType, formatGoal } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { WorkoutGraph, TrainingPlayer } from '../components/WorkoutVisuals';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';

const RunnerDashboard = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const tabFromPath = location.pathname.endsWith('/races')
    ? 'corridas'
    : location.pathname.endsWith('/trainings')
    ? 'treinos'
    : location.pathname.endsWith('/consulting')
    ? 'consultorias'
    : null;

  const initialTab = (tabFromPath || searchParams.get('tab') || 'treinos') as 'treinos' | 'consultorias' | 'corridas';
  const [activeTab, setActiveTab] = useState<'treinos' | 'consultorias' | 'corridas'>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('[RunnerDashboard] route changed →', location.pathname, '| tab:', initialTab);
    setActiveTab(initialTab);
  }, [location.pathname, searchParams.toString()]);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [registrations, setRegistrations] = useState<(Registration & { race?: Race })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState({ completed: 0, goal: 5 });
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWeeklyProgress();
      fetchMonthlyHistory();
    }
  }, [user]);

  const fetchMonthlyHistory = async () => {
    if (!user?.uid) return;
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'training_executions'),
        where('userId', '==', user.uid),
        where('status', '==', 'concluido'),
        where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('completedAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        const date = docData.completedAt?.toDate();
        return {
          id: doc.id,
          date: date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/A',
          activity: docData.activity || 'Treino',
          fullDate: date
        };
      });

      // Group by date and type
      const historyMap: Record<string, any> = {};
      
      data.forEach(item => {
        if (!historyMap[item.date]) {
          historyMap[item.date] = { 
            date: item.date,
            total: 0,
            Musculação: 0,
            Corrida: 0,
            Funcional: 0,
            Outros: 0
          };
        }
        
        let type = 'Outros';
        const activity = item.activity.toLowerCase();
        if (activity.includes('corrida') || activity.includes('running')) type = 'Corrida';
        else if (activity.includes('musculação') || activity.includes('hipertrofia') || activity.includes('treino')) type = 'Musculação';
        else if (activity.includes('funcional') || activity.includes('hiit')) type = 'Funcional';
        
        historyMap[item.date][type]++;
        historyMap[item.date].total++;
      });

      setMonthlyHistory(Object.values(historyMap));
    } catch (err) {
      console.error('Monthly History Error:', err);
    }
  };

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
      console.error('Progress Fetch Error:', err);
      handleFirestoreError(err, OperationType.GET, 'training_executions', auth);
    }
  };

  const handleStartWorkout = async (workout: any) => {
    if (!user?.uid) return;
    
    // Safety check for workout ID
    const trainingId = workout?.id || `manual-${Date.now()}`;
    
    try {
      // Check if there is already an active workout
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
        activity: workout?.title || workout?.activity || 'Treino',
        status: 'em_andamento',
        startTime: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Start Workout Error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'training_executions', auth);
    }
  };

  const handleFinishWorkout = async (data: any) => {
    if (!user?.uid || !activeWorkout) return;
    
    const trainingId = activeWorkout.id;
    if (!trainingId) {
      console.error('No training ID found for finishing workout');
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
        await updateDoc(doc(db, 'training_executions', executionId), {
          ...data,
          status: 'concluido',
          completedAt: serverTimestamp()
        });

        // Also update the workout status if it's a prescribed workout (from the 'workouts' collection)
        if (activeWorkout.id && !activeWorkout.id.startsWith('manual-')) {
           try {
             const workoutRef = doc(db, 'workouts', activeWorkout.id);
             const workoutSnap = await getDoc(workoutRef);
             if (workoutSnap.exists()) {
               await updateDoc(workoutRef, { status: 'completed' });
             }
           } catch (e) {
             console.log('Not a permanent workout document or error updating status');
           }
        }
      }

      setActiveWorkout(null);
      fetchWeeklyProgress();
    } catch (err) {
      console.error('Finish Workout Error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `training_executions`, auth);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchRunnerData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      // 1. Find if this user is a client of any trainer
      const clientsRef = collection(db, 'trainer_clients');
      const qClient = query(clientsRef, where('email', '==', user.email));
      const clientSnap = await getDocs(qClient);
      
      const clientIds = clientSnap.docs.map(doc => doc.id);

      if (clientIds.length > 0) {
        // Listen to workouts for these client IDs
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('clientId', 'in', clientIds),
          orderBy('createdAt', 'desc')
        );
        onSnapshot(workoutsQuery, (snap) => {
          setWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workout[]);
        });

        // Listen to consultations
        const consultsQuery = query(
          collection(db, 'consultations'),
          where('clientId', 'in', clientIds),
          orderBy('date', 'desc')
        );
        onSnapshot(consultsQuery, (snap) => {
          setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultation[]);
        });
      }

      // 2. Fetch registrations
      const regsQuery = query(
        collection(db, 'registrations'),
        where('email', '==', user.email),
        orderBy('createdAt', 'desc')
      );
      
      onSnapshot(regsQuery, async (snap) => {
        const regs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[];
        setRegistrations(regs as any); 
        setLoading(false);
      });
    };

    fetchRunnerData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Weekly Progress Bar */}
      <div className="bg-slate-900 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-full bg-red-500/5 blur-3xl group-hover:bg-red-500/10 transition-all"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 italic text-left">Progresso Semanal</p>
              <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase italic tracking-tighter text-left">
                {weeklyStats.completed} de {weeklyStats.goal} <span className="text-red-500">Treinos</span>
              </h3>
            </div>
          </div>
          <div className="flex-1 max-w-md w-full px-2 sm:px-0">
            <div className="h-4 sm:h-6 bg-slate-950 rounded-full border border-white/5 p-1 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyStats.completed / weeklyStats.goal) * 100}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[progress-scan_1s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className={`text-xl font-display font-black italic uppercase tracking-tighter ${weeklyStats.completed >= weeklyStats.goal ? 'text-green-400' : 'text-slate-400'}`}>
              {Math.min(100, Math.round((weeklyStats.completed / weeklyStats.goal) * 100))}%
            </div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Meta de Constância</p>
          </div>
        </div>
      </div>

      {/* Monthly Evolution Chart */}
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 text-yellow-400 mb-2">
              <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] italic">Desempenho Histórico</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tighter text-white">
              Evolução <span className="text-yellow-400">Mensal.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 italic bg-black/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full" />
              <span>Corrida</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
              <span>Musculação</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
              <span>Funcional</span>
            </div>
          </div>
        </div>

        <div className="h-[250px] sm:h-[300px] w-full relative z-10">
          {monthlyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight={900}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight={900}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                  labelStyle={{
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    fontSize: '9px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                />
                <Bar dataKey="Corrida" stackId="a" fill="#facc15" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="Musculação" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="Funcional" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                Aguardando primeiros treinos <br/> concluídos para gerar insights.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-950 border border-slate-800 p-6 sm:p-8 md:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-3 sm:mb-4 italic">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Painel do Atleta
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-black text-white italic uppercase tracking-tighter mb-2 leading-tight">
            Foco no <span className="text-yellow-400">Objetivo.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium italic">Acompanhe seus treinos, corridas e evolua cada dia mais.</p>
          
          {profile?.athleteCode && (
            <div className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl w-full sm:w-auto">
               <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                     <Target className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Seu Código de Atleta</span>
                    <span className="text-lg sm:text-xl font-display font-black text-white tracking-widest italic uppercase">{profile.athleteCode}</span>
                  </div>
               </div>
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(profile.athleteCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={cn(
                  "w-full sm:w-auto px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  copied ? "bg-green-500 text-white" : "bg-yellow-400 text-slate-950 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20"
                )}
               >
                 {copied ? <Clock className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                 {copied ? 'Copiado!' : 'Copiar Código'}
               </button>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
           <Zap className="w-full h-full text-white fill-current translate-x-1/4 scale-150 rotate-12" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-900/50 p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md sticky top-20 sm:top-4 z-40 mx-4 sm:mx-0">
        <button 
          onClick={() => setActiveTab('treinos')}
          className={cn(
            "flex-1 py-3 sm:py-4 px-2 sm:px-6 rounded-xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3",
            activeTab === 'treinos' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
          )}
        >
          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Meus Treinos</span>
          <span className="sm:hidden">Treinos</span>
        </button>
        <button 
          onClick={() => setActiveTab('consultorias')}
          className={cn(
            "flex-1 py-3 sm:py-4 px-2 sm:px-6 rounded-xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3",
            activeTab === 'consultorias' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
          )}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Consultorias</span>
          <span className="sm:hidden">Sessões</span>
        </button>
        <button 
          onClick={() => setActiveTab('corridas')}
          className={cn(
            "flex-1 py-3 sm:py-4 px-2 sm:px-6 rounded-xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3",
            activeTab === 'corridas' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
          )}
        >
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Minhas Corridas</span>
          <span className="sm:hidden">Corridas</span>
        </button>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence>
          {activeWorkout && (
            <TrainingPlayer 
              training={activeWorkout} 
              onClose={() => setActiveWorkout(null)} 
              onFinish={handleFinishWorkout}
            />
          )}
        </AnimatePresence>
        {activeTab === 'treinos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
             {workouts.length === 0 ? (
                <div className="md:col-span-2 py-20 sm:py-32 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] sm:rounded-[4rem] bg-slate-900/20 px-6">
                   <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-800 mx-auto mb-6" />
                   <h3 className="text-lg sm:text-xl font-display font-black text-slate-400 uppercase italic">Nenhum treino prescrito</h3>
                   <p className="text-[10px] sm:text-xs text-slate-600 font-bold uppercase tracking-widest mt-2 italic">Aguarde seu treinador enviar sua primeira planilha.</p>
                </div>
             ) : (
               workouts.map(workout => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={workout.id} 
                   className="bg-slate-900 border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 hover:border-red-500/20 transition-all group relative overflow-hidden flex flex-col min-h-[400px] sm:min-h-[450px]"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                       <div className={cn(
                         "px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic border shadow-lg",
                         workout.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                       )}>
                          {workout.status === 'completed' ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Missão Cumprida</span>
                          ) : 'Próximo Desafio'}
                       </div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {workout.createdAt?.toDate ? formatDate(workout.createdAt.toDate()) : 'Recent'}
                       </span>
                    </div>

                    <h4 className="text-2xl font-display font-black italic uppercase tracking-wider mb-2 group-hover:text-red-500 transition-colors">{workout.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">
                       <span>{workout.division}</span>
                       <span className="w-1 h-1 bg-slate-700 rounded-full" />
                       <span>{formatGoal(workout.goal)}</span>
                    </div>

                    {/* Animated Graph Illustration */}
                    <div className="mb-6 relative h-40 rounded-[2rem] overflow-hidden border border-white/5 bg-slate-950 group-hover:border-red-500/20 transition-all shadow-inner flex flex-col">
                       <div className="flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <WorkoutGraph type={workout.title} intensity="medium" />
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-20"></div>
                    </div>
                    
                    <div className="space-y-4 mb-10 flex-1">
                       {workout.exercises.slice(0, 2).map((ex, i) => (
                         <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/40 transition-colors">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-lg mb-1">{ex.name}</span>
                               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">{ex.series} Séries • {ex.reps} Reps</span>
                            </div>
                         </div>
                       ))}
                       {workout.exercises.length > 2 && (
                         <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center italic">+ {workout.exercises.length - 2} exercícios neste treino</div>
                       )}
                    </div>
                    
                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                       {workout.status !== 'completed' ? (
                         <button 
                          onClick={() => handleStartWorkout(workout)}
                          className="flex-1 bg-red-600 text-white font-display font-black uppercase italic tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-500 active:scale-95 transition-all text-xs flex items-center justify-center gap-3"
                         >
                            <Play className="w-4 h-4 fill-current" />
                            Iniciar Treino
                         </button>
                       ) : (
                         <div className="flex-1 text-center py-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <span className="text-[10px] font-black uppercase text-green-500 italic tracking-widest">Treino Finalizado</span>
                         </div>
                       )}
                    </div>
                 </motion.div>
               ))
             )}
          </div>
        )}

        {activeTab === 'consultorias' && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 bg-yellow-400/10 rounded-[2rem] flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-yellow-400" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-display font-black italic uppercase tracking-wider mb-2">Sessão Individual</h3>
                      <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                         Agende um horário exclusivo com seu treinador para avaliação física, técnica ou planejameto.
                      </p>
                   </div>
                   <button className="w-full bg-yellow-400 text-slate-950 py-4 rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:bg-yellow-300">
                      Solicitar Agendamento
                   </button>
                </div>

                <div className="bg-slate-900/30 border border-white/10 rounded-[3rem] p-10">
                   <h3 className="text-xl font-display font-black italic uppercase tracking-wider mb-8">Próximos Compromissos</h3>
                   <div className="space-y-4">
                      {consultations.length === 0 ? (
                        <div className="py-12 text-center text-slate-600 font-black uppercase italic text-[10px] tracking-widest">
                           Nada agendado para esta semana.
                        </div>
                      ) : (
                        consultations.map(consult => (
                          <div key={consult.id} className="bg-black/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                                   <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                             </div>
                             <div>
                                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{consult.date} às {consult.time}</div>
                                   <h5 className="font-display font-black uppercase italic text-sm tracking-widest">{consult.type}</h5>
                             </div>
                             <div className={cn(
                               "px-4 py-1 rounded-full text-[8px] font-black uppercase italic border",
                               consult.status === 'scheduled' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                             )}>
                                {consult.status}
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'corridas' && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registrations.length === 0 ? (
                   <div className="md:col-span-3 py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                      <Zap className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                      <h3 className="text-xl font-display font-black text-slate-400 uppercase italic">Nenhuma corrida encontrada</h3>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2">Escolha seu próximo desafio no catálogo.</p>
                      <Link to="/" className="inline-block mt-8 text-yellow-400 font-black uppercase italic hover:underline">Ver Eventos Disponíveis</Link>
                   </div>
                ) : (
                  registrations.map(reg => (
                    <div key={reg.id} className="bg-slate-900/50 border border-white/5 rounded-[3rem] overflow-hidden group">
                       <div className="p-8 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className={cn(
                               "px-3 py-1 rounded-full text-[8px] font-black uppercase italic border",
                               reg.paymentStatus === 'confirmed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                             )}>
                                {reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente'}
                             </div>
                             <span className="text-[10px] font-black text-slate-600 uppercase italic">#RM-{reg.id.slice(0, 4)}</span>
                          </div>

                          <div>
                             <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter leading-tight mb-2">Evento</h3>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Corrida: {reg.raceId}</p>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-white/5">
                             <div className="flex items-center gap-3 text-slate-500">
                                <Trophy className="w-4 h-4 text-yellow-400/50" />
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Atleta: {reg.runnerName}</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-500">
                                <BadgeAlert className="w-4 h-4 text-yellow-400/50" />
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Camiseta: {reg.jerseySize}</span>
                             </div>
                          </div>
                       </div>
                       <Link 
                         to={`/registration/${reg.id}`}
                         className="block w-full bg-slate-900 border-t border-white/5 py-5 text-center text-[10px] font-black uppercase tracking-widest group-hover:bg-yellow-400 group-hover:text-slate-950 transition-all"
                       >
                          Ver Comprovante
                       </Link>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunnerDashboard;
