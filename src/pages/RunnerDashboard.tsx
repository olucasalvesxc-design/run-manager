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
import { Link, useSearchParams } from 'react-router-dom';
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
  const initialTab = searchParams.get('tab') as 'treinos' | 'consultorias' | 'corridas';
  const [activeTab, setActiveTab] = useState<'treinos' | 'consultorias' | 'corridas'>(initialTab || 'treinos');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTab && ['treinos', 'consultorias', 'corridas'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 bg-slate-50 min-m-[-2rem] p-4 sm:p-8">
      {/* Header and Access Level */}
      <header className="mb-12">
         <div className="flex items-center gap-3 text-blue-500 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">NIVEL DE ACESSO: MASTER</span>
         </div>
         <h1 className="flex flex-col leading-none">
           <span className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-200">Runner</span>
           <span className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-slate-900 -mt-2">Dashboard</span>
         </h1>
      </header>

      {/* Weekly Progress Bar */}
      <div className="bg-[#11161D] border border-white/5 rounded-[2.5rem] p-4 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 italic text-left">Progresso Semanal</p>
              <h3 className="text-xl sm:text-3xl font-display font-black text-white uppercase italic tracking-tighter text-left">
                {weeklyStats.completed} de {weeklyStats.goal} <span className="text-[#3B82F6]">Sessões</span>
              </h3>
            </div>
          </div>
          <div className="flex-1 max-w-md w-full px-2 sm:px-0">
            <div className="h-2 sm:h-3 bg-black rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyStats.completed / weeklyStats.goal) * 100}%` }}
                className="h-full bg-[#3B82F6] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              />
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className={`text-2xl font-display font-black italic uppercase tracking-tighter ${weeklyStats.completed >= weeklyStats.goal ? 'text-[#3B82F6]' : 'text-slate-600'}`}>
              {Math.min(100, Math.round((weeklyStats.completed / weeklyStats.goal) * 100))}%
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Master Score</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mirroring the Image La      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#11161D] p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden group border border-white/5">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Total Atividades</h3>
           <div className="flex items-end justify-between">
              <p className="text-5xl sm:text-7xl font-display font-black text-white italic">{workouts.length}</p>
              <span className="bg-emerald-400/20 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black italic">+12%</span>
           </div>
        </div>
        
        <div className="bg-[#3B82F6] p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden group shadow-[0_20px_40px_rgba(59,130,246,0.3)]">
           <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-10 italic">Explosão</h3>
           <div className="flex items-end justify-between">
              <p className="text-5xl sm:text-7xl font-display font-black text-white italic">{weeklyStats.completed}</p>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-black italic">+5%</span>
           </div>
        </div>
 
        <div className="bg-[#11161D] p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden group border border-white/5">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 italic">Corridas</h3>
           <div className="flex items-end justify-between">
              <p className="text-5xl sm:text-7xl font-display font-black text-white italic">{registrations.length}</p>
              <span className="bg-rose-400/20 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black italic">-2%</span>
           </div>
        </div>
 
        <div className="bg-[#11161D] p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden group border border-white/5">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic flex items-center gap-2">
             Status <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> <span className="text-[#3B82F6]">Live Sync</span>
           </h3>
           <div className="flex items-end justify-between mt-10">
              <p className="text-3xl sm:text-4xl font-display font-black text-white italic">Pronto</p>
           </div>
        </div>
      </div>    </div>

      {/* Monthly Evolution       <div className="bg-[#11161D] border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 text-[#3B82F6] mb-2">
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Monitor de Crescimento</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black italic uppercase tracking-tighter text-white leading-none">
              Expansão da Rede de <span className="text-[#3B82F6]">Profissionais.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic bg-black/20 px-6 py-4 rounded-2xl border border-white/5 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0 text-[#3B82F6]">
              <div className="w-2 h-2 bg-[#3B82F6] rounded-full shadow-[0_0_8px_#3B82F6]" />
              <span>Corrida</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 bg-slate-700 rounded-full" />
              <span>Elite Alpha</span>
            </div>
          </div>
        </div>
 
        <div className="h-[250px] sm:h-[300px] w-full relative z-10">
          {monthlyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
                  cursor={{ fill: '#ffffff08' }}
                  contentStyle={{ 
                    backgroundColor: '#11161D', 
                    border: '1px solid #ffffff10',
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                  }}
                  itemStyle={{ 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#ffffff'
                  }}
                  labelStyle={{
                    color: '#3B82F6',
                    marginBottom: '0.5rem',
                    fontSize: '9px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                />
                <Bar dataKey="Corrida" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="Musculação" stackId="a" fill="#334155" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="Funcional" stackId="a" fill="#475569" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <BarChart2 className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                Aguardando primeiros treinos <br/> concluídos para gerar insights.
              </p>
            </div>
          )}
        </div>
      </div>>
      </div>

      <div className="relative overflow-hidden bg-[#11161D] border border-white/5 p-6 sm:p-12 rounded-[3rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B82F6] mb-4 italic">
            <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse shadow-[0_0_8px_#3B82F6]"></div>
            Elite Athlete Portal
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            Foco no <span className="text-[#3B82F6]">Objetivo.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium italic mb-8 max-w-xl">
            Sua jornada master começa aqui. Acompanhe cada quilômetro e cada repetição com precisão cirúrgica.
          </p>
          
          {profile?.athleteCode && (
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-black/40 border border-white/5 p-4 sm:p-6 rounded-3xl w-full sm:w-auto shadow-inner">
               <div className="shrink-0 flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 bg-[#11161D] border border-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                     <Target className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic">ID DE ATLETA</span>
                    <span className="text-xl sm:text-2xl font-display font-black text-white tracking-widest italic uppercase">{profile.athleteCode}</span>
                  </div>
               </div>
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(profile.athleteCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={cn(
                  "w-full sm:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg",
                  copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#3B82F6] text-white hover:bg-blue-400 shadow-blue-500/20"
                )}
               >
                 {copied ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 {copied ? 'Copiado!' : 'Copiar Registro'}
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-[#11161D]/80 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-md sticky top-4 z-40 mx-4 sm:mx-0 shadow-2xl">
        <button 
          onClick={() => setActiveTab('treinos')}
          className={cn(
            "flex-1 py-4 px-6 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
            activeTab === 'treinos' ? "bg-[#3B82F6] text-white shadow-xl italic" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="hidden sm:inline">Treinos Master</span>
          <span className="sm:hidden">Treinos</span>
        </button>
        <button 
          onClick={() => setActiveTab('consultorias')}
          className={cn(
            "flex-1 py-4 px-6 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
            activeTab === 'consultorias' ? "bg-[#3B82F6] text-white shadow-xl italic" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Consultorias Elite</span>
          <span className="sm:hidden">Sessões</span>
        </button>
        <button 
          onClick={() => setActiveTab('corridas')}
          className={cn(
            "flex-1 py-4 px-6 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
            activeTab === 'corridas' ? "bg-[#3B82F6] text-white shadow-xl italic" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Próximos Eventos</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {workouts.length === 0 ? (
                <div className="md:col-span-2 py-32 text-center border border-white/5 rounded-[3rem] bg-[#11161D] shadow-2xl">
                   <Dumbbell className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                   <h3 className="text-xl font-display font-black text-slate-600 uppercase italic">Nenhum treino prescrito</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 italic">Seu treinador master enviará sua planilha em breve.</p>
                </div>
             ) : (
                workouts.map(workout => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={workout.id} 
                    className="bg-[#11161D] border border-white/5 rounded-[3rem] p-8 hover:border-[#3B82F6]/50 transition-all group relative overflow-hidden flex flex-col min-h-[450px] shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <div className={cn(
                         "px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic border shadow-sm",
                         workout.status === 'completed' ? "bg-emerald-400/10 text-emerald-500 border-emerald-500/10" : "bg-blue-500/10 text-[#3B82F6] border-blue-500/10"
                       )}>
                          {workout.status === 'completed' ? 'Missão Concluída' : 'Em Aberto'}
                       </div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {workout.createdAt?.toDate ? formatDate(workout.createdAt.toDate()) : 'Recent'}
                       </span>
                    </div>
 
                    <h4 className="text-3xl font-display font-black italic uppercase tracking-wider mb-2 text-white group-hover:text-[#3B82F6] transition-colors uppercase leading-none">{workout.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">
                       <span>{workout.division}</span>
                       <span className="w-1 h-1 bg-slate-800 rounded-full" />
                       <span>{formatGoal(workout.goal)}</span>
                    </div>
 
                    <div className="mb-8 relative h-44 rounded-3xl overflow-hidden border border-white/5 bg-black/40 group-hover:border-blue-500/20 transition-all flex flex-col shadow-inner">
                       <div className="flex-1 opacity-40 group-hover:opacity-80 transition-opacity">
                          <WorkoutGraph type={workout.title} intensity="medium" />
                       </div>
                    </div>
                    
                    <div className="space-y-4 mb-10 flex-1">
                       {workout.exercises.slice(0, 2).map((ex, i) => (
                         <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/40 transition-colors">
                             <div className="flex flex-col">
                                <span className="text-white px-2 py-0.5 rounded-lg mb-1 font-bold">{ex.name}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">{ex.series} Séries • {ex.reps} Reps</span>
                             </div>
                         </div>
                       ))}
                       {workout.exercises.length > 2 && (
                         <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center italic mt-4">+ {workout.exercises.length - 2} exercícios neste bloco</div>
                       )}
                    </div>
                    
                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                       {workout.status !== 'completed' ? (
                         <button 
                          onClick={() => handleStartWorkout(workout)}
                          className="flex-1 bg-[#3B82F6] text-white font-display font-black uppercase italic tracking-[0.2em] py-5 rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-400 active:scale-95 transition-all text-xs flex items-center justify-center gap-3"
                         >
                             <Play className="w-4 h-4 fill-current" />
                             Acionar Protocolo
                         </button>
                       ) : (
                         <div className="flex-1 text-center py-5 bg-emerald-400/10 rounded-2xl border border-emerald-400/20">
                            <span className="text-[10px] font-black uppercase text-emerald-500 italic tracking-widest">Protocolo Finalizado</span>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))
             )}
          </div>
        )}
        {activeTab === 'consultorias' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-[#11161D] border border-white/5 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl">
                <div className="w-20 h-20 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-center shadow-inner">
                   <Calendar className="w-10 h-10 text-[#3B82F6]" />
                </div>
                <div>
                   <h3 className="text-3xl font-display font-black italic uppercase tracking-wider mb-4 text-white">Agenda Elite</h3>
                   <p className="text-sm text-slate-400 font-medium italic leading-relaxed max-w-sm">
                      Solicite uma reavaliação ou planejamento tático com seu treinador master.
                   </p>
                </div>
                <button className="w-full bg-[#3B82F6] text-white py-5 rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:bg-blue-400">
                   Requisitar Horário
                </button>
             </div>
 
             <div className="bg-[#11161D] border border-white/5 rounded-[3rem] p-12 shadow-2xl">
                <h3 className="text-2xl font-display font-black italic uppercase tracking-wider mb-10 text-white underline decoration-[#3B82F6] underline-offset-8">Status de Sessões</h3>
                <div className="space-y-6">
                   {consultations.length === 0 ? (
                     <div className="py-16 text-center text-slate-600 font-black uppercase italic text-xs tracking-widest">
                        Nenhuma sessão pendente.
                     </div>
                   ) : (
                     consultations.map(consult => (
                       <div key={consult.id} className="bg-black/20 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-[#11161D] border border-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                                <Clock className="w-6 h-6 text-[#3B82F6]" />
                             </div>
                             <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{consult.date} • {consult.time}</div>
                                <h5 className="font-display font-black uppercase italic text-lg tracking-widest text-white leading-none">{consult.type}</h5>
                             </div>
                          </div>
                          <div className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border shadow-sm",
                            consult.status === 'scheduled' ? "bg-blue-500/10 text-[#3B82F6] border-blue-500/10" : "bg-emerald-400/10 text-emerald-500 border-emerald-400/10"
                          )}>
                             {consult.status === 'scheduled' ? 'Agendado' : consult.status}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}          {activeTab === 'corridas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {registrations.length === 0 ? (
                <div className="md:col-span-3 py-32 text-center border border-white/5 rounded-[3rem] bg-[#11161D] shadow-2xl">
                   <Zap className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                   <h3 className="text-xl font-display font-black text-slate-700 uppercase italic">Nenhuma inscrição ativa</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Explore novos desafios no calendário master.</p>
                   <Link to="/" className="inline-block mt-10 bg-[#3B82F6] text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg shadow-blue-500/20">Ver Eventos</Link>
                </div>
             ) : (
               registrations.map(reg => (
                 <div key={reg.id} className="bg-[#11161D] border border-white/5 rounded-[3.5rem] overflow-hidden group shadow-2xl flex flex-col">
                    <div className="p-8 space-y-8 flex-1">
                       <div className="flex items-center justify-between">
                          <div className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border shadow-sm",
                            reg.paymentStatus === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-blue-500/10 text-[#3B82F6] border-blue-500/10"
                          )}>
                             {reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Auditando'}
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">#{reg.id.slice(0, 6)}</span>
                       </div>
 
                       <div>
                          <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none mb-3 text-white">Corrida</h3>
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Protocolo de Registro Ativo</p>
                       </div>
 
                       <div className="space-y-4 pt-8 border-t border-white/5">
                          <div className="flex items-center gap-4 text-slate-400">
                             <Trophy className="w-5 h-5 text-blue-500/40" />
                             <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">{reg.runnerName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-400">
                             <Activity className="w-5 h-5 text-blue-500/40" />
                             <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Kit: {reg.jerseySize}</span>
                          </div>
                       </div>
                    </div>
                    <Link 
                      to={`/registration/${reg.id}`}
                      className="block w-full bg-black/40 border-t border-white/5 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] group-hover:bg-[#3B82F6] group-hover:text-white transition-all italic text-slate-400"
                    >
                       Acessar Voucher
                    </Link>
                 </div>
               ))
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunnerDashboard;
