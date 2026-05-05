import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Dumbbell, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Mail,
  Phone,
  Target,
  Plus,
  Video,
  FileText,
  BadgeAlert,
  X,
  ExternalLink
} from 'lucide-react';
import { TrainerClient, Workout, Consultation } from '../types';
import { cn, formatDate, formatGoal } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const StudentProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<TrainerClient | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'treinos' | 'consultorias' | 'evolucao'>('treinos');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newConsult, setNewConsult] = useState({
     date: '',
     time: '',
     type: 'online' as 'online' | 'presencial',
     notes: ''
  });

  useEffect(() => {
    if (!clientId) return;

    const unsubClient = onSnapshot(doc(db, 'trainer_clients', clientId), (snap) => {
      if (snap.exists()) {
        setClient({ id: snap.id, ...snap.data() } as TrainerClient);
      }
    });

    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const unsubWorkouts = onSnapshot(workoutsQuery, (snap) => {
      setWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workout[]);
    });

    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );
    const unsubConsultations = onSnapshot(consultationsQuery, (snap) => {
      setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultation[]);
      setLoading(false);
    });

    return () => {
      unsubClient();
      unsubWorkouts();
      unsubConsultations();
    };
  }, [clientId]);

  const handleSchedule = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!clientId || !client) return;
     try {
        await addDoc(collection(db, 'consultations'), {
           trainerId: client.trainerId,
           clientId: clientId,
           clientName: client.name,
           date: newConsult.date,
           time: newConsult.time,
           type: newConsult.type,
           notes: newConsult.notes,
           status: 'scheduled',
           createdAt: serverTimestamp()
        });
        setShowScheduleModal(false);
        setNewConsult({ date: '', time: '', type: 'online', notes: '' });
     } catch (err) {
        console.error('Error scheduling consultation:', err);
        alert('Erro ao agendar consulta');
     }
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar para Dashboard</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Header / Basic Info */}
        <div className="flex-1 space-y-8 w-full">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-center text-4xl font-display font-black italic text-yellow-400 shadow-2xl">
                    {client.name.charAt(0)}
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-yellow-400/10 text-yellow-400 text-[8px] font-black px-3 py-1 rounded-full uppercase italic border border-yellow-400/10">
                          {client.status}
                       </span>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Acordo Ativo</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-4">
                       {client.name.split(' ')[0]} <span className="text-yellow-400">{client.name.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-500">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                          <Target className="w-4 h-4 text-yellow-400" />
                          {client.goal || 'Definir Objetivo'}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                          <Mail className="w-4 h-4" />
                          {client.email}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                          <Phone className="w-4 h-4" />
                          {client.whatsapp}
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <Link 
                   to={`/organizer/trainer/workout/new?clientId=${client.id}`}
                   className="bg-yellow-400 text-slate-950 px-8 py-4 rounded-2xl font-black italic uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 hover:bg-yellow-300"
                 >
                    <Plus className="w-5 h-5" />
                    Montar Treino
                 </Link>
                 <button 
                    onClick={() => {
                       const url = `${window.location.origin}/atleta`;
                       navigator.clipboard.writeText(url);
                       alert('Link do Portal do Atleta copiado para compartilhar com o aluno!');
                    }}
                    className="bg-slate-900 border border-white/5 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors"
                    title="Copiar Link do Portal do Atleta"
                 >
                    <ExternalLink className="w-5 h-5 text-yellow-400" />
                 </button>
                 <button className="bg-slate-900 border border-white/5 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                 </button>
              </div>
           </div>

           {/* Tabs Navigation */}
           <div className="flex bg-slate-900/50 p-2 rounded-3xl border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => setActiveTab('treinos')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'treinos' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
                )}
              >
                Histórico de Treinos
              </button>
              <button 
                onClick={() => setActiveTab('consultorias')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'consultorias' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
                )}
              >
                Consultorias
              </button>
              <button 
                onClick={() => setActiveTab('evolucao')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'evolucao' ? "bg-yellow-400 text-slate-950 shadow-xl italic" : "text-slate-500 hover:text-white"
                )}
              >
                Evolução & Bio
              </button>
           </div>

           <div className="min-h-[400px]">
              {activeTab === 'treinos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {workouts.length === 0 ? (
                      <div className="md:col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                         <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nenhum treino registrado para este aluno.</p>
                      </div>
                   ) : (
                     workouts.map(workout => (
                       <div key={workout.id} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-yellow-400/20 transition-all group">
                          <div className="flex items-center justify-between mb-6">
                             <div className={cn(
                               "px-4 py-1 rounded-full text-[8px] font-black uppercase italic border",
                               workout.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/10" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/10"
                             )}>
                                {workout.status === 'completed' ? 'Finalizado' : 'Em Aberto'}
                             </div>
                             <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter italic">
                                {formatDate(workout.createdAt?.toDate ? workout.createdAt.toDate() : new Date())}
                             </span>
                          </div>
                          <h4 className="text-xl font-display font-black italic uppercase tracking-wider mb-2">{workout.title}</h4>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">{workout.division} • {formatGoal(workout.goal)}</p>
                          
                          <div className="space-y-3 mb-8">
                             {workout.exercises.slice(0, 3).map((ex, i) => (
                               <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                                  <span className="text-xs font-bold text-white uppercase italic">{ex.name}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ex.series}x{ex.reps}</span>
                               </div>
                             ))}
                             {workout.exercises.length > 3 && (
                               <p className="text-[9px] font-black text-slate-600 uppercase italic">+{workout.exercises.length - 3} outros exercícios...</p>
                             )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto">
                             <button className="text-yellow-400 text-[10px] font-black uppercase tracking-widest italic hover:underline">Detalhes</button>
                             <div className="flex flex-wrap gap-2">
                                {workout.exercises.some(e => e.videoUrl) && <Video className="w-4 h-4 text-slate-600" />}
                                {workout.notes && <FileText className="w-4 h-4 text-slate-600" />}
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                </div>
              )}

              {activeTab === 'consultorias' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between bg-slate-900/50 p-8 rounded-[2rem] border border-white/5">
                      <div>
                         <h3 className="text-xl font-display font-black italic uppercase tracking-wider mb-1">Próxima Sessão</h3>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nenhum agendamento futuro encontrado.</p>
                      </div>
                      <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                         Agendar Agora
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                      {consultations.map(consult => (
                        <div key={consult.id} className="bg-slate-900/30 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                                 <Calendar className="w-5 h-5 text-yellow-400" />
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{consult.date} • {consult.time}</div>
                                 <h5 className="font-display font-black uppercase italic text-sm tracking-widest">{consult.type}</h5>
                              </div>
                           </div>
                           <div className={cn(
                             "px-4 py-1 rounded-full text-[8px] font-black uppercase italic border",
                             consult.status === 'finished' ? "bg-green-500/10 text-green-500 border-green-500/10" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/10"
                           )}>
                              {consult.status}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'evolucao' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10">
                      <div className="flex items-center gap-3 mb-8">
                         <TrendingUp className="w-6 h-6 text-yellow-400" />
                         <h3 className="text-xl font-display font-black italic uppercase tracking-wider">Anotações do Personal</h3>
                      </div>
                      <textarea 
                        defaultValue={client.notes}
                        onBlur={async (e) => {
                          if (clientId) await updateDoc(doc(db, 'trainer_clients', clientId), { notes: e.target.value });
                        }}
                        placeholder="Escreva observações sobre a postura, limitações ou bio do aluno..."
                        className="w-full h-80 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-sm leading-relaxed text-slate-300 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                      />
                   </div>
                   
                   <div className="space-y-8">
                      <div className="bg-slate-900 p-8 rounded-[3.1rem] border border-white/5">
                         <h3 className="text-[11px] font-black uppercase tracking-widest italic text-slate-500 mb-6">Planos Vinculados</h3>
                         <div className="flex items-center justify-between bg-black/40 p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
                                  <BadgeAlert className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                  <div className="text-sm font-black italic uppercase text-white tracking-widest whitespace-nowrap">Consultoria Mensal</div>
                                  <div className="text-[9px] font-bold text-slate-500 uppercase">Validade: Indeterminada</div>
                               </div>
                            </div>
                            <span className="text-xl font-display font-black italic text-yellow-400">R$ 150</span>
                         </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-yellow-400/20 to-transparent p-10 rounded-[4rem] border border-yellow-400/10">
                         <h3 className="text-[11px] font-black uppercase tracking-widest italic text-white mb-4">Meta do Atleta</h3>
                         <p className="text-3xl font-display font-black italic uppercase tracking-tighter text-white leading-tight">
                            " {formatGoal(client.goal) || 'Transformar e superar limites.'} "
                          </p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter">Agendar Consultoria</h2>
                 <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Data</label>
                       <input 
                         required
                         type="date"
                         value={newConsult.date}
                         onChange={e => setNewConsult({...newConsult, date: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Horário</label>
                       <input 
                         required
                         type="time"
                         value={newConsult.time}
                         onChange={e => setNewConsult({...newConsult, time: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Tipo de Sessão</label>
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                       <button 
                         type="button"
                         onClick={() => setNewConsult({...newConsult, type: 'online'})}
                         className={cn(
                           "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                           newConsult.type === 'online' ? "bg-yellow-400 text-slate-950 shadow-lg" : "text-slate-500 hover:text-slate-400"
                         )}
                       >
                          Online (Meet/Zoom)
                       </button>
                       <button 
                         type="button"
                         onClick={() => setNewConsult({...newConsult, type: 'presencial'})}
                         className={cn(
                           "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                           newConsult.type === 'presencial' ? "bg-yellow-400 text-slate-950 shadow-lg" : "text-slate-500 hover:text-slate-400"
                         )}
                       >
                          Presencial
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Notas / Link</label>
                    <textarea 
                      value={newConsult.notes}
                      onChange={e => setNewConsult({...newConsult, notes: e.target.value})}
                      placeholder="Link da reunião ou local do encontro..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-yellow-400 text-slate-950 py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-15px_rgba(250,204,21,0.4)] hover:bg-yellow-300 transition-all active:scale-95"
                 >
                    Confirmar Agendamento
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;
