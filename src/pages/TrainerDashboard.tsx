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
  ChevronRight,
  Loader2,
  Activity as ActivityIcon,
  Award,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrainerClient, Workout, Consultation, WorkoutGoal } from '../types';
import { cn, formatDate, formatGoal } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', whatsapp: '', goal: '', status: 'active', athleteCode: '' });
  const [searchingCode, setSearchingCode] = useState(false);

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

  useEffect(() => {
    if (!user) return;

    const clientsQuery = query(
      collection(db, 'trainer_clients'),
      where('trainerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubClients = onSnapshot(clientsQuery, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainerClient[]);
    });

    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('trainerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubWorkouts = onSnapshot(workoutsQuery, (snap) => {
      setRecentWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workout[]);
    });

    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('trainerId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubConsults = onSnapshot(consultationsQuery, (snap) => {
      setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultation[]);
      setLoading(false);
    });

    return () => {
      unsubClients();
      unsubWorkouts();
      unsubConsults();
    };
  }, [user]);

  const pendingCount = clients.filter(c => !recentWorkouts.some(w => w.clientId === c.id)).length;
  const activeWorkoutsCount = new Set(recentWorkouts.map(w => w.clientId)).size;

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
      setNewClient({ name: '', email: '', whatsapp: '' });
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar aluno');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
           <div className="flex items-center gap-3 text-yellow-400 mb-2">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] italic">Módulo Consultoria & Treinos</span>
           </div>
           <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter">
             Gestão de <span className="text-yellow-400">Alunos.</span>
           </h1>
        </div>
        
        <button 
          onClick={() => setIsAddingClient(true)}
          className="bg-yellow-400 text-slate-950 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(250,204,21,0.2)] hover:bg-yellow-300 text-xs sm:text-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Aluno
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 md:px-0">
        <div className="bg-slate-900/50 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
           </div>
           <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Total Alunos</h3>
           <p className="text-3xl sm:text-5xl font-display font-black">{clients.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <ActivityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
           </div>
           <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Treinos Ativos</h3>
           <p className="text-3xl sm:text-5xl font-display font-black">{activeWorkoutsCount}</p>
        </div>
        <div className="bg-slate-900/50 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
           </div>
           <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Vagas</h3>
           <p className="text-3xl sm:text-5xl font-display font-black">{consultations.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
           </div>
           <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Pendentes</h3>
           <p className="text-3xl sm:text-5xl font-display font-black">{pendingCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display font-black italic uppercase tracking-wider">Meus Alunos</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR..." 
                    className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
             </div>
             
             <div className="divide-y divide-white/5">
                {loading ? (
                   <div className="p-20 text-center text-slate-500 font-black uppercase italic text-xs tracking-widest">
                     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-400" />
                     Lendo Alunos...
                   </div>
                ) : clients.length === 0 ? (
                   <div className="p-20 text-center">
                      <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                         <Users className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Nenhum aluno cadastrado ainda.</p>
                   </div>
                ) : (
                  clients.map(client => (
                    <div key={client.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-center gap-4 sm:gap-5">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg sm:text-xl font-display font-black italic text-yellow-400 sm:group-hover:scale-110 transition-transform">
                             {client.name.charAt(0)}
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-0.5 sm:mb-1">
                               <h4 className="font-display font-black uppercase italic tracking-wider text-base sm:text-lg">{client.name}</h4>
                               <span className={cn(
                                 "text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic",
                                 client.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-slate-800 text-slate-500"
                               )}>
                                 {client.status || 'Ativo'}
                               </span>
                             </div>
                             <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">{formatGoal(client.goal) || 'Geral'}</span>
                                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">{client.whatsapp}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 sm:gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/dashboard/trainer/client/${client.id}`}
                            className="flex-1 sm:flex-none text-center bg-white/5 hover:bg-white/10 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                          >
                            Ver Aluno
                          </Link>
                          <Link 
                             to={`/dashboard/trainer/workout/new?clientId=${client.id}`}
                             className="flex-1 sm:flex-none text-center bg-yellow-400 text-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:bg-yellow-300"
                          >
                             <Plus className="w-3 h-3" />
                             Novo Treino
                          </Link>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-8">
                 <Clock className="w-5 h-5 text-yellow-400" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Últimos Treinos Enviados</h2>
              </div>
              
              <div className="space-y-6">
                 {recentWorkouts.slice(0, 5).map(workout => (
                    <div key={workout.id} className="relative pl-6 border-l border-white/10">
                       <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          {workout.createdAt?.toDate ? formatDate(workout.createdAt.toDate()) : 'Recent'}
                       </div>
                       <h5 className="font-bold text-sm tracking-tight text-white mb-2">{workout.title}</h5>
                       <span className="inline-block px-3 py-1 bg-yellow-400/10 rounded-lg text-[8px] font-black uppercase text-yellow-400 tracking-widest border border-yellow-400/10">
                          {formatGoal(workout.goal)}
                       </span>
                    </div>
                 ))}
                 
                 {recentWorkouts.length === 0 && (
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">Nenhum treino enviado no momento.</p>
                 )}
              </div>
           </div>

           <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[3rem] p-8 text-slate-950 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                <MessageSquare className="w-32 h-32" />
              </div>
              <h4 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-4 relative z-10">Dica do Personal</h4>
              <p className="text-xs font-bold leading-relaxed mb-6 opacity-80 relative z-10">
                Lembre-se de cobrar o feedback dos seus atletas. Treinos monitorados têm 40% mais chances de serem concluídos.
              </p>
              <button className="bg-slate-950 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-full relative z-10 font-bold italic">
                Explorar Biblioteca
              </button>
           </div>

           <div className="bg-slate-900 border border-yellow-400/20 rounded-[3rem] p-8 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-slate-950" />
                 </div>
                 <h4 className="text-sm font-black italic uppercase">Portal do Atleta</h4>
              </div>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                Compartilhe este link com seus alunos para que eles acessem os treinos e consultorias.
              </p>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/atleta`;
                  navigator.clipboard.writeText(url);
                  alert('Link do Portal do Atleta copiado!');
                }}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Copiar Link de Acesso
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsAddingClient(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                   <Users className="w-32 h-32" />
                </div>
                
                <h2 className="text-3xl font-display font-black italic uppercase tracking-tight mb-2">Novo Aluno</h2>
                <p className="text-slate-400 text-xs mb-8 italic">Cadastre um novo atleta para sua consultoria.</p>
                
                <form onSubmit={handleAddClient} className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2 text-yellow-400">Já tem o código do Atleta?</label>
                     <div className="flex gap-2">
                       <input 
                         value={newClient.athleteCode}
                         onChange={e => setNewClient({...newClient, athleteCode: e.target.value.toUpperCase()})}
                         maxLength={6}
                         className="flex-1 bg-black/40 border-2 border-yellow-400/20 rounded-2xl px-6 py-4 text-sm font-black tracking-widest uppercase focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-slate-800"
                         placeholder="EX: ABC123"
                       />
                       <button 
                         type="button"
                         onClick={fetchByCode}
                         disabled={searchingCode || newClient.athleteCode.length < 6}
                         className="bg-yellow-400 text-slate-950 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-yellow-300 shadow-lg shadow-yellow-400/20"
                       >
                         {searchingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                       </button>
                     </div>
                     <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-2">Preenche automaticamente o nome e e-mail.</p>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome Completo</label>
                     <input 
                       required
                       value={newClient.name}
                       onChange={e => setNewClient({...newClient, name: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                       placeholder="Ex: João Silva"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">E-mail</label>
                     <input 
                       required
                       type="email"
                       value={newClient.email}
                       onChange={e => setNewClient({...newClient, email: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                       placeholder="atleta@exemplo.com"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">WhatsApp</label>
                     <input 
                       required
                       value={newClient.whatsapp}
                       onChange={e => setNewClient({...newClient, whatsapp: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                       placeholder="81999999999"
                     />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Objetivo Principal</label>
                      <select 
                        required
                        value={newClient.goal}
                        onChange={e => setNewClient({...newClient, goal: e.target.value as WorkoutGoal})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors appearance-none text-white lg:text-xs"
                      >
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
                   
                   <div className="grid grid-cols-2 gap-4 mt-10">
                      <button 
                        type="button"
                        onClick={() => setIsAddingClient(false)}
                        className="bg-white/5 text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="bg-yellow-400 text-slate-950 py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-yellow-300 transition-colors shadow-lg"
                      >
                        Salvar Atleta
                      </button>
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
