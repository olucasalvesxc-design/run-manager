import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, limit } from 'firebase/firestore';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Activity,
  Dumbbell,
  Users,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Race, Workout, Consultation } from '../types';
import { cn, formatDate, formatGoal } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const chartData = [
  { name: 'Seg', km: 12 },
  { name: 'Ter', km: 8 },
  { name: 'Qua', km: 15 },
  { name: 'Qui', km: 0 },
  { name: 'Sex', km: 10 },
  { name: 'Sáb', km: 22 },
  { name: 'Dom', km: 35 },
];

const SkeletonCard = () => (
  <div className="bg-[#11161D] p-10 rounded-[2.5rem] border border-white/5 animate-pulse">
    <div className="flex items-center justify-between mb-8">
      <div className="w-12 h-12 bg-white/5 rounded-2xl" />
      <div className="w-16 h-4 bg-white/5 rounded-full" />
    </div>
    <div className="w-24 h-3 bg-white/5 rounded-full mb-4" />
    <div className="w-32 h-10 bg-white/5 rounded-2xl" />
  </div>
);

const DashboardOverview = () => {
  const { user } = useAuth();
  const [nextRaces, setNextRaces] = useState<Race[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const racesQuery = query(
      collection(db, 'races'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc'),
      limit(3)
    );

    const unsubRaces = onSnapshot(racesQuery, (snap) => {
      setNextRaces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Race[]);
    });

    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('clientEmail', '==', user.email),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubWorkouts = onSnapshot(workoutsQuery, (snap) => {
      setRecentWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workout[]);
    });

    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('clientEmail', '==', user.email),
      orderBy('date', 'asc'),
      limit(2)
    );

    const unsubConsults = onSnapshot(consultationsQuery, (snap) => {
      setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultation[]);
      setTimeout(() => setLoading(false), 800); // Small artificial delay for smooth transition
    });

    return () => {
      unsubRaces();
      unsubWorkouts();
      unsubConsults();
    };
  }, [user]);

  const stats = [
    { label: 'KM RODADOS', value: 142.5, precision: 1, icon: Activity, trend: '+12.5%', color: 'blue', suffix: ' km' },
    { label: 'CALORIAS', value: 8.4, precision: 1, icon: Zap, trend: '+0.8k', color: 'blue', suffix: 'k' },
    { label: 'TREINOS ATIVOS', value: 3, precision: 0, icon: Dumbbell, trend: 'Preparado', color: 'blue' },
    { label: 'DIAS PARA PROVA', value: 22, precision: 0, icon: Trophy, trend: 'Foco', color: 'blue', suffix: 'D' },
  ];

  const colorVariants: any = {
    blue: "text-[#3B82F6] bg-[#3B82F6]/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    blue_alt: "text-blue-400 bg-blue-400/10",
  };

  const handleDeleteRace = async (raceId: string) => {
    if (!window.confirm('Excluir esta prova?')) return;
    try {
      await deleteDoc(doc(db, 'races', raceId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="w-full h-96 bg-[#11161D] rounded-[3.5rem] border border-white/5 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#0A0D12] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden group shadow-2xl"
      >
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <TrendingUp className="w-64 h-64 text-[#3B82F6]" />
         </div>
         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3B82F6]/5 blur-[80px] rounded-full" />
         
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-[#3B82F6]">
               <ShieldCheck className="w-5 h-5" />
               <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] italic">Authority Access: Premium Athlete</span>
            </div>
            <h1 className="flex flex-col leading-[0.8] tracking-tighter">
               <span className="text-5xl sm:text-7xl md:text-9xl font-display font-black italic uppercase text-slate-800">Bom dia,</span>
               <span className="text-6xl sm:text-8xl md:text-[10rem] font-display font-black italic uppercase text-white -mt-2">
                 RUN<span className="text-[#3B82F6]">NER.</span>
               </span>
            </h1>
         </div>

         <div className="flex flex-col gap-4 relative z-10 w-full lg:w-auto">
            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 group-hover:border-[#3B82F6]/30 transition-colors">
               <div className="w-14 h-14 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                 <Calendar className="w-7 h-7 text-white" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Treino de Hoje</p>
                  <p className="text-xl font-display font-black italic uppercase tracking-wider text-white">HIIT + Mobilidade</p>
               </div>
            </div>
            <Link 
              to="/dashboard/trainer"
              className="bg-[#3B82F6] text-white px-8 py-5 rounded-3xl font-black italic uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-3 hover:bg-blue-600 font-bold"
            >
               Acessar Minha Planilha
               <ChevronRight className="w-4 h-4" />
            </Link>
         </div>
      </motion.div>

      {/* Interactive Stats & Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:col-span-1">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#3B82F6]/30 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", colorVariants[stat.color])}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend}
                  </span>
              </div>
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{stat.label}</h3>
              <p className="text-3xl font-display font-black italic text-white leading-none">
                <AnimatedNumber value={stat.value} precision={stat.precision || 0} suffix={stat.suffix} />
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 bg-[#11161D] rounded-[3.5rem] border border-white/5 p-8 sm:p-12 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-black italic uppercase tracking-wider text-white">Performance <span className="text-[#3B82F6]">Semanal</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Volume total de km percorridos por dia</p>
            </div>
            <div className="flex gap-2">
              {['V', 'D', 'W'].map((t) => (
                <button key={t} className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 text-[10px] font-black text-slate-500 hover:text-white hover:border-[#3B82F6]/50 transition-all">{t}</button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1220', 
                    border: '1px solid #ffffff10', 
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#3B82F6' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="km" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorKm)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provas e Atividades */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#11161D] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-display font-black italic uppercase tracking-wider text-white">Calendário de <span className="text-[#3B82F6]">Provas</span></h2>
                <Link to="/dashboard/races" className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:underline italic">Ver Tudo</Link>
             </div>

             <div className="space-y-6">
                {nextRaces.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                      <Trophy className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Nenhuma prova cadastrada.</p>
                      <Link to="/dashboard/races" className="text-[#3B82F6] text-[10px] font-black uppercase tracking-widest italic hover:underline mt-4 inline-block">Adicionar Minha Primeira Prova</Link>
                  </div>
                ) : (
                  nextRaces.map((race, i) => (
                    <motion.div 
                      key={race.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-black/20 p-6 sm:p-8 rounded-[2.5rem] border border-white/5 hover:border-[#3B82F6]/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#05070A] rounded-3xl flex items-center justify-center text-2xl font-display font-black italic text-[#3B82F6] group-hover:scale-110 transition-transform">
                             {race.type === 'Maratona' ? '42' : race.type === 'Meia' ? '21' : '10'}
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg sm:text-xl font-display font-black italic uppercase tracking-wider text-white">{race.name}</h4>
                                <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-[8px] font-black px-3 py-0.5 rounded-full uppercase italic border border-[#3B82F6]/10">
                                   Confirmada
                                </span>
                             </div>
                             <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                <div className="flex items-center gap-2">
                                   <MapPin className="w-3.5 h-3.5" />
                                   {race.location}
                                </div>
                                <div className="flex items-center gap-2">
                                   <Calendar className="w-3.5 h-3.5" />
                                   {formatDate(race.date)}
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleDeleteRace(race.id)}
                            className="bg-red-500/10 text-red-500 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                          <a 
                            href={race.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all flex items-center gap-2 font-bold"
                          >
                             Inscrição
                             <ExternalLink className="w-4 h-4" />
                          </a>
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           <div className="bg-[#11161D] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Consultorias</h2>
                 </div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              
              <div className="space-y-4">
                 {consultations.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Sem consultas agendadas.</p>
                    </div>
                 ) : (
                    consultations.map((consult) => (
                       <div key={consult.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all transition-colors group">
                          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{formatDate(consult.date)} • {consult.time}</div>
                          <h5 className="font-display font-black uppercase italic text-sm tracking-wider text-white group-hover:text-emerald-400 transition-colors">{consult.type}</h5>
                       </div>
                    ))
                 )}
                 <button className="w-full bg-[#3B82F6]/5 hover:bg-[#3B82F6]/10 text-[#3B82F6] py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest italic transition-all mt-4 border border-[#3B82F6]/10 font-bold">
                    Solicitar Agenda
                 </button>
              </div>
           </div>

           <div className="bg-[#3B82F6] p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)]">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                <Zap className="w-32 h-32" />
              </div>
              <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 relative z-10 leading-none">Upgrade <br />PRO.</h4>
              <p className="text-[10px] font-bold leading-relaxed mb-6 opacity-80 relative z-10 italic uppercase tracking-widest">
                Desbloqueie treinos de assessoria profissional e monitoramento de lactato.
              </p>
              <button className="bg-white text-black px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-full relative z-10 shadow-lg italic font-bold">
                Ver Planos Elite
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
