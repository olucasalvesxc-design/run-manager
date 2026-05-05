import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Users, 
  Dumbbell, 
  Calendar, 
  Plus, 
  Search,
  Loader2,
  Activity as ActivityIcon,
  Clock,
  ExternalLink,
  MessageSquare,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrainerClient, Workout, Consultation, WorkoutGoal } from '../types';
import { cn, formatDate, formatGoal } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CommandCenter } from '../components/CommandCenter';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from 'recharts';

const engagementData = [
  { name: 'Seg', pct: 65 },
  { name: 'Ter', pct: 72 },
  { name: 'Qua', pct: 85 },
  { name: 'Qui', pct: 78 },
  { name: 'Sex', pct: 92 },
  { name: 'Sáb', pct: 45 },
  { name: 'Dom', pct: 30 },
];

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', whatsapp: '', goal: '', status: 'active', athleteCode: '' });
  const [searchingCode, setSearchingCode] = useState(false);

  const stats = {
    totalClients: clients.length,
    pendingPayments: clients.filter(c => c.status === 'pending').length,
    completionRate: 78,
    topRace: races.length > 0 ? races[0].name : undefined,
    recentActivitiesCount: recentWorkouts.length
  };

  const activeWorkoutsCount = new Set(recentWorkouts.map(w => w.clientId)).size;

  useEffect(() => {
    if (!user) return;

    const unsubRaces = onSnapshot(query(collection(db, 'races'), where('userId', '==', user.uid)), (snap) => {
       setRaces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubClients = onSnapshot(query(collection(db, 'trainer_clients'), where('trainerId', '==', user.uid), orderBy('createdAt', 'desc')), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainerClient[]);
    });

    const unsubWorkouts = onSnapshot(query(collection(db, 'workouts'), where('trainerId', '==', user.uid), orderBy('createdAt', 'desc')), (snap) => {
      setRecentWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workout[]);
    });

    const unsubConsults = onSnapshot(query(collection(db, 'consultations'), where('trainerId', '==', user.uid), orderBy('date', 'asc')), (snap) => {
      setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultation[]);
      setLoading(false);
    });

    return () => {
      unsubRaces();
      unsubClients();
      unsubWorkouts();
      unsubConsults();
    };
  }, [user]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'trainer_clients'), {
        trainerId: user.uid,
        ...newClient,
        status: 'active',
        createdAt: serverTimestamp()
      });
      setIsAddingClient(false);
      setNewClient({ name: '', email: '', whatsapp: '', goal: '', status: 'active', athleteCode: '' });
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar aluno');
    }
  };

  const fetchByCode = async () => {
    if (newClient.athleteCode.length < 6) return;
    setSearchingCode(true);
    try {
      const q = query(collection(db, 'profiles'), where('athleteCode', '==', newClient.athleteCode.toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setNewClient({
          ...newClient,
          name: data.runnerName || data.organizerName || '',
          email: data.email || '',
        });
      } else {
        alert('Código de atleta não encontrado.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCode(false);
    }
  };

  return (
    <div className="space-y-12 bg-[#05070A] min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3 text-[#3B82F6] mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">NIVEL DE ACESSO: MASTER</span>
           </div>
           <h1 className="flex flex-col leading-none">
              <span className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-800">Painel</span>
              <span className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white -mt-2">Central</span>
           </h1>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard/trainer/workout-ai"
            className="bg-white/5 text-white px-6 py-4 rounded-3xl font-black italic uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs group"
          >
            <Zap className="w-5 h-5 text-[#3B82F6] group-hover:scale-125 transition-transform" />
            Gerar Treino IA
          </Link>
          <button 
            onClick={() => setIsAddingClient(true)}
            className="bg-[#3B82F6] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl font-black italic uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:bg-blue-400 text-xs sm:text-sm font-bold"
          >
            <Plus className="w-5 h-5" />
            Novo Aluno
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          <CommandCenter stats={stats} />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'ALUNOS TOTAIS', value: clients.length, icon: Users, color: 'blue' },
              { label: 'TREINOS ATIVOS', value: activeWorkoutsCount, icon: Dumbbell, color: 'emerald' },
              { label: 'CONSULTAS', value: consultations.length, icon: Calendar, color: 'amber' },
              { label: 'ENGAGEMENT', value: 78, suffix: '%', icon: TrendingUp, color: 'purple' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#3B82F6]/30 transition-all group overflow-hidden relative"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                    stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                    stat.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
                    "bg-purple-500/10 text-purple-500"
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{stat.label}</h3>
                <p className="text-4xl font-display font-black text-white italic">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix || ''} />
                </p>
                <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <stat.icon className="w-32 h-32" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#11161D] rounded-[3.5rem] border border-white/5 p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-black italic uppercase tracking-wider text-white">Engajamento dos <span className="text-[#3B82F6]">Alunos</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Taxa de conclusão de treinos (%) por dia</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 10 }}
                    contentStyle={{ 
                      backgroundColor: '#0B1220', 
                      border: '1px solid #ffffff10', 
                      borderRadius: '16px',
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="pct" radius={[10, 10, 10, 10]}>
                    {engagementData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.pct > 80 ? '#3B82F6' : entry.pct > 50 ? '#1e40af' : '#111827'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Sidebar remains mostly same color-wise but upgrade buttons */}
           <div className="bg-[#11161D] rounded-[3rem] border border-white/5 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                 <Clock className="w-5 h-5 text-[#3B82F6]" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Últimos Atletas Ativos</h2>
              </div>
              <div className="space-y-6">
                 {recentWorkouts.slice(0, 5).map((workout, i) => (
                    <motion.div 
                      key={workout.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-6 border-l border-white/5"
                    >
                       <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 bg-[#3B82F6] rounded-full shadow-[0_0_10px_#3B82F6]" />
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">
                          {workout.createdAt?.toDate ? formatDate(workout.createdAt.toDate()) : 'Recent'}
                       </p>
                       <h5 className="font-black text-sm tracking-tight text-white mb-2 italic">{workout.clientName || 'Runner'}</h5>
                       <span className="inline-block px-3 py-1 bg-[#3B82F6]/5 rounded-lg text-[8px] font-black uppercase text-[#3B82F6] tracking-widest border border-[#3B82F6]/10">
                          {workout.title}
                       </span>
                    </motion.div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#3B82F6] to-blue-700 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                <MessageSquare className="w-32 h-32" />
              </div>
              <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 relative z-10 leading-none">Upgrade <br />PREMIUM.</h4>
              <p className="text-[10px] font-bold leading-relaxed mb-8 opacity-80 relative z-10 italic uppercase tracking-widest">
                Gerencie até 50 alunos e use templates de treino automáticos.
              </p>
              <button className="bg-white text-black px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-full relative z-10 font-bold italic shadow-xl">
                Ver Meus Planos
              </button>
           </div>
        </div>
      </div>

      <div className="bg-[#11161D] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
         <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-display font-black italic uppercase tracking-wider text-white">Gestão de <span className="text-[#3B82F6]">Alunos</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Acompanhamento em tempo real</p>
            </div>
            <div className="relative w-full md:w-auto">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="BUSCAR ATLETA PELO NOME OU CÓDIGO..." 
                 className="w-full md:w-80 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#3B82F6] transition-colors text-white placeholder:text-slate-700"
               />
            </div>
         </div>
         
         <div className="divide-y divide-white/5">
            {loading ? (
               <div className="p-20 text-center text-slate-500 font-black uppercase italic text-xs tracking-widest">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#3B82F6]" />
                  Sincronizando Dados Básicos...
               </div>
            ) : clients.length === 0 ? (
               <div className="p-32 text-center">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-black/40 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5"
                  >
                     <Users className="w-10 h-10 text-slate-800" />
                  </motion.div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-8">Base de Dados Vazia.</p>
                  <button onClick={() => setIsAddingClient(true)} className="text-[#3B82F6] font-black uppercase text-[10px] hover:underline transition-all underline-offset-8">Cadastrar Primeiro Aluno Agora</button>
               </div>
            ) : (
              clients.map(client => (
                <motion.div 
                  key={client.id} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="p-6 sm:p-8 hover:bg-[#3B82F6]/5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[2rem] bg-[#05070A] border border-white/5 flex items-center justify-center text-2xl font-display font-black italic text-[#3B82F6] group-hover:scale-110 transition-transform shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         {client.name.charAt(0)}
                      </div>
                      <div>
                         <div className="flex items-center gap-4 mb-1">
                            <h4 className="font-display font-black uppercase italic tracking-wider text-xl text-white">{client.name}</h4>
                            <span className={cn(
                             "text-[8px] font-black px-3 py-1 rounded-full uppercase italic border",
                             client.status === 'active' ? "bg-[#3B82F6]/5 text-[#3B82F6] border-[#3B82F6]/10" : "bg-slate-800 text-slate-600 border-white/5"
                            )}>
                             {client.status === 'active' ? 'STATUS: ATIVO' : 'STATUS: INATIVO'}
                            </span>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{formatGoal(client.goal) || 'Geral'}</span>
                            <div className="w-1 h-1 bg-slate-800 rounded-full" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{client.whatsapp}</span>
                            <div className="w-1 h-1 bg-slate-800 rounded-full" />
                            <span className="text-[8px] font-black text-[#3B82F6] uppercase tracking-[0.2em]">{client.athleteCode || 'NO CODE'}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-x-4 group-hover:translate-x-0">
                      <Link 
                        to={`/dashboard/trainer/client/${client.id}`}
                        className="bg-white/5 text-slate-400 hover:text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all font-bold border border-white/10"
                      >
                        Perfil Completo
                      </Link>
                      <Link 
                         to={`/dashboard/trainer/workout/new?clientId=${client.id}`}
                         className="bg-[#3B82F6] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-400 flex items-center gap-2 shadow-xl shadow-blue-500/10 font-bold italic"
                      >
                         <Plus className="w-4 h-4" />
                         Novo Treino
                      </Link>
                   </div>
                </motion.div>
              ))
            )}
         </div>
      </div>

      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingClient(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#11161D] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-hidden">
                <h2 className="text-3xl font-display font-black italic uppercase tracking-tight mb-2">Novo Atleta</h2>
                <p className="text-slate-500 text-xs mb-10 italic uppercase font-bold tracking-widest">Matricular aluno na assessoria pro</p>
                <form onSubmit={handleAddClient} className="space-y-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest italic ml-2">Sincronizar por Código</label>
                     <div className="flex gap-3">
                       <input value={newClient.athleteCode} onChange={e => setNewClient({...newClient, athleteCode: e.target.value.toUpperCase()})} maxLength={6} className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.3em] uppercase focus:outline-none focus:border-[#3B82F6] transition-colors placeholder:text-slate-800 text-white" placeholder="EX: ABC123" />
                       <button type="button" onClick={fetchByCode} disabled={searchingCode || newClient.athleteCode.length < 6} className="bg-[#3B82F6] text-white px-6 rounded-2xl transition-all hover:bg-blue-400 shadow-lg shadow-blue-500/20">
                         {searchingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                       </button>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Dados Pessoais</label>
                     <input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-[#3B82F6] transition-colors text-white" placeholder="NOME COMPLETO" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-[#3B82F6] transition-colors text-white" placeholder="E-MAIL" />
                      <input required value={newClient.whatsapp} onChange={e => setNewClient({...newClient, whatsapp: e.target.value})} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-[#3B82F6] transition-colors text-white" placeholder="WHATSAPP" />
                    </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Objetivo Pro</label>
                      <select required value={newClient.goal} onChange={e => setNewClient({...newClient, goal: e.target.value as WorkoutGoal})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#3B82F6] transition-colors appearance-none text-white lg:text-xs">
                        <option value="">Selecione o objetivo...</option>
                        <option value="ganho_massa">Ganho de Massa</option>
                        <option value="emagrecimento">Emagrecimento</option>
                        <option value="resistencia">Resistência Muscular</option>
                        <option value="vo2_max">Melhora de VO2 Max</option>
                        <option value="corrida">Foco em Corrida</option>
                        <option value="fortalecimento">Fortalecimento</option>
                        <option value="potencia">Potência / Explosão</option>
                        <option value="recuperacao_ativa">Recuperação Ativa</option>
                        <option value="mobilidade">Mobilidade & Flexibilidade</option>
                        <option value="reabilitacao">Reabilitação</option>
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-6 pt-6">
                      <button type="button" onClick={() => setIsAddingClient(false)} className="bg-white/5 text-slate-500 py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancelar</button>
                      <button type="submit" className="bg-[#3B82F6] text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-blue-400 transition-colors shadow-2xl shadow-blue-500/20 font-bold">Confirmar Matrícula</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainerDashboard;
